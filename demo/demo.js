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

//////////////
//////////////
//////////////
//////////////
// UI STUFF //

var treeUi = new HappinessTree(__dirname + '/files', 'ROOT');
treeUi.attach(document.querySelector('body'));

treeModel.on('node-added', function (parentNode, node, index) {
  if (node.isBranch) {
    treeUi.addBranch(parentNode.absolutePath, node.name, index);
  } else {
    treeUi.addLeaf(parentNode.absolutePath, node.name, index);
  }
});

treeUi.rootElement.addEventListener('click', function (e) {
  var target = e.target;

  var path = treeUi.getElementPath(target);

  if (path) {
    var role = treeUi.getElementRole(target);

    switch (role) {
      case 'branch-label':
        console.log('toggle branch ' + path);
        var branchEl = treeUi.getElement('branch', path);

        var branch = treeModel.getNode(path);

        console.log()

        console.log(branchEl);
        break;
      case 'leaf':
        console.log('open leaf ' + path);
        break;
    }
  }
})


// loadChildNodes some stuff
treeModel.loadChildNodes();
setTimeout(function () {

  treeModel._childNodes.array[0].loadChildNodes();

  setTimeout(function () {
    treeModel._childNodes.array[0]._childNodes.array[0].loadChildNodes();
  }, 100);

}, 100);
