// native dependencies
const fs   = require('fs');

// third-party dependencies
const fse        = require('fs-extra');
const Bluebird   = require('bluebird');

// habemus dependencies
const createHFs = require('h-fs');

const createHDev = require('h-dev-electron');

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

hfsAPI = createHDev(FS_ROOT_PATH);

module.exports = hfsAPI;
