const util = require('util');

const Leaf = require('../tree').Leaf;

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

module.exports = HFSFile;
