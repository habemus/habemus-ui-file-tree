// native dependencies
const util         = require('util');
const EventEmitter = require('events');
const _path        = require('path');

// third-party dependencies
const Bluebird = require('bluebird');

// own dependencies
const fsModel = require('./model/fs');
const UiCore  = require('./ui-core');

function HappinessTree(options) {
  if (!options.hDev) { throw new Error('hDev is required'); }
  if (!options.rootName) { throw new Error('rootName is required'); }

  this.hDev      = options.hDev;
  this.rootName  = options.rootName;
  this.translate = options.translate || function (k) {
    console.warn('no translation function provided, falling back to default');
    return k;
  };

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

  if (path === '') {
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

    if (remainingPathParts.length === 0) {
      // target node exists
      // check if is a directory and open it
      if (deepestNode.isBranch) {

        if (deepestNode.status === 'loaded') {
          
          // read succesful,
          // toggle the branch open
          self.uiToggleBranch(deepestNode.path, true);

          return Bluebird.resolve();
        } else {
          
          return deepestNode.fsRead()
            .then(function () {
              
              // read succesful,
              // toggle the branch open
              self.uiToggleBranch(deepestNode.path, true);
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
    }.bind(this));
};

module.exports = function (options) {
  return new HappinessTree(options);
};