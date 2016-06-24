module.exports = function (rootModel, ui) {


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

  
  ui.addTreeEventListener('dragstart', 'branch', function (data) {
    // console.log('dragstart on branch', data.element, data.path);
    data.element.classList.remove(ui.DRAGGING);
  });

};