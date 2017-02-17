module.exports = function (happinessTree, rootModel, uiCore, options) {

  /**
   * Branch contextmenu event
   */
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

    happinessTree.menu.branch.menuOpenWithContext(data.model, position);
  });

  /**
   * Leaf contextmenu event
   */
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

    happinessTree.menu.leaf.menuOpenWithContext(data.model, position);
  });
};
