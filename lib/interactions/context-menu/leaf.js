// third-party
const Bluebird  = require('bluebird');
const clipboard = require('clipboard-js');

// constants
const STARTING_SLASH_RE = /^\//;
const FILENAME_RE = /(.+?)(\.[^.]*$)/;

module.exports = function (happinessTree, rootModel, uiCore, options) {

  var _t              = happinessTree.translate;
  var hDev            = happinessTree.hDev;
  var uiDialogs       = happinessTree.uiDialogs;
  var uiNotifications = happinessTree.uiNotifications;

  /**
   * Options for leaf context menus
   * @type {Array}
   */
  var LEAF_MENU_OPTIONS = [
    {
      label: _t('happiness-tree.file.rename'),
      callback: function (data) {
        data.menuElement.close();
        var nodeModel = data.context;
        var currentName = nodeModel.name;

        var element = uiCore.getElement(nodeModel.path);
        var editableLabel = element.querySelector('hab-editable-label');

        var editOptions = {
          // In case an extension exists, select file name only 
          // otherwise select the whole string
          // http://stackoverflow.com/questions/624870/regex-get-filename-without-extension-in-one-shot
          selectionRange: FILENAME_RE,
        };

        editableLabel.edit(editOptions, function (value) {
          if (value === '') {
            uiNotifications.error.show({
              text: _t('happiness-tree.file.rename-error.empty-name'),
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
            text: _t('happiness-tree.file.rename-loading'),
            duration: Math.Infinity,
          });

          return nodeModel.fsRename(value)
            .then(function (res) {
              uiNotifications.loading.hide();
              uiNotifications.success.show({
                text: _t('happiness-tree.file.rename-success'),
                duration: 3000,
              });

              return res;
            })
            .catch(function (err) {
              uiNotifications.loading.hide();

              switch (err.name) {
                case 'PathExists':
                  uiDialogs.alert(
                    _t('happiness-tree.file.rename-error.path-exists')
                  );
                  break;
                default:
                  uiNotifications.error.show({
                    text: _t('happiness-tree.file.rename-error.general'),
                    duration: 3000,
                  });
                  break;
              }

              console.warn(err);

              editableLabel.cancel();
            });
        });
      },
    },
    {
      label: _t('happiness-tree.file.duplicate'),
      callback: function (data) {
        data.menuElement.close();
        var nodeModel = data.context;

        var path = nodeModel.path;
        var pathMatch = path.replace(STARTING_SLASH_RE, '').match(FILENAME_RE);

        var duplicateDefaultPath = pathMatch ?
          pathMatch[1] + '-copy' + pathMatch[2] :
          path.replace(STARTING_SLASH_RE, '') + '-copy';
        duplicateDefaultPath = '/' + duplicateDefaultPath;

        // target path will be used accross promises
        var _targetPath;

        return Bluebird.all([
          uiDialogs.prompt(
            _t('happiness-tree.file.duplicate-prompt'),
            {
              submit: _t('happiness-tree.file.duplicate'),
              defaultValue: duplicateDefaultPath
            }
          ),
          hDev.readFile(path),
        ])
        .then(function (results) {

          var targetPath = _targetPath = results[0];
          var contents   = results[1];

          if (!targetPath) {
            return Bluebird.reject(new Error('targetPath is required'));
          }

          uiNotifications.loading.show({
            text: _t('happiness-tree.file.duplicate-loading'),
            duration: Math.Infinity,
          });

          return hDev.createFile(targetPath, contents);
        })
        .then(function (res) {
          uiNotifications.loading.hide();
          uiNotifications.success.show({
            text: _t('happiness-tree.file.duplicate-success'),
            duration: 3000,
          });

          // reveal the path of the newly duplicated file
          happinessTree.revealPath(_targetPath);

          return res;
        })
        .catch(function (err) {

          if (err.canceled) {
            return;
          }

          uiNotifications.loading.hide();
          uiNotifications.error.show({
            text: _t('happiness-tree.file.duplicate-error.general'),
            duration: 3000,
          });
          console.warn(err);
        });
      }
    },
    {
      label: _t('happiness-tree.file.remove'),
      callback: function (data) {
        data.menuElement.close();
        var nodeModel = data.context;

        var path = nodeModel.path;

        var msg = _t('happiness-tree.file.remove-confirm', {
          path: path,
        });

        uiDialogs.confirm(msg)
          .then(function confrmed() {

            uiNotifications.loading.show({
              text: _t('happiness-tree.file.remove-loading'),
              duration: Math.Infinity
            });

            return hDev.remove(path);
          })
          .then(function (res) {
            uiNotifications.loading.hide();
            uiNotifications.success.show({
              text: _t('happiness-tree.file.remove-success'),
              duration: 3000,
            });

            return res;
          })
          .catch(function (err) {

            if (err.canceled) {
              // user canceled
              return;
            }

            uiNotifications.loading.hide();
            uiNotifications.error.show({
              text: _t('happiness-tree.file.remove-error.general'),
              duration: 3000,
            });
            console.warn(err);
          });
      }
    },
    {
      label: _t('happiness-tree.file.copy-path'),
      callback: function (data) {
        data.menuElement.close();
        var nodeModel = data.context;

        clipboard.copy(nodeModel.path)
          .then(function () {
            uiNotifications.success.show({
              text: _t('happiness-tree.file.copy-path-success', {
                path: nodeModel.path,
              }),
              duration: 3000,
            });
          });
      }
    },
    {
      label: _t('happiness-tree.file.open-in-new-tab'),
      type: 'url',
      target: '_blank',
      url: function (data) {
        var nodeModel = data.context;

        // TODO: deprecate getURL
        return nodeModel.getURL();
      }
    },
  ];

  /**
   * Add the fileMenu that were passed
   */
  var CUSTOM;
  if (typeof options.fileMenu === 'function') {
    CUSTOM = options.fileMenu(happinessTree);
  } else if (Array.isArray(options.fileMenu)) {
    CUSTOM = options.fileMenu;
  }
  CUSTOM = CUSTOM || [];

  LEAF_MENU_OPTIONS = LEAF_MENU_OPTIONS.concat(CUSTOM);

  var leafMenu = document.createElement('hab-context-menu');
  leafMenu.set('options', LEAF_MENU_OPTIONS);
  document.body.appendChild(leafMenu);

  uiCore.addTreeEventListener('contextmenu', 'leaf', function (data) {

    // prevent default
    data.event.preventDefault();
    
    // select the branch element
    uiCore.uiSelectElement(data.element, { clearSelection: true });

    // offset the context menu open position
    var left = data.event.clientX + 3;
    var top = data.event.clientY - 2;

    var position = {
      left: left,
      top: top,
    };

    leafMenu.menuOpenWithContext(data.model, position);
  });
};
