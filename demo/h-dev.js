// native
const path = require('path');

// third-party
const createHFs = require('h-fs');
const Bluebird  = require('bluebird');

// constants
const FS_ROOT_PATH = path.join(__dirname, '_demo_files');

function _toArray(obj) {
  return Array.prototype.slice.call(obj, 0);
}

var hFs = createHFs(FS_ROOT_PATH);

var hDevAPI = {
  readFile: hFs.readFile.bind(hFs),
  createFile: hFs.createFile.bind(hFs),
  updateFile: hFs.updateFile.bind(hFs),

  readDirectory: hFs.readDirectory.bind(hFs),
  createDirectory: hFs.createDirectory.bind(hFs),
  remove: hFs.remove.bind(hFs),
  move: hFs.move.bind(hFs),
}

hDevAPI.subscribe = function () {
  console.log('subscribe', arguments);
  return hFs.on.apply(hFs, _toArray(arguments));
};

hDevAPI.publish = function () {
  console.log('publish', arguments);
};

hDevAPI.startWatching = function () {
  console.log('startWatching', arguments);
  return Bluebird.resolve();
};

hDevAPI.stopWatching = function () {
  console.log('stopWatching', arguments);
  return Bluebird.resolve();
};

// set implementation specific methods
hDevAPI.projectRootURL = 'file://' + FS_ROOT_PATH;

// TODO: expose only methods required by happiness tree
// so that we are always sure of which methods are required
module.exports = hDevAPI;
