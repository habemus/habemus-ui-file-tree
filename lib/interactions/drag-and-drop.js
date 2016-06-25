const DND_FORMAT_NAME = 'nodepath';

module.exports = function (rootModel, ui) {

  /**
   * Auxiliary function that clears the selected class from labels
   * @return {[type]} [description]
   */
  function _clearSelected() {
    var selected = ui.rootElement.querySelectorAll('.' + ui.SELECTED);

    Array.prototype.forEach.call(selected, function (el) {
      el.classList.remove(ui.SELECTED);
    });
  }

  ui.addTreeEventListener('click', 'leaf-label', function (data) {

    var leafModel = data.model;

    var leafEl = ui.getElement('leaf', leafModel.path);

    _clearSelected();
    leafEl.classList.add(ui.SELECTED);
  })

  /**
   * Handle click on branch labels
   *
   * Load the branch's child nodes and open.
   * If data is already loaded, simply toggle.
   * 
   * @param {Object} data
   *        - path
   *        - element
   */
  ui.addTreeEventListener('click', 'branch-label', function (data) {
    var branchModel = (data.path === '') ? rootModel : rootModel.getNodeByPath(data.path);
    var branchEl    = ui.getElement('branch', data.path);

    if (!branchModel.loaded) {

      branchEl.classList.add(ui.LOADING);

      branchModel.loadChildren()
        .then(function () {
          branchEl.classList.remove(ui.LOADING);
          branchModel.set('loaded', true);

          // reveal
          branchEl.classList.remove(ui.BRANCH_COLLAPSED);
        })
        .catch(function (err) {
          console.warn('there was an error loading', err);
          return Bluebird.reject();
        });
    } else {

      branchEl.classList.toggle(ui.BRANCH_COLLAPSED);

    }
  });

  /**
   * Drag start
   */
  ui.addTreeEventListener('dragstart', 'leaf', function (data) {

    data.element.classList.add(ui.DRAGGING);

    // console.log('dragstart on leaf', data.element, data.path);
    
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

  ui.rootElement.addEventListener('dragend', _clearDragStatuses);
  

  /**
   * Dragover and dragleave ON LABELS
   */
  ui.addTreeEventListener(
    'dragover',
    // listen both on branch-label and leaf-label
    ['branch-label', 'leaf-label', 'branch', 'leaf'],
    function (data) {

      // we should add the DRAGOVER class to the branch element
      // not to the branch-label 
      var branchElement = ui.getElement('branch', data.closestBranchModel.path);

      branchElement.classList.add(ui.DRAGOVER);
    }
  );

  ui.addTreeEventListener(
    'dragleave',
    // listen both on branch-label and leaf-label
    ['branch-label', 'leaf-label', 'branch', 'leaf'],
    function (data) {
      // we should remove the DRAGOVER class from the branch element
      // not to the branch-label 
      var branchElement = ui.getElement('branch', data.closestBranchModel.path);
      
      branchElement.classList.remove(ui.DRAGOVER);
    }
  );

  ui.addTreeEventListener(
    'drop',
    ['branch-label', 'branch', 'leaf-label', 'leaf'],
    function (data) {
      data.event.stopPropagation(); // stops the browser from redirecting.

      var destPath  = data.closestBranchModel.path;
      var destModel = data.closestBranchModel;

      var srcPath  = data.event.dataTransfer.getData(DND_FORMAT_NAME);
      var srcModel = rootModel.getNodeByPath(srcPath);

      console.log('move ' + srcPath + ' to ' + destPath);

      rootModel.moveNode(srcPath, destPath);

      // // remove from parent
      // srcModel.parent.removeChild(srcModel.name);

      // // add to destination
      // destModel.addChild(srcModel);

      _clearDragStatuses();
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
    ['branch-label', 'branch', 'leaf-label', 'leaf'],
    function (data) {

      // console.log('dragover ', data.path)

      if (data.event.preventDefault) {
        data.event.preventDefault(); // Necessary. Allows us to drop.
      }

      // e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

      return false;
    }
  )
};
