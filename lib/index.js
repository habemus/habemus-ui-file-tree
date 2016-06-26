// TODOOOOOO
// TODOOOOOO
// TODOOOOOO
// TODOOOOOO
// TODOOOOOO
// TODOOOOOO
// TODOOOOOO:
// study moving model into direct FS domain

const util  = require('util');

const Bluebird = require('bluebird');

// const model = require('./model');
const HFSDir = require('./model/fs');
const UiCore    = require('./ui-core');


module.exports = function (options) {
  if (!options.hfs) { throw new Error('hfs is required'); }
  if (!options.rootName) { throw new Error('rootName is required'); }

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
  // var ui = new UiCore(rootName);
  var ui = new UiCore(rootModel);

  // link model to ui
  rootModel.on('node-added', function (parentNode, node, index) {

    console.log('node-added ', node.path);

    if (node.isBranch) {
      var el = ui.addBranch(node, index);
    } else {
      var el = ui.addLeaf(node, index);
    }
  });

  rootModel.on('node-removed', function (parentNode, node, index) {
    // as the node was removed it no longer has a reference to its parent
    var nodePath = parentNode.path + '/' + node.name;
    
    ui.removeNode(nodePath);
  });

  rootModel.on('node-moved', function (fromNode, toParentNode, node, index) {

    var nodePath = fromNode.path + '/' + node.name;
    var toPath   = node.path;

    ui.removeNode(nodePath);


    // console.log(removedElement)
    // console.log(removedElement.model);

    // ui.addNodeElement(node, removedElement, index);

    // re-render the branch/leaf
    if (node.isBranch) {
      ui.addBranch(node, index);
    } else {
      ui.addLeaf(node, index);
    }

    // console.log('node-moved from ', fromNode.path, ' to ', toParentNode.path);

  });

  /**
   * Load interactions
   */
  require('./interactions/drag-and-drop')(rootModel, ui);
  require('./context-menu')(rootModel, ui);

  return {
    model: rootModel,
    ui: ui,
  };
};