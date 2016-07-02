// native dependencies
const fs   = require('fs');

// third-party dependencies
const fse        = require('fs-extra');
const Bluebird   = require('bluebird');

// promisify some methods
var _writeFile = Bluebird.promisify(fs.writeFile);
var _readdir   = Bluebird.promisify(fs.readdir);
var _readFile  = Bluebird.promisify(fs.readFile);
var _mkdir     = Bluebird.promisify(fs.mkdir);
var _lstat     = Bluebird.promisify(fs.lstat);
var _move      = Bluebird.promisify(fse.move);
var _remove    = Bluebird.promisify(fse.remove);

// constants
// const FS_ROOT_PATH = path.join(__dirname, '../node_modules');
const FS_ROOT_PATH = path.join(__dirname, '_demo_files');

function wait(ms) {
  return new Bluebird((resolve, reject) => {
    setTimeout(resolve, 300);
  });
}

const hfs = {
  readDirectory: function (p) {
    // build the real path
    p = path.join(FS_ROOT_PATH, p);

    // simulate very bad connection
    return wait()
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

    return wait()
      .then(function () {
        return _remove(p);
      });
  },

  move: function (src, dest) {
    src = path.join(FS_ROOT_PATH, src);
    dest = path.join(FS_ROOT_PATH, dest);

    return wait().then(function () {
      return _move(src, dest);
    });
  },

  readFile: function (p, options) {
    p = path.join(FS_ROOT_PATH, p);

    return wait().then(function () {
      return _readFile(p, options);
    });
  },

  createFile: function (p) {
    p = path.join(FS_ROOT_PATH, p);

    return wait()
      .then(function () {
        return _lstat(p);
      })
      .then(function (stats) {
        // stats exist, throw error
        return Bluebird.reject('file exists');
      })
      .catch(function (err) {
        // stats do not exist, create file
        return _writeFile(p, '');
      });
  },

  createDirectory: function (p) {
    p = path.join(FS_ROOT_PATH, p);

    return wait().then(function () {
      return _mkdir(p);
    });
  }
};

module.exports = hfs;
