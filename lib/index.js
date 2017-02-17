// native dependencies
const util         = require('util');
const EventEmitter = require('events');

// own dependencies
const fsModel = require('./model/fs');
const UiCore  = require('./ui-core');
const Preloader = require('./lib/preloader');
const upload = require('./lib/upload');

const API_DEF = {
  hDev: require('./api-def/h-dev'),
  uiDialogs: require('./api-def/ui-dialogs'),
  uiNotifications: require('./api-def/ui-notifications'),
};

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
    if (throwError) {
      throw new TypeError('api ' + name + ' is required');
    } else {
      return false;
    }
  }

  return Object.keys(definition).every(function (prop) {
    var valid = (typeof api[prop] === definition[prop]);
    
    if (throwError && !valid) {
      throw new TypeError(name + '.' + prop + ' must be a ' + definition[prop]);
    }

    return valid;
  });

}
/**
 * The main happiness tree constructor
 */
function HappinessTree(options) {
  if (!options.hDev) { throw new Error('hDev is required'); }
  if (!options.rootName) { throw new Error('rootName is required'); }

  /**
   * Keep reference to APIs and ensure their formats
   */
  this.hDev            = options.hDev;
  this.uiDialogs       = options.uiDialogs;
  this.uiNotifications = options.uiNotifications;

  _ensureAPI({
    name: 'hDev',
    api: this.hDev,
    definition: API_DEF.hDev,
    throwError: true,
  });

  _ensureAPI({
    name: 'uiDialogs',
    api: this.uiDialogs,
    definition: API_DEF.uiDialogs,
    throwError: true
  });

  _ensureAPI({
    name: 'uiNotifications',
    api: this.uiNotifications,
    definition: API_DEF.uiNotifications,
    throwError: true,
  });

  /**
   * Used to name the root directory
   * @type {String}
   */
  this.rootName  = options.rootName;

  /**
   * Function that generates translations
   * @type {Function}
   */
  this.translate = function () {
    var res = options.translate ?
      options.translate.apply(null, Array.prototype.slice.call(arguments, 0)) :
      undefined;

    if (!res) {
      console.warn('no translation found for ' + k);

      res = k;
    }

    return res;
  };

  /**
   * Tree various configurations
   * @type {Object}
   */
  this.config = options.config || {};

  /**
   * Instantiate a directory model
   * @type {HFSDir}
   */
  this.rootModel = fsModel({
    name: this.rootName,
    rootPath: this.rootName,
    hDev: this.hDev,
  });

  /**
   * Instantiate a ui core
   * @type {UiCore}
   */
  this.uiCore = new UiCore(this.rootModel);

  /**
   * Upload helpers
   */
  this.upload = upload(this, this.rootModel, this.uiCore, options);

  /**
   * Instantiate a preloader
   * @type {Preloader}
   */
  this.preloader = new Preloader({
    maxConcurrent: 5,
    maxEnqueued: 20,
  });


  var rootModel = this.rootModel;
  var uiCore    = this.uiCore;

  /**
   * Wire model events to the ui core
   */
  rootModel.on('node-added', function (parentNode, node, index) {
    if (node.isBranch) {
      uiCore.addBranch(node, index);
    } else {
      uiCore.addLeaf(node, index);
    }
  });

  rootModel.on('node-removed', function (parentNode, node, index) {
    // as the node was removed it no longer has a reference to its parent
    var nodePath = parentNode.path + '/' + node.name;
    
    uiCore.removeElement(nodePath);
  });

  rootModel.on('node-moved', function (fromNode, toParentNode, node, index) {

    var nodePath = fromNode.path + '/' + node.name;
    var toPath   = node.path;

    uiCore.removeElement(nodePath);

    // re-render the branch/leaf
    if (node.isBranch) {
      uiCore.addBranch(node, index);
    } else {
      uiCore.addLeaf(node, index);
    }
  });

  /**
   * Propagate events from uiCore and rootModel 
   * to the HappinessTree instance
   */
  rootModel.on('node-added', this.emit.bind(this, 'node-added'));
  rootModel.on('node-removed', this.emit.bind(this, 'node-removed'));
  rootModel.on('node-moved', this.emit.bind(this, 'node-moved'));

  /**
   * Load menu elements
   */
  this.menu = {
    branch: require('./menu/branch')(this, rootModel, uiCore, options),
    leaf: require('./menu/leaf')(this, rootModel, uiCore, options),
  };

  /**
   * Load interactions
   */
  require('./interactions/drag-and-drop')(this, rootModel, uiCore, options);
  require('./interactions/click')(this, rootModel, uiCore, options);
  require('./interactions/contextmenu')(this, rootModel, uiCore, options);
  require('./interactions/mousemove-preload')(this, rootModel, uiCore, options);
}

util.inherits(HappinessTree, EventEmitter);

Object.assign(HappinessTree.prototype, require('./methods'));

module.exports = function (options) {
  return new HappinessTree(options);
};
