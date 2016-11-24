// own dependencies
const treeModel = require('../tree');
const File      = require('./file');
const Directory = require('./directory');

/**
 * Ensure H_DEV interface and instantiate a directory
 * @param  {Object} options
 * @return {Directory}
 */
module.exports = function (options) {
  return new Directory(options);
};

module.exports.Directory = Directory;
module.exports.File      = File;
module.exports.auxiliary = treeModel.auxiliary;
