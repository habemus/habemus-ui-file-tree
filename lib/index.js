const util  = require('util');

const Bluebird = require('bluebird');

const model = require('./model');
const Ui    = require('./ui');

/**
 * Directory model constructor
 * @param {Object} data
 */
function HFSDir(data) {
  model.Branch.call(this, data);

  if (this.isRoot) {
    this.hfs = data.hfs;
  }
}

util.inherits(HFSDir, model.Branch);

HFSDir.prototype.BranchConstructor = HFSDir;

/**
 * Loads child nodes of the directory using hfs.readdirStats method.
 * @return {Promise -> undefined}
 */
HFSDir.prototype.loadChildren = function () {
  var self = this;

  // the directory path
  var dirPath = this.path;

  return this.root.hfs.readdirStats(dirPath)
    .then(function (stats) {

      console.log('stats ', stats);

      stats.forEach(function (stat) {

        var childType = stat.isDirectory() ? 'branch' : 'leaf';

        // check if the node is already in the tree
        // and try to add the node only if it does not exist
        if (!self.getChild(stat.basename)) {
          self.createChild(childType, stat.basename);
        } else {
          console.log('ignore ' + stat.basename);
        }
      });

      // return nothing
      return;
    });
};

module.exports = function (options) {
  if (!options.hfs) { throw new Error('hfs is required'); }
  if (!options.rootName) { throw new Error('rootName is required'); }

  const hfs      = options.hfs;
  const rootName = options.rootName;

  /**
   * Instantiate a directory model
   * @type {HFSDir}
   */
  var model = this.model = new HFSDir({
    rootPath: rootName,
    hfs: hfs,
  });

  /**
   * Instantiate a ui
   * @type {Ui}
   */
  var ui = this.ui = new Ui(rootName);

  // link model to ui
  model.on('node-added', function (parentNode, node, index) {
    if (node.isBranch) {
      ui.addBranch(parentNode.path, node.name, index);
    } else {
      ui.addLeaf(parentNode.path, node.name, index);
    }
  });

  // listen to events on the ui
  ui.addTreeEventListener('click', 'branch-label', function (data) {
    var branchModel = (data.path === '') ? model : model.getNodeByPath(data.path);


    var branchEl = ui.getElement('branch', data.path);

    if (!branchModel.loaded) {

      branchEl.classList.add(ui.BRANCH_LOADING);

      branchModel.loadChildren()
        .then(function () {
          branchEl.classList.remove(ui.BRANCH_LOADING);
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

  return {
    model: model,
    ui: ui,
  };
};