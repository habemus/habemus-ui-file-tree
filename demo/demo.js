// native dependencies
const fs   = require('fs');
const path = require('path');
const util = require('util');

// third-party dependencies
const fse      = require('fs-extra');
const readdirp = require('readdirp');

const Branch = require('../lib/model/branch');


function Directory(name, data, parent) {

  console.log(arguments);
  Branch.call(this, name, data, parent);
}

util.inherits(Directory, Branch);

Directory.prototype.BranchConstructor = Directory;

Directory.prototype.open = function () {

  var self    = this;
  var dirpath = self.getAbsolutePath();

  console.log(dirpath);

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

var rootDir = window.rootDir = new Directory(__dirname + '/files');

rootDir.on('node-added', function (data) {
  console.log('node-added');
  console.log(data);
});