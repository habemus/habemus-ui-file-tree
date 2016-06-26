const Branch = require('../branch');
const Leaf   = require('../leaf');

const INITIAL_DIR_DATA = {
  collapsed: true,
  loaded: false
};

const INITIAL_FILE_DATA = {
  selected: false,
  loaded: false
};

// file constructor
function HFSFile(data) {
  Leaf.call(this, data);

  // set initial data
  this.set(INITIAL_FILE_DATA);
}

util.inherits(HFSFile, Leaf);

HFSFile.prototype.remove = function () {
  var self = this;

  return this.root.hfs.remove(self.path)
    .then(function () {
      self.parent.removeChild(self.name);
    });
}

/**
 * Directory model constructor
 * @param {Object} data
 */
function HFSDir(data) {
  Branch.call(this, data);

  if (this.isRoot) {
    this.hfs = data.hfs;
  }

  // set starting statuses
  this.set(INITIAL_DIR_DATA);
}

util.inherits(HFSDir, Branch);

HFSDir.prototype.BranchConstructor = HFSDir;
HFSDir.prototype.LeafConstructor = HFSFile;

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

HFSDir.prototype.remove = function () {
  var self = this;

  return this.root.hfs.remove(self.path)
    .then(function () {
      self.parent.removeChild(self.name);
    });
};

HFSDir.prototype.writeFile = function (name, contents) {

  var self = this;

  var path = this.path + '/' + name;

  return this.root.hfs.writeFile(path, contents)
    .then(function () {
      self.createChild('leaf', name);
    });
};

module.exports = HFSDir;