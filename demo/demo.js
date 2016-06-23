// native dependencies
const fs   = require('fs');
const path = require('path');
const util = require('util');

// third-party dependencies
const fse      = require('fs-extra');
const readdirp = require('readdirp');

const Branch        = require('../lib/model/branch');
const HappinessTree = require('../lib/ui');

var FS_ROOT_PATH = __dirname + '/files';



// DIRECTORY MODEL
function Dir(data) {
  Branch.call(this, data);
}

util.inherits(Dir, Branch);

Dir.prototype.BranchConstructor = Dir;

Dir.prototype.loadChildNodes = function () {

  var self         = this;
  var absolutePath = this.absolutePath;

  fs.readdir(absolutePath, function (err, contents) {

    if (err) {
      console.warn(err);
    }

    contents = contents || [];

    contents.forEach(function (name) {
      fs.lstat(absolutePath + '/' + name, function (err, stats) {

        if (err) {
          console.warn(err);
        }

        if (stats.isDirectory()) {
          self.addBranch(name);
        } else {
          self.addLeaf(name);
        }
      });
    });
  });
}

//////////////
//////////////
//////////////
//////////////
// UI STUFF //

var treeModel = new Dir({
  rootPath: FS_ROOT_PATH,
});
var treeUi = new HappinessTree('some-arbitrary-name');

treeUi.attach(document.querySelector('body'));

treeUi.addTreeEventListener('click', 'branch-label', function (data) {
  console.log('click branch-label %s', data.path);
  var branch = treeModel.getNode(data.path);
  branch.loadChildNodes();
});

treeUi.addTreeEventListener('mouseover', 'leaf', function (data) {
  console.log('mouseover leaf %s', data.path);
});



treeModel.on('node-added', function (parentNode, node, index) {
  if (node.isBranch) {
    treeUi.addBranch(parentNode.path, node.name, index);
  } else {
    treeUi.addLeaf(parentNode.path, node.name, index);
  }
});

treeModel.loadChildNodes();