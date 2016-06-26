const util = require('util');

// third-party dependencies
const SortedArray = require('sorted-array');

const Node = require('../node');
const Leaf = require('../leaf');

const aux = require('../auxiliary');

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
// function Branch(name, data, parent) {
function Branch(data) {

  if (data.parent) {
    data.type = 'branch';
  } else {
    data.type = 'root';
  }

  Node.call(this, data);

  if (this.isBranch) {
    // propagate events to parents
    this.on('node-added', function (parentNode, node, index) {
      if (this.parent) {
        this.parent.emit('node-added', parentNode, node, index);
      }
    }.bind(this));

    this.on('node-removed', function (parentNode, node, index) {
      if (this.parent) {
        this.parent.emit('node-removed', parentNode, node, index);
      }
    }.bind(this));

    this.on('node-moved', function (fromParentNode, toParentNode, node, index) {
      if (this.parent) {
        this.parent.emit('node-moved', fromParentNode, toParentNode, node, index);
      }
    }.bind(this));
  }

  /**
   * Child nodes in sorted format
   * @type {sorted}
   */
  this._childNodes = new SortedArray([], _defaultNodeSortFn);
}

util.inherits(Branch, Node);
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
 * ADD methods
 */
Object.assign(Branch.prototype, require('./add'));

/**
 * GET methods
 */
Object.assign(Branch.prototype, require('./get'));

/**
 * REMOVE methods
 */
Object.assign(Branch.prototype, require('./remove'));

/**
 * MOVE methods
 */
Object.assign(Branch.prototype, require('./move'));


module.exports = Branch;