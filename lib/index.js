// third-party dependencies
const Bluebird = require('bluebird');

// const model = require('./model');
const HFSDir = require('./model/fs');
const UiCore    = require('./ui-core');

module.exports = function (options) {
  if (!options.hfs) { throw new Error('hfs is required'); }
  if (!options.rootName) { throw new Error('rootName is required'); }
  // if (!options.modals) { throw new Error('modals are required'); }

  const hfs      = options.hfs;
  const rootName = options.rootName;

  /**
   * Instantiate a directory model
   * @type {HFSDir}
   */
  var rootModel = new HFSDir({
    name: rootName,
    rootPath: rootName,
    hfs: hfs,
  });

  /**
   * Instantiate a ui
   * @type {UiCore}
   */
  var ui = new UiCore(rootModel);

  /**
   * Wire model events to the ui core
   */
  rootModel.on('node-added', function (parentNode, node, index) {
    if (node.isBranch) {
      ui.addBranch(node, index);
    } else {
      ui.addLeaf(node, index);
    }
  });

  rootModel.on('node-removed', function (parentNode, node, index) {
    // as the node was removed it no longer has a reference to its parent
    var nodePath = parentNode.path + '/' + node.name;
    
    ui.removeElement(nodePath);
  });

  rootModel.on('node-moved', function (fromNode, toParentNode, node, index) {

    var nodePath = fromNode.path + '/' + node.name;
    var toPath   = node.path;

    ui.removeElement(nodePath);

    // re-render the branch/leaf
    if (node.isBranch) {
      ui.addBranch(node, index);
    } else {
      ui.addLeaf(node, index);
    }
  });

  /**
   * Load interactions
   */
  require('./interactions/drag-and-drop')(rootModel, ui);
  require('./interactions/click')(rootModel, ui);
  require('./interactions/context-menu')(rootModel, ui);
  // require('./context-menu')(rootModel, ui);

  return {
    model: rootModel,
    ui: ui,
  };
};