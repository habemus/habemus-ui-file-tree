const util   = require('util');

const Branch = require('../tree').Branch;
const HFSFile = require('./file');

const DIRECTORY_STATUSES = {
  UNTOUCHED: 'untouched',
  LOADING: 'loading',
  LOADED: 'loaded'
};

const INITIAL_DIR_DATA = {
  collapsed: true,
  status: DIRECTORY_STATUSES.UNTOUCHED,
};

/**
 * Directory model constructor
 * @param {Object} data
 */
function HFSDir(data) {
  Branch.call(this, data);

  if (this.isRoot) {
    this.hDev = data.hDev;

    var rootDir = this;

    // rootDir directory listens to hDev events
    rootDir.hDev.subscribe('file-removed', function (data) {
      rootDir.ensureDoesNotExist('leaf', data.path);
    });

    rootDir.hDev.subscribe('directory-removed', function (data) {
      rootDir.ensureDoesNotExist('branch', data.path);
    });

    rootDir.hDev.subscribe('file-created', function (data) {
      rootDir.ensureExists('leaf', data.path);
    });

    rootDir.hDev.subscribe('directory-created', function (data) {
      rootDir.ensureExists('branch', data.path);
    });
  }

  // set starting statuses
  this.set(INITIAL_DIR_DATA);
}
util.inherits(HFSDir, Branch);

HFSDir.prototype.BranchConstructor = HFSDir;
HFSDir.prototype.LeafConstructor = HFSFile;

/**
 * Loads child nodes of the directory using hDev.readDirectory method.
 * @return {Promise -> undefined}
 */
HFSDir.prototype.fsRead = function () {
  var self = this;

  // the directory path
  var dirPath = this.path;

  self.set('status', DIRECTORY_STATUSES.LOADING);

  return this.root.hDev.readDirectory(dirPath)
    .then(function (contents) {
      // set status to loaded
      self.set('status', DIRECTORY_STATUSES.LOADED);

      // start watching the path
      self.root.hDev.startWatching(dirPath);

      contents.forEach(function (stat) {

        var childType = stat.isDirectory ? 'branch' : 'leaf';

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

  return this.root.hDev.remove(self.path)
    .then(function () {
      self.removeSelf();
    });
};

HFSDir.prototype.fsMove = function (node, destBranch) {

  var self = this;

  var srcPath = node.path;
  var destPath = destBranch.path + '/' + node.name;

  return this.root.hDev.move(srcPath, destPath)
    .then(function () {
      self.moveNode(node.path, destBranch.path);
    });
};

HFSDir.prototype.fsRename = function (name) {
  var self = this;
  var parent = self.parent;

  var srcPath = this.path;
  var destPath = this.parent.path + '/' + name;

  return this.root.hDev.move(srcPath, destPath)
    .then(function () {
      parent.removeChild(self.name);

      self.name = name;

      parent.addChild(self);
    });
};

HFSDir.prototype.fsCreateFile = function (name, contents) {

  var self = this;

  var path = this.path + '/' + name;

  return this.root.hDev.createFile(path, contents)
    .then(function () {
      self.createChild('leaf', name);
    });
};

HFSDir.prototype.fsCreateDirectory = function (name) {

  var self = this;
  var path = this.path + '/' + name;

  return this.root.hDev.createDirectory(path)
    .then(function () {
      self.createChild('branch', name, { loaded: true });
    });
};

module.exports = HFSDir;
