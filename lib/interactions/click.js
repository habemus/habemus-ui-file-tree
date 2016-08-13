// third-party
const Bluebird = require('bluebird');

module.exports = function (happinessTree, rootModel, uiCore, options) {
  /**
   * Select on click
   */
  uiCore.addTreeEventListener('click', 'leaf', function (data) {
    var leafEl = data.element;

    uiCore.uiSelectElement(leafEl, {
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
  uiCore.addTreeEventListener('click', 'branch', function (data) {
    var branchModel = data.model;
    var branchEl    = data.element;
    
    if (branchModel.status !== 'loaded') {

      branchEl.classList.add(uiCore.LOADING);

      branchModel.fsRead()
        .then(function () {
          branchEl.classList.remove(uiCore.LOADING);

          // reveal branch contents
          uiCore.uiToggleBranchElement(branchEl, true);
        })
        .catch(function (err) {
          branchEl.classList.remove(uiCore.LOADING);

          console.warn('there was an error loading', err);
        });
    } else {
      // toggle the branch
      uiCore.uiToggleBranchElement(branchEl);
    }
  });

};
