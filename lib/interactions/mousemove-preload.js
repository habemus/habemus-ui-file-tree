module.exports = function (happinessTree, rootModel, uiCore, options) {

  var enablePreload = happinessTree.config.enablePreload || false;

  if (!enablePreload) {
    return;
  }

  uiCore.addTreeEventListener('mousemove', 'branch', function (data) {
    var branchModel = data.model;
    var path = branchModel.path;

    if (branchModel.status !== 'loaded' && branchModel.status !== 'loading') {
      happinessTree.preloader.preload(
        'readDirectory:' + path,
        function () {
          return branchModel.fsRead();
        }
      );
    }
  });

};
