// third-party
const Bluebird = require('bluebird');

module.exports = function (happinessTree, rootModel, uiCore, options) {
  
  /**
   * Whether to enable preload or not
   * @type {Boolean}
   */
  var enablePreload = happinessTree.config.enablePreload || false;

  var _t              = happinessTree.translate;
  var uiNotifications = happinessTree.uiNotifications;

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

    // TODO: centralize branch loading and toggling logic somewhere.
    // being duplicated by drag and drop interaction at 'delayed dragover'
    
    if (branchModel.status !== 'loaded') {

      branchEl.classList.add(uiCore.LOADING);

      branchModel.fsRead()
        .then(function () {
          branchEl.classList.remove(uiCore.LOADING);

          // reveal branch contents
          uiCore.uiToggleBranchElement(branchEl, true);

          // if preload is enabled, preload child directories
          if (enablePreload) {

            branchModel.childNodes.forEach(function (childNode) {
              if (childNode.status !== 'loaded' &&
                  childNode.status !== 'loading' &&
                  childNode.isBranch &&
                  childNode.fsRead) {
                happinessTree.preloader.preload(
                  'readDirectory:' + childNode.path,
                  childNode.fsRead.bind(childNode)
                );
              }
            });

          }
        })
        .catch(function (err) {
          branchEl.classList.remove(uiCore.LOADING);

          happinessTree.uiNotifications.error.show({
            text: _t('happiness-tree.directory.error-reading', {
              directoryPath: branchModel.path,
            }),
            duration: 5000
          });
        });
    } else {
      // toggle the branch
      uiCore.uiToggleBranchElement(branchEl);


      // if preload is enabled, preload child directories
      if (enablePreload) {
        branchModel.childNodes.forEach(function (childNode) {
          if (childNode.status !== 'loaded' &&
              childNode.status !== 'loading' &&
              childNode.isBranch &&
              childNode.fsRead) {
            happinessTree.preloader.preload(
              'readDirectory:' + childNode.path,
              childNode.fsRead.bind(childNode)
            );
          }
        });
      }
    }
  });

};
