const util = require('util');

// third-party dependencies
const SortedArray = require('sorted-array');

const Node = require('../node');

/**
 * Creates a child node and adds it to the branch
 * @param  {String} type Either 'branch' or 'leaf'
 * @param  {String} name Must not be empty
 * @param  {Object} data
 * @return {Node}
 */
exports.createChild = function (type, name, data) {
  if (!type) { throw new Error('type is required'); }
  if (!name) { throw new Error('name is required'); }

  data = data || {};
  data.name = name;
  data.parent = this;

  var node = (type === 'branch') ?
    new this.BranchConstructor(data) : new this.LeafConstructor(data);

  this.addChild(node);

  return node;
};

/**
 * Adds the node to the _childNodes sorted array
 * It emits the 'node-added' event.
 * @param {Node} node
 */
exports.addChild = function (node, options) {

  if (node instanceof Node === false) {
    throw new TypeError('Add child node requires a node object to be added');
  }

  if (node.isRoot) {
    throw new TypeError('Not possible to add root node as a branch');
  }

  // check if the child node already exists
  if (this.getChild(node.name)) {
    throw new Error(this.path + '/' + name + ' already exists');
  }

  options = options || {};

  // set the childNode's parent
  node.parent = this;

  // insert the node using SortedArray#insert method
  // so that insertion is always done according to sort function
  this._childNodes.insert(node);

  // retrieve the inserted node's index
  var nodeIndex = this._childNodes.search(node);

  if (node.isBranch) {
    // in case the node added is a branch
    // propagate events to parent branches
    node.on('node-added', function (parent, node, index) {
      this.emit('node-added', parent, node, index);
    }.bind(this));

    node.on('node-removed', function (parent, node, index) {
      this.emit('node-removed', parent, node, index);
    }.bind(this));
  }

  if (!options.silent) {
    // emit node added event only if the silent option is not passed
    this.emit('node-added', this, node, nodeIndex);
  }

  return;
};
