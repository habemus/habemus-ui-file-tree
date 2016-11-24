// third-party
const clipboard = require('clipboard-js');

module.exports = function (happinessTree, rootModel, uiCore, options) {

  var _t        = happinessTree.translate;
  var hDev      = happinessTree.hDev;
  var uiDialogs = happinessTree.uiDialogs;

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

        var element = uiCore.getElement(nodeModel.path);
        var editableLabel = element.querySelector('hab-editable-label');

        editableLabel.edit(function (value) {
          if (value === '') {
            uiDialogs.alert('value must not be empty');
            editableLabel.cancel();

            return;
          }

          return nodeModel.fsRename(value)
            .catch(function (err) {
              uiDialogs.alert('error renaming');
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

        return Bluebird.all([
          uiDialogs.prompt(
            _t('happiness-tree.file.duplicate-prompt'),
            {
              submit: _t('happiness-tree.file.duplicate'),
              defaultValue: path + '-copy',
            }
          ),
          hDev.readFile(path),
        ])
        .then(function (results) {

          var targetPath = results[0];
          var contents   = results[1];

          if (!targetPath) {
            return Bluebird.reject(new Error('targetPath is required'));
          }

          return hDev.createFile(targetPath, contents);
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

            return hDev.remove(path);
          }, function cancelled() {
            console.log('removal cancelled by user');
          })
          .catch(function (err) {
            uiDialogs.alert('error removing');
            console.warn(err);
          });
      }
    },
    {
      label: _t('happiness-tree.file.copy-path'),
      callback: function (data) {
        data.menuElement.close();
        var nodeModel = data.context;

        clipboard.copy(nodeModel.path);
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
