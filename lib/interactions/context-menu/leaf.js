module.exports = function (happinessTree, rootModel, uiCore, options) {

  /**
   * Options for leaf context menus
   * @type {Array}
   */
  var LEAF_MENU_OPTIONS = [
    {
      label: 'rename',
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
  var _fileMenu;
  if (typeof options.fileMenu === 'function') {
    _fileMenu = options.fileMenu(happinessTree);
  } else if (Array.isArray(options.fileMenu)) {
    _fileMenu = options.fileMenu;
  }
  _fileMenu = _fileMenu || [];

  LEAF_MENU_OPTIONS = LEAF_MENU_OPTIONS.concat(_fileMenu);

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
