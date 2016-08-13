const DND_FORMAT_NAME = 'text/plain';

module.exports = function (happinessTree, rootModel, uiCore, options) {

  /**
   * Variable that holds data about the current drag interaction.
   * .path refers to the dragged node path
   * .node refers to the dragged node itself
   *
   * It is used to store the dragged node path for use on 
   * 'dragover' events (dragover events do not have access to the dataTransfer's data)
   */
  var _currentDragData = {};

  /**
   * Auxiliary function that clears all drag-related classes from the ui
   * and resets the _currentDragData to null.
   */
  function _clearDrag() {

    // reset drag data
    _currentDragData = {};

    // on dragend, remove all drag-related classes
    var selector = [
      '.' + uiCore.DRAGGING,
      '.' + uiCore.DRAGOVER,
    ].join(',');

    var dragAffectedElements = uiCore.rootElement.parentNode.querySelectorAll(selector);
    
    Array.prototype.forEach.call(dragAffectedElements, function (el) {
      el.classList.remove(uiCore.DRAGGING);
      el.classList.remove(uiCore.DRAGOVER);
    });
  }

  /**
   * Drag start
   */
  uiCore.addTreeEventListener('dragstart', 'leaf', function (data) {
    // console.log('dragstart on leaf', data.element, data.path);
    data.element.classList.add(uiCore.DRAGGING);
    
    _currentDragData.node = data.model;
    _currentDragData.path = data.model.path;

    data.event.dataTransfer.effectAllowed = 'move';
    data.event.dataTransfer.setData(DND_FORMAT_NAME, _currentDragData.path);
  });

  uiCore.addTreeEventListener('dragstart', 'branch', function (data) {
    // console.log('dragstart on branch', data.element, data.path);
    data.element.classList.add(uiCore.DRAGGING);

    _currentDragData.node = data.model;
    _currentDragData.path = data.model.path;

    data.event.dataTransfer.effectAllowed = 'move';
    data.event.dataTransfer.setData(DND_FORMAT_NAME, _currentDragData.path);
  });

  /**
   * Clear all status on drag end
   */
  uiCore.rootElement.addEventListener('dragend', _clearDrag);
  
  /**
   * Dragover and dragleave
   */
  uiCore.addTreeEventListener(
    'dragover',
    // listen both on branch and leaf
    ['branch', 'leaf'],
    function (data) {
      /**
       * Dragover: cancel the event, so that we can do drop
       * (weird, but that's how it works according to docs)
       * http://www.html5rocks.com/en/tutorials/dnd/basics/
       */
      if (data.event.preventDefault) {
        data.event.preventDefault(); // Necessary. Allows us to drop.
      }

      var closestBranchModel = data.closestBranchModel;

      // check if the hovered model is the dragged node itself or 
      // if it has the dragged node as an ancestor
      // and prohibit that drop
      var draggedNode = _currentDragData.node;

      if (closestBranchModel.hasAncestor(draggedNode) || closestBranchModel === draggedNode) {
        // not allowed
        return;
      } else if (closestBranchModel === draggedNode.parent) {
        // no change
        return;
      } else {
        // we should add the DRAGOVER class to the branch element
        var branchElement = uiCore.getElement(closestBranchModel.path);

        branchElement.classList.add(uiCore.DRAGOVER);
      }
    }
  );

  uiCore.addTreeEventListener(
    'dragleave',
    // listen both on branch and leaf
    ['branch', 'leaf'],
    function (data) {
      // we should remove the DRAGOVER class from the branch element
      var branchElement = uiCore.getElement(data.closestBranchModel.path);
      
      branchElement.classList.remove(uiCore.DRAGOVER);
    }
  );

  /**
   * Drop
   */
  uiCore.addTreeEventListener(
    'drop',
    ['branch-label', 'branch', 'leaf-label', 'leaf'],
    function (data) {
      data.event.stopPropagation(); // stops the browser from redirecting.


      // the destination is related to the event drop target
      var closestBranchModel = data.closestBranchModel;

      // check if the hovered model is the dragged node itself or 
      // if it has the dragged node as an ancestor
      // and prohibit that drop
      var draggedNodePath = data.event.dataTransfer.getData(DND_FORMAT_NAME);
      var draggedNode     = rootModel.getNodeByPath(draggedNodePath);

      if (closestBranchModel.hasAncestor(draggedNode) || closestBranchModel === draggedNode) {
        // not allowed
      } else if (closestBranchModel === draggedNode.parent) {
        // will have no effect, as the dragged node is already at the right position
      } else {

        rootModel.fsMove(draggedNode, closestBranchModel)
          .then(function () {
            _clearDrag();
          })
          .catch(function (err) {
            console.warn(err);
            console.warn(err.stack);

            alert('there was an error moving!');
          });
      }
    }
  );
};
