// third-party
const browserParseFiles = require('browser-parse-files');

// constants
const HAPPINESS_TREE_DND_FORMAT_NAME = 'text/x-happiness-tree';

module.exports = function (happinessTree, rootModel, uiCore, options) {

  var _t              = happinessTree.translate;
  var uiNotifications = happinessTree.uiNotifications;

  var upload = require('../lib/upload')(
    happinessTree,
    rootModel,
    uiCore,
    options
  );

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
    data.event.dataTransfer.setData(HAPPINESS_TREE_DND_FORMAT_NAME, _currentDragData.path);
  });

  uiCore.addTreeEventListener('dragstart', 'branch', function (data) {
    // console.log('dragstart on branch', data.element, data.path);
    data.element.classList.add(uiCore.DRAGGING);

    _currentDragData.node = data.model;
    _currentDragData.path = data.model.path;

    data.event.dataTransfer.effectAllowed = 'move';
    data.event.dataTransfer.setData(HAPPINESS_TREE_DND_FORMAT_NAME, _currentDragData.path);
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

      if (!draggedNode) {
        // the dragover event does not refer to
        // a node dragging, but from an alien dragging:
        // possibly a file drop
        var branchElement = uiCore.getElement(closestBranchModel.path);

        branchElement.classList.add(uiCore.DRAGOVER);


      } else if (closestBranchModel.hasAncestor(draggedNode) || closestBranchModel === draggedNode) {
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
   * Happiness tree node drop
   */
  uiCore.addTreeEventListener(
    'drop',
    ['branch-label', 'branch', 'leaf-label', 'leaf'],
    function (data) {
      data.event.stopPropagation(); // stops the browser from redirecting.
      data.event.preventDefault();

      // the destination is related to the event drop target
      var closestBranchModel = data.closestBranchModel;

      // check if the hovered model is the dragged node itself or 
      // if it has the dragged node as an ancestor
      // and prohibit that drop
      var draggedNodePath = data.event.dataTransfer.getData(HAPPINESS_TREE_DND_FORMAT_NAME);

      if (!draggedNodePath) {
        // no data 
        _clearDrag();
        return;
      }

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

            var errorMessage = draggedNode.isBranch ?
              _t('happiness-tree.directory.error-moving', {
                directoryName: draggedNodePath,
              }) :
              _t('happiness-tree.file.error-moving', {
                fileName: draggedNodePath
              });

            uiNotifications.error.show({
              text: errorMessage,
              duration: 5000,
            });
          });
      }
    }
  );
  
  /**
   * File drop
   */
  uiCore.addTreeEventListener(
    'drop',
    ['branch-label', 'branch', 'leaf-label', 'leaf'],
    function (data) {
      data.event.stopPropagation(); // stops the browser from redirecting.
      data.event.preventDefault();

      // the destination is related to the event drop target
      var closestBranchModel = data.closestBranchModel;

      if (data.event.dataTransfer.files.length === 0) {
        // no files dropped
        return;
      }

      upload.fromDropEvent(closestBranchModel.path, data.event)
        .then(function () {
          console.log('successfully all uploaded');
        });

      // browserParseFiles.fromDropEvent(data.event)
      //   .then(function (parsed) {
      //     console.log(parsed)
      //   });
    }
  );
};
