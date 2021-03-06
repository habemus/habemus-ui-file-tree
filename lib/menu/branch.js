// third-party
const Bluebird = require('bluebird');
const clipboard = require('clipboard-js');

module.exports = function (happinessTree, rootModel, uiCore, options) {

  var _t              = happinessTree.translate;
  var hDev            = happinessTree.hDev;
  var uiDialogs       = happinessTree.uiDialogs;
  var uiNotifications = happinessTree.uiNotifications;
  
  /**
   * Options for branch context menus
   * @type {Array}
   */
  var BRANCH_MENU_OPTIONS = [
    {
      group: 'new',
      label: _t('habemus-ui-file-tree.file.new'),
      callback: function (data) {
        data.menuElement.close();

        var nodeModel = data.context;

        return happinessTree.promptNewFile(nodeModel);
      }
    },
    {
      group: 'new',
      label: _t('habemus-ui-file-tree.directory.new'),
      callback: function (data) {
        data.menuElement.close();
        var nodeModel = data.context;

        return happinessTree.promptNewDirectory(nodeModel);
      }
    },
    {
      group: 'self',
      label: _t('habemus-ui-file-tree.directory.rename'),
      callback: function (data) {
        data.menuElement.close();
        var nodeModel = data.context;
        var currentName = nodeModel.name;

        var element = uiCore.getElement(nodeModel.path);
        var editableLabel = element.querySelector('hab-editable-label');

        editableLabel.edit(function (value) {
          if (value === '') {
            uiNotifications.error.show({
              text: _t('habemus-ui-file-tree.directory.rename-error.empty-name'),
              duration: 3000,
            });
            editableLabel.cancel();

            return;
          }

          if (value === currentName) {
            // no updates
            editableLabel.cancel();
            return;
          }

          uiNotifications.loading.show({
            text: _t('habemus-ui-file-tree.directory.rename-loading'),
            duration: Math.Infinity,
          });

          return nodeModel.fsRename(value)
            .then(function (res) {
              uiNotifications.loading.hide();
              uiNotifications.success.show({
                text: _t('habemus-ui-file-tree.directory.rename-success'),
                duration: 3000,
              });

              return res;
            })
            .catch(function (err) {
              uiNotifications.loading.hide();

              switch (err.name) {
                case 'PathExists':
                  uiDialogs.alert(
                    _t('habemus-ui-file-tree.directory.rename-error.path-exists')
                  );
                  break;
                default:
                  uiNotifications.error.show({
                    text: _t('habemus-ui-file-tree.directory.rename-error.general'),
                    duration: 3000,
                  });
                  break;
              }
              console.warn(err);

              editableLabel.cancel();
            });
        });
      }
    },
    {
      group: 'self',
      label: _t('habemus-ui-file-tree.directory.remove'),
      callback: function (data) {
        // close the context menu immediately
        data.menuElement.close();
        var nodeModel = data.context;

        var path = nodeModel.path;

        var msg = _t('habemus-ui-file-tree.directory.remove-confirm', {
          path: path,
        });

        uiDialogs.confirm(msg)
          .then(function confrmed() {

            uiNotifications.loading.show({
              text: _t('habemus-ui-file-tree.directory.remove-loading'),
              duration: Math.Infinity
            });

            return hDev.remove(path)
          })
          .then(function (res) {
            uiNotifications.loading.hide();
            uiNotifications.success.show({
              text: _t('habemus-ui-file-tree.directory.remove-success'),
              duration: 3000,
            });

            return res;
          })
          .catch(function (err) {
            if (err.canceled) {
              return;
            }

            uiNotifications.loading.hide();
            uiNotifications.error.show({
              text: _t('habemus-ui-file-tree.directory.remove-error.general'),
              duration: 3000,
            });
            console.warn(err);
          });
      }
    },
    {
      group: 'auxiliary',
      label: _t('habemus-ui-file-tree.directory.copy-path'),
      callback: function (data) {
        data.menuElement.close();
        var nodeModel = data.context;

        clipboard.copy(nodeModel.path)
          .then(function () {
            uiNotifications.success.show({
              text: _t('habemus-ui-file-tree.directory.copy-path-success', {
                path: nodeModel.path,
              }),
              duration: 3000,
            });
          });
      }
    },
    {
      group: 'new',
      label: 'upload',
      type: 'submenu',
      options: [
        {
          label: _t('habemus-ui-file-tree.directory.upload-file'),
          type: 'input:file',
          callback: function (data) {
            data.menuElement.close();
            var nodeModel = data.context;
            var basepath  = nodeModel.path;
    
            var files = data.files;
    
            if (!files) {
              return;
            }

            return happinessTree.upload.fromFilesArray(basepath, files);
          },
        },
        {
          label: _t('habemus-ui-file-tree.directory.upload-directory'),
          type: 'input:directory',
          callback: function (data) {
            data.menuElement.close();
            var nodeModel = data.context;
            var basepath  = nodeModel.path;
    
            var files = data.files;
    
            if (!files) {
              return;
            }

            return happinessTree.upload.fromWebkitDirectoryInput(basepath, files);
          },
        }
      ],
    },
  ];

  /**
   * Add the dirMenu that were passed
   */
  var CUSTOM;
  if (typeof options.dirMenu === 'function') {
    CUSTOM = options.dirMenu(happinessTree);
  } else if (Array.isArray(options.dirMenu)) {
    CUSTOM = options.dirMenu;
  }
  CUSTOM = CUSTOM || [];

  BRANCH_MENU_OPTIONS = BRANCH_MENU_OPTIONS.concat(CUSTOM);

  var branchMenu = document.createElement('hab-context-menu');
  branchMenu.set('optionGroups', [
    'new',
    'self',
    'auxiliary',
  ]);
  branchMenu.set('options', BRANCH_MENU_OPTIONS);
  document.body.appendChild(branchMenu);

  return branchMenu;
};
