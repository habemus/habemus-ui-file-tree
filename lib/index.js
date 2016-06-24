const util  = require('util');

const model = require('./model');
const Ui    = require('./ui');

var _hfs;

/**
 * Directory model constructor
 * @param {Object} data
 */
function HFSDir(data) {
  model.Branch.call(this, data);
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

  return _hfs.readdirStats(dirPath)
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

function HappinessTree(rootName, hfs) {
  if (!hfs) {
    throw new Error('hfs is required');
  }

  _hfs = hfs;

  this.hfs = hfs;

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
    console.log('click branch-label %s', data.path);

    var branch = (data.path === '') ? model : model.getNodeByPath(data.path);
    branch.loadChildren();
  });

  // ui.addTreeEventListener('mouseover', 'leaf', function (data) {
  //   console.log('mouseover leaf %s', data.path);
  // });
}

module.exports = HappinessTree;