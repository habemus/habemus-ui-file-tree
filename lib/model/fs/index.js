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
  var definition = options.definition;
  var throwError = options.throwError || false;

  if (!api) {
    return false;
  }

  return Object.keys(definition).every(function (prop) {
    var valid = (typeof api[prop] === definition[prop]);
    
    if (throwError && !valid) {
      throw new TypeError(name + '.' + prop + ' must be a ' + definition[prop]);
    }

    return valid;
  });

}

const H_DEV_API_DEF = {
  // file and directory
  remove: 'function',
  move: 'function',

  // directory only
  readDirectory: 'function',
  createFile: 'function',
  createDirectory: 'function',

  // events
  subscribe: 'function',

  // watching
  startWatching: 'function',
  stopWatching: 'function',

  // project-related
  projectRootURL: 'string',
};


/**
 * Ensure H_DEV interface and instantiate a directory
 * @param  {Object} options
 * @return {Directory}
 */
module.exports = function (options) {

  _ensureAPI({
    name: 'hDev',
    api: options.hDev,
    definition: H_DEV_API_DEF,
    throwError: true,
  });

  return new Directory(options);

};

module.exports.Directory = Directory;
module.exports.File      = File;
module.exports.auxiliary = treeModel.auxiliary;
