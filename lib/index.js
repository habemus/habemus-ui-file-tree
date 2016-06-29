// native dependencies
const util         = require('util');
const EventEmitter = require('events');

// third-party dependencies
const Bluebird = require('bluebird');

// own dependencies
const fsModel = require('./model/fs');
const UiCore  = require('./ui-core');

function HappinessTree(options) {
  if (!options.hfs) { throw new Error('hfs is required'); }
  if (!options.rootName) { throw new Error('rootName is required'); }

  this.hfs      = options.hfs;
  this.rootName = options.rootName;

  /**
   * Instantiate a directory model
   * @type {HFSDir}
   */
  this.rootModel = fsModel({
    name: this.rootName,
    rootPath: this.rootName,
    hfs: this.hfs,
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
      ui.addBranch(node, index);
    } else {
      ui.addLeaf(node, index);
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
  require('./interactions/drag-and-drop')(rootModel, uiCore);
  require('./interactions/click')(rootModel, uiCore);
  require('./interactions/context-menu')(rootModel, uiCore);
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
  this.uiCore.selectElement(element, options);
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
        deepestNode.fsRead()
          .then(function () {
            
            // read succesful,
            // toggle the branch open
            self.uiToggleBranch(node.path);
          });
      }
    } else {
      // target node does not exist
      // loop through remainingPathParts
      
      function _retrieveNodeContents(node) {
        return node.fsRead().then(function () {
          // read succesful,
          // toggle the branch open
          self.uiToggleBranch(node.path);

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

      }, _retrieveNodeContents(deepestNode));
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
HappinessTree.prototype.revealFile = function (path, options) {

};










module.exports = function (options) {

  return new HappinessTree(options);

  // if (!options.hfs) { throw new Error('hfs is required'); }
  // if (!options.rootName) { throw new Error('rootName is required'); }
  // // if (!options.modals) { throw new Error('modals are required'); }

  // const hfs      = options.hfs;
  // const rootName = options.rootName;

  // /**
  //  * Instantiate a directory model
  //  * @type {HFSDir}
  //  */
  // var rootModel = fsModel({
  //   name: rootName,
  //   rootPath: rootName,
  //   hfs: hfs,
  // });

  // /**
  //  * Instantiate a ui
  //  * @type {UiCore}
  //  */
  // var ui = new UiCore(rootModel);

  // /**
  //  * Wire model events to the ui core
  //  */
  // rootModel.on('node-added', function (parentNode, node, index) {
  //   if (node.isBranch) {
  //     ui.addBranch(node, index);
  //   } else {
  //     ui.addLeaf(node, index);
  //   }
  // });

  // rootModel.on('node-removed', function (parentNode, node, index) {
  //   // as the node was removed it no longer has a reference to its parent
  //   var nodePath = parentNode.path + '/' + node.name;
    
  //   ui.removeElement(nodePath);
  // });

  // rootModel.on('node-moved', function (fromNode, toParentNode, node, index) {

  //   var nodePath = fromNode.path + '/' + node.name;
  //   var toPath   = node.path;

  //   ui.removeElement(nodePath);

  //   // re-render the branch/leaf
  //   if (node.isBranch) {
  //     ui.addBranch(node, index);
  //   } else {
  //     ui.addLeaf(node, index);
  //   }
  // });

  // /**
  //  * Load interactions
  //  */
  // require('./interactions/drag-and-drop')(rootModel, ui);
  // require('./interactions/click')(rootModel, ui);
  // require('./interactions/context-menu')(rootModel, ui);
  // // require('./context-menu')(rootModel, ui);

  // return {
  //   model: rootModel,
  //   ui: ui,
  // };
};