// native dependencies
const fs   = require('fs');
const path = require('path');
const util = require('util');

// third-party dependencies
const fse      = require('fs-extra');
const readdirp = require('readdirp');
const Bluebird = require('bluebird');

// the UITree Constructor
const tree = require('../lib');

// promisify some methods
var _writeFile = Bluebird.promisify(fs.writeFile);
var _readdir   = Bluebird.promisify(fs.readdir);
var _lstat     = Bluebird.promisify(fs.lstat);
var _move      = Bluebird.promisify(fse.move);
var _remove    = Bluebird.promisify(fse.remove);

// constants
// const FS_ROOT_PATH = path.join(__dirname, '../node_modules');
const FS_ROOT_PATH = path.join(__dirname, '_demo_files');

function wait(ms) {
  return new Bluebird((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

const hfs = {
  readdirStats: function (p) {
    // build the real path
    p = path.join(FS_ROOT_PATH, p);

    // simulate very bad connection
    return wait(300)
      .then(() => {
        return _readdir(p)
      })
      .then((contents) => {
        return Bluebird.all(contents.map((contentName) => {

          var contentPath = path.join(p, contentName);

          return _lstat(contentPath)
            .then((stat) => {

              // process the stat object before returning
              stat.basename = contentName;

              return stat;
            });
        }));
      });
  },

  remove: function (p) {
    p = path.join(FS_ROOT_PATH, p);

    return wait(500)
      .then(function () {
        return _remove(p);
      });
  },

  writeFile: function (p, contents) {
    p = path.join(FS_ROOT_PATH, p);

    console.log('create file ', p, ' with contents ', contents);

    return wait(300)
      .then(function () {
        return _writeFile(p, contents);
      });
  },

  move: function (src, dest) {
    src = path.join(FS_ROOT_PATH, src);
    dest = path.join(FS_ROOT_PATH, dest);

    return wait(300).then(function () {
      return _move(src, dest);
    });
  }
};

// instantiate the ui
var happiness = tree({
  hfs: hfs,
  rootName: 'my-project'
});

happiness.ui.attach(document.querySelector('#container'));

// initialize by retrieving root childNodes
happiness.model.fsLoadContents()
  .then(function () {
    console.log('initial loading done');
  });
