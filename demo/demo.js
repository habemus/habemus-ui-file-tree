// native dependencies
const fs   = require('fs');
const path = require('path');
const util = require('util');

// third-party dependencies
const fse      = require('fs-extra');
const readdirp = require('readdirp');
const Bluebird = require('bluebird');

// the UITree Constructor
const HappinessTree = require('../lib');

// promisify some methods
var _readdir = Bluebird.promisify(fs.readdir);
var _lstat   = Bluebird.promisify(fs.lstat);

// constants
const FS_ROOT_PATH = __dirname + '/files';

const hfs = {
  readdirStats: function (p) {
    // build the real path
    p = path.join(FS_ROOT_PATH, p);

    return _readdir(p)
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
  }
};

// instantiate the ui
var happiness = new HappinessTree('my-project', hfs);

happiness.ui.attach(document.querySelector('body'));