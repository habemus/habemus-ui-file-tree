module.exports = function (rootModel, ui) {

  /**
   * Auxiliary function that clears the selected class from labels
   */
  function _clearSelected() {
    var selected = ui.rootElement.querySelectorAll('.' + ui.SELECTED);

    Array.prototype.forEach.call(selected, function (el) {
      el.classList.remove(ui.SELECTED);
    });
  }

  /**
   * Select on click
   */
  ui.addTreeEventListener('click', 'leaf', function (data) {
    var leafEl = data.element;

    _clearSelected();
    leafEl.classList.add(ui.SELECTED);
  });

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
  ui.addTreeEventListener('click', 'branch', function (data) {
    var branchModel = data.model;
    var branchEl    = data.element;

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

};
