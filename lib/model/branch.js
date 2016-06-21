const util = require('util');

// third-party dependencies
const sorted = require('sorted');

const aux = require('./auxiliary');

const Node = require('./node');
const Leaf = require('./leaf');

function _branchDefaultNodeSortFn(a, b) {

  if (!b) {
    return -1;
  }

  if (a.isBranch && b.isLeaf) {
    return -1;
  } else if (a.isLeaf && b.isBranch) {
    return 1;
  } else {
    // both are of the same level, compare names
    return a.name < b.name ? -1 : 1;
  }

}

/**
 * Branch constructor
 * @param {String} name
 * @param {Object} data
 * @param {Node} parent */
function Branch(name, data, parent) {

  if (!parent) {
    // is the root
    Node.call(this, 'root', name, data);
  } else {
    Node.call(this, 'branch', name, data, parent);
  }

  /**
   * Child nodes in sorted format
   * @type {sorted}
   */
  this.sortedChildNodes = sorted([], _branchDefaultNodeSortFn);
}

util.inherits(Branch, Node);

Branch.prototype.BranchConstructor = Branch;
Branch.prototype.LeafConstructor   = Leaf;

Branch.prototype.addBranch = function (name, data) {

  var self = this;

  var branch = new this.BranchConstructor(name, data, this);

  // propagate events to parents
  branch.on('node-added', function (data) {
    self.emit('node-added', data);
  });

  this._addNode(branch);

  return branch;
};

Branch.prototype.addLeaf = function (name, data) {
  var leaf = new this.LeafConstructor(name, data, this);

  this._addNode(leaf);

  return leaf;
};

Branch.prototype.getChildNodes = function () {
  return this.sortedChildNodes.toArray();
};

Branch.prototype.getChildNode = function (nodeName) {
  return this.sortedChildNodes.elements.find(function (node) {
    return node.name === nodeName;
  });
};

Branch.prototype.getChildNodeLength = function () {
  return this.sortedChildNodes.length;
};

Branch.prototype._addNode = function (node) {

  if (node.isRoot) {
    throw new TypeError('Not possible to add root node to branch');
  }

  this.sortedChildNodes.insert(node);

  var nodeIndex = this.sortedChildNodes.findIndex(node);

  // emit node added event
  this.emit('node-added', {
    index: nodeIndex,
    node: node
  });

  return;
};

Branch.prototype._removeNode = function (node) {
  var nodeIndex = this.sortedChildNodes.findIndex(node);

  if (nodeIndex === -1) {
    throw new Error('node not found', node);
  }

  this.sortedChildNodes.splice(nodeIndex, 1);

  // emit node removed event
  this.emit('node-removed', {
    index: nodeIndex,
    node: node,
  });

  return;
};

// Branch.prototype.isEmpty = function () {
//   return this.sortedChildNodes.length === 0;
// }

// Object.defineProperty(Branch.prototype, 'isEmpty', {
//   get: function () {
//     return (this.sortedChildNodes.length === 0);
//   },

//   set: function () {
//     throw new Error('set prohibited');
//   }
// })

module.exports = Branch;