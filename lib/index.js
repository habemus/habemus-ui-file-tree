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
const Ui    = require('./ui');


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
   * @type {Ui}
   */
  // var ui = new Ui(rootName);
  var ui = new Ui(rootModel);

  // link model to ui
  rootModel.on('node-added', function (parentNode, node, index) {
    if (node.isBranch) {
      ui.addBranch(node, index);
    } else {
      ui.addLeaf(node, index);
    }
  });

  rootModel.on('node-removed', function (parentNode, node, index) {
    ui.removeNode(node.type, node.path);
  });

  rootModel.on('node-moved', function (fromNode, toParentNode, node, index) {
    ui.removeNode(node.type, fromNode.path + '/' + node.name);

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