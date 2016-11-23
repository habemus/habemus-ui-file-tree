module.exports = function (happinessTree, rootModel, uiCore, options) {

  /**
   * Options for leaf context menus
   * @type {Array}
   */
  var LEAF_MENU_OPTIONS = [
    {
      label: happinessTree.translate('happiness-tree.rename-file'),
      callback: function (data) {
        data.menuElement.close();
        var nodeModel = data.context;

        var element = uiCore.getElement(nodeModel.path);
        var editableLabel = element.querySelector('hab-editable-label');

        editableLabel.edit(function (value) {
          if (value === '') {
            alert('value must not be empty');
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
