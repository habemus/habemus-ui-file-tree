const DND_FORMAT_NAME = 'nodepath';

module.exports = function (rootModel, ui) {

  /**
   * Auxiliary function that clears all drag-related classes from the ui
   */
  function _clearDragStatuses() {

    // on dragend, remove all drag-related classes
    var selector = [
      '.' + ui.DRAGGING,
      '.' + ui.DRAGOVER,
    ].join(',');

    var dragAffectedElements = ui.rootElement.parentNode.querySelectorAll(selector);
    
    Array.prototype.forEach.call(dragAffectedElements, function (el) {
      el.classList.remove(ui.DRAGGING);
      el.classList.remove(ui.DRAGOVER);
    });
  }

  /**
   * Drag start
   */
  ui.addTreeEventListener('dragstart', 'leaf', function (data) {
    // console.log('dragstart on leaf', data.element, data.path);
    data.element.classList.add(ui.DRAGGING);
    
    data.event.dataTransfer.effectAllowed = 'move';
    data.event.dataTransfer.setData(DND_FORMAT_NAME, data.model.path);
  });

  ui.addTreeEventListener('dragstart', 'branch', function (data) {
    // console.log('dragstart on branch', data.element, data.path);
    data.element.classList.add(ui.DRAGGING);

    data.event.dataTransfer.effectAllowed = 'move';
    data.event.dataTransfer.setData(DND_FORMAT_NAME, data.model.path);
  });

  /**
   * Clear all status on drag end
   */
  ui.rootElement.addEventListener('dragend', _clearDragStatuses);
  
  /**
   * Dragover and dragleave
   */
  ui.addTreeEventListener(
    'dragover',
    // listen both on branch and leaf
    ['branch', 'leaf'],
    function (data) {

      var closestBranchModel = data.closestBranchModel;

      // check if the hovered model is the dragged node itself or 
      // if it has the dragged node as an ancestor
      // and prohibit that drop
      var draggedNodePath = data.event.dataTransfer.getData(DND_FORMAT_NAME);
      var draggedNode     = rootModel.getNodeByPath(draggedNodePath);

      if (closestBranchModel.hasAncestor(draggedNode) || closestBranchModel === draggedNode) {
        // not allowed
        return;
      } else if (closestBranchModel === draggedNode.parent) {
        // no change
        return;
      } else {
        // we should add the DRAGOVER class to the branch element
        var branchElement = ui.getElement(closestBranchModel.path);

        branchElement.classList.add(ui.DRAGOVER);
      }
    }
  );

  ui.addTreeEventListener(
    'dragleave',
    // listen both on branch and leaf
    ['branch', 'leaf'],
    function (data) {
      // we should remove the DRAGOVER class from the branch element
      var branchElement = ui.getElement(data.closestBranchModel.path);
      
      branchElement.classList.remove(ui.DRAGOVER);
    }
  );

  /**
   * Drop
   */
  ui.addTreeEventListener(
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
            _clearDragStatuses();
          })
          .catch(function (err) {
            console.warn(err);

            alert('there was an error moving!');
          });
      }
    }
  );

  /**
   * Dragover: cancel the event, so that we can do drop
   * (weird, but that's how it works according to docs)
   * http://www.html5rocks.com/en/tutorials/dnd/basics/
   */
  ui.addTreeEventListener(
    'dragover',
    // cancel dragover on branches and branch labels
    ['branch', 'leaf'],
    function (data) {
      // console.log('dragover ', data.path)

      if (data.event.preventDefault) {
        data.event.preventDefault(); // Necessary. Allows us to drop.
      }

      return false;
    }
  );
};
