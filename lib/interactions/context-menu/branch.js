// third-party
const Bluebird = require('bluebird');
const clipboard = require('clipboard-js');

module.exports = function (happinessTree, rootModel, uiCore, options) {

  var _t              = happinessTree.translate;
  var hDev            = happinessTree.hDev;
  var uiDialogs       = happinessTree.uiDialogs;
  var uiNotifications = happinessTree.uiNotifications;

  var upload = require('../../lib/upload')(
    happinessTree,
    rootModel,
    uiCore,
    options
  );

  /**
   * Options for branch context menus
   * @type {Array}
   */
  var BRANCH_MENU_OPTIONS = [
    {
      label: _t('happiness-tree.file.new'),
      callback: function (data) {
        data.menuElement.close();

        var nodeModel = data.context;

        return happinessTree.promptNewFile(nodeModel);
      }
    },
    {
      label: _t('happiness-tree.directory.new'),
      callback: function (data) {
        data.menuElement.close();
        var nodeModel = data.context;

        return happinessTree.promptNewDirectory(nodeModel);
      }
    },
    {
      label: _t('happiness-tree.directory.rename'),
      callback: function (data) {
        data.menuElement.close();
        var nodeModel = data.context;
        var currentName = nodeModel.name;

        var element = uiCore.getElement(nodeModel.path);
        var editableLabel = element.querySelector('hab-editable-label');

        editableLabel.edit(function (value) {
          if (value === '') {
            uiNotifications.error.show({
              text: _t('happiness-tree.directory.rename-error.empty-name'),
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
            text: _t('happiness-tree.directory.rename-loading'),
            duration: Math.Infinity,
          });

          return nodeModel.fsRename(value)
            .then(function (res) {
              uiNotifications.loading.hide();
              uiNotifications.success.show({
                text: _t('happiness-tree.directory.rename-success'),
                duration: 3000,
              });

              return res;
            })
            .catch(function (err) {
              uiNotifications.loading.hide();

              switch (err.name) {
                case 'PathExists':
                  uiDialogs.alert(
                    _t('happiness-tree.directory.rename-error.path-exists')
                  );
                  break;
                default:
                  uiNotifications.error.show({
                    text: _t('happiness-tree.directory.rename-error.general'),
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
      label: _t('happiness-tree.directory.remove'),
      callback: function (data) {
        // close the context menu immediately
        data.menuElement.close();
        var nodeModel = data.context;

        var path = nodeModel.path;

        var msg = _t('happiness-tree.directory.remove-confirm', {
          path: path,
        });

        uiDialogs.confirm(msg)
          .then(function confrmed() {

            uiNotifications.loading.show({
              text: _t('happiness-tree.directory.remove-loading'),
              duration: Math.Infinity
            });

            return hDev.remove(path)
          })
          .then(function (res) {
            uiNotifications.loading.hide();
            uiNotifications.success.show({
              text: _t('happiness-tree.directory.remove-success'),
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
              text: _t('happiness-tree.directory.remove-error.general'),
              duration: 3000,
            });
            console.warn(err);
          });
      }
    },
    {
      label: _t('happiness-tree.directory.copy-path'),
      callback: function (data) {
        data.menuElement.close();
        var nodeModel = data.context;

        clipboard.copy(nodeModel.path)
          .then(function () {
            uiNotifications.success.show({
              text: _t('happiness-tree.directory.copy-path-success', {
                path: nodeModel.path,
              }),
              duration: 3000,
            });
          });
      }
    },
    {
      label: 'upload',
      type: 'submenu',
      options: [
        {
          label: _t('happiness-tree.directory.upload-file'),
          type: 'input:file',
          callback: function (data) {
            data.menuElement.close();
            var nodeModel = data.context;
            var basepath  = nodeModel.path;
    
            var files = data.files;
    
            if (!files) {
              return;
            }
    
            return upload.fromFilesArray(basepath, files);
          },
        },
        {
          label: _t('happiness-tree.directory.upload-directory'),
          type: 'input:directory',
          callback: function (data) {
            data.menuElement.close();
            var nodeModel = data.context;
            var basepath  = nodeModel.path;
    
            var files = data.files;
    
            if (!files) {
              return;
            }
    
            // TODO: study best abstraction for files
            // we must do the upload manually here
            // due to the fact that we need to  use webkitRelativePath property
            return files.reduce(function (lastUploadPromise, file) {
              
              return lastUploadPromise.then(function () {
    
                var filename = file.webkitRelativePath ? file.webkitRelativePath : file.name;
    
                return upload.single(
                  basepath + '/' + filename,
                  file
                );
              });
    
            }, Bluebird.resolve())
            .then(function () {
    
              uiNotifications.success.show({
                text: _t('happiness-tree.upload.all-files-succeeded'),
                duration: 3000,
              });
    
              return;
            });;
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
  branchMenu.set('options', BRANCH_MENU_OPTIONS);
  document.body.appendChild(branchMenu);

  uiCore.addTreeEventListener('contextmenu', 'branch', function (data) {

    // prevent default
    data.event.preventDefault();

    // select the branch element
    uiCore.uiSelectElement(data.element, { clearSelection: true });

    // offset the context menu open position
    var left = data.event.clientX + 2;
    var top = data.event.clientY - 2;

    var position = {
      left: left,
      top: top,
    };

    branchMenu.menuOpenWithContext(data.model, position);
  });
};
