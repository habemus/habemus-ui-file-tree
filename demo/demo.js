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
var _readdir = Bluebird.promisify(fs.readdir);
var _lstat   = Bluebird.promisify(fs.lstat);

// constants
const FS_ROOT_PATH = path.join(__dirname, '../node_modules');

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
    return wait(1000)
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

    console.log('remove ', p);

    return wait(500);
  },

  writeFile: function (p, contents) {
    p = path.join(FS_ROOT_PATH, p);

    console.log('create file ', p, ' with contents ', contents);

    return wait(300);
  }
};

// instantiate the ui
var happiness = tree({
  hfs: hfs,
  rootName: 'my-project'
});

happiness.ui.attach(document.querySelector('body'));

// initialize by retrieving root childNodes
happiness.model.loadChildren();
