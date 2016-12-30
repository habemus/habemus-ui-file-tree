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
  var _currentDragData = {
    path: undefined,
    node: undefined,

    dragoverNode: undefined,
    dragoverNodeChangedAt: undefined,
  };

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
   
  // leaf dragstart
  uiCore.addTreeEventListener('dragstart', 'leaf', function (data) {
    // console.log('dragstart on leaf', data.element, data.path);
    data.element.classList.add(uiCore.DRAGGING);
    
    _currentDragData.node = data.model;
    _currentDragData.path = data.model.path;

    data.event.dataTransfer.effectAllowed = 'move';
    data.event.dataTransfer.setData(HAPPINESS_TREE_DND_FORMAT_NAME, _currentDragData.path);
  });
  
  // branch dragstart
  uiCore.addTreeEventListener('dragstart', 'branch', function (data) {
    // console.log('dragstart on branch', data.element, data.path);
    data.element.classList.add(uiCore.DRAGGING);

    _currentDragData.node = data.model;
    _currentDragData.path = data.model.path;
    
    data.event.dataTransfer.effectAllowed = 'move';
    data.event.dataTransfer.setData(HAPPINESS_TREE_DND_FORMAT_NAME, _currentDragData.path);
  });
  
  // TODO: check if setDragImage is required at all.
  // shared dragstart
  // uiCore.addTreeEventListener('dragstart', ['leaf', 'branch'], function (data) {
    
    
  //   // setDragImage accepts any html DOM element
  //   // but uses its styles to render the image.
  //   // The main issue is that as we are using `position: relative`
  //   // in the container node, the image rendered appears always hidden.
  //   // we need to create a clone of the dragged element and set it as the
  //   // drag image
    
  //   var dragImage = data.element;
    
  //   dragImage.style.position = 'relative';
  //   dragImage.style.zIndex = '4';
    
  //   data.event.dataTransfer.setDragImage(dragImage, 0, 0);
  // })

  /**
   * Clear all status on drag end
   */
  uiCore.rootElement.addEventListener('dragend', _clearDrag);
  
  /**
   * Dragover
   *
   * The dragover may refer to 'happiness-tree' dragover (node-dragging)
   * or file/directory drag and drop.
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

  /**
   * Delayed dragover branch
   * Uses _currentDragData.dragoverNode and _currentDragData.dragoverNodeChangedAt
   * to calculate whether the same node has been dragged over
   * which indicates that the user has the intention
   * of opening the given node.
   */
  uiCore.addTreeEventListener(
    'dragover',
    ['branch', 'leaf'],
    function (data) {

      var closestBranchModel = data.closestBranchModel;
      var closestBranchEl = uiCore.getElement(closestBranchModel.path);

      if (_currentDragData.dragoverNode !== closestBranchModel) {

        // node just changed
        _currentDragData.dragoverNode = closestBranchModel;
        _currentDragData.dragoverNodeChangedAt = Date.now();

        return;
      }

      if (Date.now() - _currentDragData.dragoverNodeChangedAt < 700) {
        // not enough time
        return;
      }

      if (closestBranchModel.status !== 'loaded') {

        closestBranchEl.classList.add(uiCore.LOADING);

        closestBranchModel.fsRead()
          .then(function () {
            closestBranchEl.classList.remove(uiCore.LOADING);

            // reveal branch contents
            uiCore.uiToggleBranchElement(closestBranchEl, true);
          })
          .catch(function (err) {
            closestBranchEl.classList.remove(uiCore.LOADING);

            happinessTree.uiNotifications.error.show({
              text: _t('happiness-tree.directory.error-reading', {
                directoryPath: closestBranchModel.path,
              }),
              duration: 5000
            });
          });
      } else {
        // toggle the branch
        uiCore.uiToggleBranchElement(closestBranchEl, true);
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

        var loadingMessage = draggedNode.isBranch ?
          _t('happiness-tree.directory.move-loading') :
          _t('happiness-tree.file.move-loading');

        uiNotifications.loading.show({
          text: loadingMessage,
          duration: Math.Infinity,
        });

        var targetPath = closestBranchModel.path + '/' + draggedNode.name;

        rootModel.fsMove(draggedNode, closestBranchModel)
          .then(function () {
            _clearDrag();
            uiNotifications.loading.hide();
            happinessTree.revealPath(targetPath);
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
