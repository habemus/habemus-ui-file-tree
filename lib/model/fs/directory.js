const util   = require('util');

const Branch = require('../tree').Branch;
const HFSFile = require('./file');

const INITIAL_DIR_DATA = {
  collapsed: true,
  loaded: false
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
 * Loads child nodes of the directory using hfs.readDirectory method.
 * @return {Promise -> undefined}
 */
HFSDir.prototype.fsRead = function () {
  var self = this;

  // the directory path
  var dirPath = this.path;

  return this.root.hfs.readDirectory(dirPath)
    .then(function (contents) {

      contents.forEach(function (stat) {

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

HFSDir.prototype.fsCreateFile = function (name, contents) {

  var self = this;

  var path = this.path + '/' + name;

  return this.root.hfs.createFile(path, contents)
    .then(function () {
      self.createChild('leaf', name);
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
