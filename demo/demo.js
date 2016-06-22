// native dependencies
const fs   = require('fs');
const path = require('path');
const util = require('util');

// third-party dependencies
const fse      = require('fs-extra');
const readdirp = require('readdirp');

const Branch = require('../lib/model/branch');
const HappinessTree = require('../lib/ui');

function DirectoryConstructor(name, data, parent) {
  Branch.call(this, name, data, parent);
}

util.inherits(DirectoryConstructor, Branch);

DirectoryConstructor.prototype.BranchConstructor = DirectoryConstructor;

DirectoryConstructor.prototype.loadChildNodes = function () {

  var self    = this;
  var dirpath = self.absolutePath;

  fs.readdir(dirpath, function (err, contents) {

    if (contents) {
      contents.forEach(function (name) {
        fs.lstat(dirpath + '/' + name, function (err, stats) {
          if (stats.isDirectory()) {
            self.addBranch(name);
          } else {
            self.addLeaf(name);
          }
        });
      });
    }
  });
}

var treeModel = new DirectoryConstructor(__dirname + '/files');
var tree = new HappinessTree(treeModel);

tree.attach(document.querySelector('#root'));

// loadChildNodes some stuff
treeModel.loadChildNodes();
setTimeout(function () {

  treeModel._childNodes.array[0].loadChildNodes();

  setTimeout(function () {
    treeModel._childNodes.array[0]._childNodes.array[0].loadChildNodes();
  }, 100);

}, 100);
