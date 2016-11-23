// third-party
const Bluebird = require('bluebird');

module.exports = function (happinessTree, rootModel, uiCore, options) {

  /**
   * Options for branch context menus
   * @type {Array}
   */
  var BRANCH_MENU_OPTIONS = [
    {
      label: happinessTree.translate('happiness-tree.new-file'),
      callback: function (data) {
        data.menuElement.close();

        var nodeModel = data.context;

        // first open the directory
        happinessTree.openDirectory(nodeModel.path)
          .then(function () {
            // create an editable placeholder element
            var placeholder = uiCore.addEditablePlaceholder({
              type: 'leaf',
              directoryPath: nodeModel.path,
              value: happinessTree.translate('happiness-tree.new-file-placeholder')
            });

            // activate edition
            placeholder.edit(function (value) {

              // in case an empty value is provided,
              // cancel
              if (value === '') {
                alert('filename must not be empty');
                placeholder.remove();
                return;
              }

              // create the file then remove
              nodeModel.fsCreateFile(value)
                .then(function () {
                  placeholder.remove();
                })
                .catch(function (err) {
                  alert('error creating file');
                  console.warn(err);
                  placeholder.remove();
                });
            });
          });
      }
    },
    {
      label: happinessTree.translate('happiness-tree.new-directory'),
      callback: function (data) {
        data.menuElement.close();
        var nodeModel = data.context;

        happinessTree.openDirectory(nodeModel.path)
          .then(function () {

            // create an editable placeholder element
            var placeholder = uiCore.addEditablePlaceholder({
              type: 'branch',
              directoryPath: nodeModel.path,
              value: happinessTree.translate('happiness-tree.new-directory-placeholder')
            });

            placeholder.edit(function (value) {
              if (value === '') {
                alert('filename must not be empty');
                placeholder.remove();
                return;
              }

              nodeModel.fsCreateDirectory(value)          
                .then(function () {
                  placeholder.remove();
                })
                .catch(function (err) {
                  alert('error creating file');
                  console.warn(err);
                  placeholder.remove();
                });
            })
          });
      }
    },
    {
      label: happinessTree.translate('happiness-tree.rename-directory'),
      callback: function (data) {
        data.menuElement.close();
        var nodeModel = data.context;

        var element = uiCore.getElement(nodeModel.path);
        var editableLabel = element.querySelector('hab-editable-label');

        editableLabel.edit(function (value) {
          if (value === '') {
            alert('name must not be empty');
            editableLabel.cancel();

            return;
          }

          return nodeModel.fsRename(value)
            .catch(function (err) {
              alert('error renaming');
              console.warn(err);

              editableLabel.cancel();
            });
        });
      }
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
