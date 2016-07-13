const createHDevElectron = require('h-dev-electron');

// constants
const FS_ROOT_PATH = path.join(__dirname, '_demo_files');

var hDevAPI = createHDevElectron(FS_ROOT_PATH);

// set implementation specific methods
hDevAPI.projectRootURL = 'file://' + FS_ROOT_PATH;

// TODO: expose only methods required by happiness tree
// so that we are always sure of which methods are required
module.exports = hDevAPI;
