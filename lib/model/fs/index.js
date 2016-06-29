// own dependencies
const treeModel = require('../tree');
const File      = require('./file');
const Directory = require('./directory');

/**
 * Checks that the api object has all the methods defined in the methodList
 * Throws error if the check fails
 * @param  {String} name
 * @param  {Object} api
 * @param  {Array} methodList
 */
function _ensureAPI(options) {

  var name = options.name;
  var api  = options.api;
  var methods = options.methods;
  var throwError = options.throwError || false;

  if (!api) {
    return false;
  }

  return methods.every(function (method) {
    var valid = (typeof api[method] === 'function');
    
    if (throwError && !valid) {
      throw new TypeError(name + '.' + method + ' must be a Function');
    }

    return valid;
  });

}

const REQUIRED_HFS_METHODS = [
  // file and directory
  'remove',
  'move',

  // directory only
  'readDirectory',
  'createFile',
  'createDirectory',
];


/**
 * Ensure HFS interface and instantiate a directory
 * @param  {Object} options
 * @return {Directory}
 */
module.exports = function (options) {

  _ensureAPI({
    name: 'hfs',
    api: options.hfs,
    methods: REQUIRED_HFS_METHODS,
    throwError: true,
  });

  return new Directory(options);

};

module.exports.Directory = Directory;
module.exports.File      = File;
module.exports.auxiliary = treeModel.auxiliary;
