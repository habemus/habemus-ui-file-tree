const createHFs = require('h-fs');

const Bluebird = require('bluebird');

// constants
const FS_ROOT_PATH = path.join(__dirname, '_demo_files');

var hDevAPI = createHFs(FS_ROOT_PATH);

hDevAPI.subscribe = function () {
  console.log('subscribe', arguments);
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
