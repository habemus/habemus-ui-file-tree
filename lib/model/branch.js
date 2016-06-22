const util = require('util');

// third-party dependencies
const SortedArray = require('sorted-array');

const Node = require('./node');
const Leaf = require('./leaf');

const aux = require('./auxiliary');

/**
 * Sorts nodes.
 * branches to the top,
 * leaves to the end and
 * among equals, sort alphabetically
 */
function _defaultNodeSortFn(a, b) {
  if (!b) {
    // if no b, a comes first
    return -1;
  }

  if (!a) {
    // if no a, b comes first
    return 1;
  }

  if (a.isBranch && b.isLeaf) {
    // branches come first
    return -1;
  } else if (a.isLeaf && b.isBranch) {
    // leaves come later
    return 1;
  } else {

    // both are of the same level, compare names
    if (a.name < b.name) {
      return -1;
    } else if (a.name > b.name) {
      return 1;
    } else {
      return 0;
    }
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
  this._childNodes = new SortedArray([], _defaultNodeSortFn);
}

util.inherits(Branch, Node);

/**
 * Define a pseudo property for 'childNodes'
 * so that it returns the SortedArray#array
 * @type {Array}
 */
Object.defineProperty(Branch.prototype, 'childNodes', {
  get: function () {
    return this._childNodes.array;
  },
  set: function () {
    throw new Error('cannot set childNodes');
  }
});

/**
 * Constructor function to be used when creating child branches
 * @type {Branch}
 */
Branch.prototype.BranchConstructor = Branch;

/**
 * Constructor function to be used when creating child leaves
 * @type {Leaf}
 */
Branch.prototype.LeafConstructor = Leaf;

/**
 * Adds a branch to this branch
 * given the name and optional data
 * 
 * The name will be used to build the newly added branch's path
 * 
 * @param {String} name
 * @param {Object} data
 */
Branch.prototype.addBranch = function (name, data) {

  var self = this;

  var branch = new this.BranchConstructor(name, data, this);

  // propagate events to parents
  branch.on('node-added', function (parent, node, index) {
    self.emit('node-added', parent, node, index);
  });

  this._addNode(branch);

  return branch;
};

/**
 * Adds a leaf node to this branch.
 * 
 * @param {String} name
 * @param {Object} data
 */
Branch.prototype.addLeaf = function (name, data) {
  var leaf = new this.LeafConstructor(name, data, this);

  this._addNode(leaf);

  return leaf;
};

/**
 * Retrieves a child node by its name
 * @param  {String} nodeName
 * @return {Node}
 */
Branch.prototype.getChildNode = function (nodeName) {
  return this._childNodes.array.find(function (node) {
    return node.name === nodeName;
  });
};

/**
 * Retrieves a child node by its name
 * @param  {String} nodeName
 * @return {Node}
 */
Branch.prototype.getNode = function (path) {
  if (!path) { throw new Error('path must not be empty'); }

  // break the path into parts so its easier to manipulate it
  var parts = Array.isArray(path) ? path : aux.splitPath(path);

  var currentPart = parts.shift();

  var isTarget = (parts.length === 0);

  // try to find current part
  var node = this.childNodes.find(function (cn) {
    return cn.name === currentPart;
  });

  if (node) {
    return isTarget ? node : node.getNode(parts);
  } else {
    // throw new Error('node not found');
  }
};

/**
 * Private method that adds the node to the _childNodes sorted array
 * It emits the 'node-added' event.
 * @param {Node} node
 */
Branch.prototype._addNode = function (node) {

  if (node.isRoot) {
    throw new TypeError('Not possible to add root node to branch');
  }

  this._childNodes.insert(node);

  var nodeIndex = this._childNodes.search(node);

  // emit node added event
  this.emit('node-added', this, node, nodeIndex);

  return;
};

module.exports = Branch;