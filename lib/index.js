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
    rootPath: rootName,
    hfs: hfs,
  });

  /**
   * Instantiate a ui
   * @type {Ui}
   */
  var ui = new Ui(rootName);

  // link model to ui
  rootModel.on('node-added', function (parentNode, node, index) {
    if (node.isBranch) {
      ui.addBranch(parentNode.path, node.name, index);
    } else {
      ui.addLeaf(parentNode.path, node.name, index);
    }
  });

  rootModel.on('node-removed', function (parentNode, node, index) {
    ui.removeNode(node.type, node.path);
  });

  rootModel.on('node-moved', function (parentNode, node, index) {

  });

  /**
   * Load interactions
   */
  require('./interactions/branch')(rootModel, ui);
  require('./interactions/leaf')(rootModel, ui);
  require('./context-menu')(rootModel, ui);

  return {
    model: rootModel,
    ui: ui,
  };
};