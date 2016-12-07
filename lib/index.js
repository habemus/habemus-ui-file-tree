// native dependencies
const util         = require('util');
const EventEmitter = require('events');
const _path        = require('path');

// third-party dependencies
const Bluebird = require('bluebird');

// own dependencies
const fsModel = require('./model/fs');
const UiCore  = require('./ui-core');
const Preloader = require('./lib/preloader');

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
 * Auxiliary function that retrieves the closest element
 * with overflow `auto` or overflow `scroll`
 * @param  {[type]} element [description]
 * @return {[type]}         [description]
 */
function _getClosestScrollContainer(element) {

  var scrollContainer = null;

  var _current = element;
  var _currentStyles;
  var _parentElement;

  while ((scrollContainer === null) && _current) {
    _parentElement = _current.parentElement;

    var _currentStyles = window.getComputedStyle(_current);

    // TODO: we might need to check for overflowX and overflowY as well
    if (_currentStyles.overflow === 'auto' || _currentStyles.overflow === 'scroll') {
      scrollContainer = _current;
      break;
    }

    if (_parentElement) {
      _current = _parentElement;
    } else {
      _current = null;
    }
  }

  return scrollContainer;
}

/**
 * Checks whether the element is within the view and if needed,
 * scrolls the closest scrollContainer to show the element.
 * 
 * @param  {DOMElement} element
 * @return {undefined}
 */
function _scrollIntoViewIfNeeded(element) {


  // WARNING:
  // all this scrolling is highly experimental and might break
  var elementRect = element.getBoundingClientRect();

  var scrollContainer = _getClosestScrollContainer(element);

  if (scrollContainer) {

    var scrollRect = scrollContainer.getBoundingClientRect();

    if (scrollRect.bottom < elementRect.bottom ||
        scrollRect.top > elementRect.top) {
      // TODO: follow the development of this technology
      // in order to use it instead of manipulating scrollTop
      // manually
      // experimental technology
      // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
      // element.scrollIntoView();
      
      var currentScrollTop = parseInt(scrollContainer.scrollTop, 10);

      var scrollDelta = elementRect.top - ((scrollRect.height / 2) + (elementRect.height / 2));

      scrollContainer.scrollTop = currentScrollTop + scrollDelta;
    }
  }
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
   * Load interactions
   */
  require('./interactions/drag-and-drop')(this, rootModel, uiCore, options);
  require('./interactions/click')(this, rootModel, uiCore, options);
  require('./interactions/context-menu')(this, rootModel, uiCore, options);
  require('./interactions/mousemove-preload')(this, rootModel, uiCore, options);
}

util.inherits(HappinessTree, EventEmitter);

/**
 * Proxy some ui methods
 */
HappinessTree.prototype.uiAddTreeEventListener = function (eventName, elementRole, eventHandler) {
  this.uiCore.addTreeEventListener(eventName, elementRole, eventHandler);
};
HappinessTree.prototype.uiSelect = function (path, options) {
  var element = this.uiCore.getElement(path);
  this.uiCore.uiSelectElement(element, options);
};
HappinessTree.prototype.attach = function (containerElement) {
  this.uiCore.attach(containerElement);
};
HappinessTree.prototype.uiToggleBranch = function (path, open) {
  var element = this.uiCore.getElement(path);
  this.uiCore.uiToggleBranchElement(element, open);
};

/**
 * Macro level methods:
 * these methods involve both the tree model and the tree ui
 */

/**
 * Opens the directory.
 *
 * If the path has not been loaded yet,
 * opens all directories before up to the path
 * 
 * @param  {String} path
 * @return {Bluebird}
 */
HappinessTree.prototype.openDirectory = function (path) {
  if (!path && path !== '') { throw new Error('path is required'); }

  if (path === '' || path === '/') {

    if (this.rootModel.status === 'loaded') {
      return Bluebird.resolve();
    }

    // read the root directory contents
    // as the root ui branch is always open, no need of
    // toggling it open
    return this.rootModel.fsRead().then(function () {
      // ensure empty return
      return;
    });
  } else {

    var self = this;

    // retrieve the deepest path that currently exists
    var deepestNodeData = this.rootModel.getDeepestNodeByPath(path);

    var deepestNode        = deepestNodeData.node;
    var remainingPathParts = deepestNodeData.remainingPathParts;

    console.log(path);
    console.log(deepestNodeData);

    if (remainingPathParts.length === 0) {
      // target node exists
      // check if is a directory and open it
      if (deepestNode.isBranch) {

        if (deepestNode.status === 'loaded') {
          
          // read succesful,
          // toggle all branches open up to the deepest node
          deepestNode.traverseAncestors(function (node) {
            self.uiToggleBranch(node.path, true);
          });

          return Bluebird.resolve();
        } else {
          
          return deepestNode.fsRead()
            .then(function () {
              // read succesful,
              // toggle all branches open up to the deepest node
              deepestNode.traverseAncestors(function (node) {
                self.uiToggleBranch(node.path, true);
              });
            });
        }
      } else {
        console.warn('target node is not a branch');
      }
    } else {
      // target node does not exist
      // loop through remainingPathParts
      
      var _successfullyReadPaths = [];

      function _retrieveNodeContents(node) {
        return node.fsRead().then(function () {
          // read succesful,
          // schedule to toggle it open
          _successfullyReadPaths.push(node.path);

          // return node so that we can chain the promises
          return node;
        });
      }

      // chain of read promises
      return remainingPathParts.reduce(function (parentNodeRead, part) {

        return parentNodeRead.then(function (parentNode) {

          var childNode = parentNode.getChild(part);

          if (!childNode) {
            // not found
            return Bluebird.reject(
              new Error('node `' + parentNode.path + '` does not have a `' + part + '` child')
            );
          } else if (!childNode.isBranch) {
            // found, but not a branch
            return Bluebird.reject(
              new Error('node `' + childNode.path + '` is not a branch')
            );
          } else {
            // read deeper
            return _retrieveNodeContents(childNode);
          }
        })

      }, _retrieveNodeContents(deepestNode))
      .then(function () {
        // all reads succesful
        _successfullyReadPaths.forEach(function (path) {
          self.uiToggleBranch(path, true);
        });

        return;
      })
      .catch(function (err) {
        // read error: open the successful reads and return rejection
        _successfullyReadPaths.forEach(function (path) {
          self.uiToggleBranch(path, true);
        });

        return Bluebird.reject(err);
      });
    }
  }

};

/**
 * Reveals the file and optionally selects it
 * If the file has not been loaded yet,
 * attempts to load it.
 * 
 * @param  {String} path
 * @param  {Object} options
 * @return {Bluebird}
 */
HappinessTree.prototype.revealPath = function (path, options) {
  return this.openDirectory(_path.dirname(path))
    .then(function () {
      this.uiSelect(path, options);

      var element = this.uiCore.getElement(path);
      _scrollIntoViewIfNeeded(element);

    }.bind(this));
};

module.exports = function (options) {
  return new HappinessTree(options);
};
