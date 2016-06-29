const util   = require('util');

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

HFSFile.prototype.fsRemove = function () {
  var self = this;

  return this.root.hfs.remove(self.path)
    .then(function () {
      self.parent.removeChild(self.name);
    });
};

HFSFile.prototype.fsRename = function (name) {
  var self = this;
  var parent = self.parent;

  var srcPath = this.path;
  var destPath = this.parent.path + '/' + name;

  return this.root.hfs.move(srcPath, destPath)
    .then(function () {
      parent.removeChild(self.name);

      self.name = name;

      parent.addChild(self);
    });
};

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
HFSDir.prototype.fsLoadContents = function () {
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
          console.warn('ignoring repeated add of ' + stat.basename);
        }
      });

      // return nothing
      return;
    });
};

HFSDir.prototype.fsRemove = function () {
  var self = this;

  return this.root.hfs.remove(self.path)
    .then(function () {
      self.parent.removeChild(self.name);
    });
};

HFSDir.prototype.fsWriteFile = function (name, contents) {

  var self = this;

  var path = this.path + '/' + name;

  return this.root.hfs.writeFile(path, contents)
    .then(function () {
      self.createChild('leaf', name);
    });
};

HFSDir.prototype.fsMove = function (node, destBranch) {

  var self = this;

  var srcPath = node.path;
  var destPath = destBranch.path + '/' + node.name;

  return this.root.hfs.move(srcPath, destPath)
    .then(function () {
      self.moveNode(node.path, destBranch.path);
    });
};

HFSDir.prototype.fsRename = function (name) {
  var self = this;
  var parent = self.parent;

  var srcPath = this.path;
  var destPath = this.parent.path + '/' + name;

  return this.root.hfs.move(srcPath, destPath)
    .then(function () {
      parent.removeChild(self.name);

      self.name = name;

      parent.addChild(self);
    });
};

HFSDir.prototype.fsCreateDirectory = function (name) {

  var self = this;
  var path = this.path + '/' + name;

  return this.root.hfs.createDirectory(path)
    .then(function () {
      self.createChild('branch', name, { loaded: true });
    });
}

module.exports = HFSDir;
