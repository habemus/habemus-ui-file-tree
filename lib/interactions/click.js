module.exports = function (rootModel, ui) {
  /**
   * Select on click
   */
  ui.addTreeEventListener('click', 'leaf', function (data) {
    var leafEl = data.element;

    ui.uiSelectElement(leafEl, {
      // clear previous selection
      clearSelection: true,
    });
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
    
    if (branchModel.status !== 'loaded') {

      branchEl.classList.add(ui.LOADING);

      branchModel.fsRead()
        .then(function () {
          branchEl.classList.remove(ui.LOADING);

          // reveal branch contents
          ui.uiToggleBranchElement(branchEl, true);
        })
        .catch(function (err) {
          console.warn('there was an error loading', err);
          return Bluebird.reject();
        });
    } else {
      // toggle the branch
      ui.uiToggleBranchElement(branchEl);
    }
  });

};
