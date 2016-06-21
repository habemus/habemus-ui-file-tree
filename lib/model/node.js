// native
const EventEmitter = require('events').EventEmitter;
const util         = require('util');

/**
 * Node constructor
 * @param {String} type   The type of the node. May be 'root', 'branch' or 'leaf'
 * @param {String} name   The name of the node.
 * @param {Object} data   Arbitrary data to be saved onto the node
 * @param {Node} parent   The parent node this node refers to.
 */
function Node(type, name, data, parent) {
  if (typeof name !== 'string' && name) {
    throw new TypeError('name must be a non-empty string');
  }

  if (type === 'branch' || type === 'leaf') {

    if (!parent) {
      throw new Error('parent is required for `' + type + '`');
    }

    this.isBranch = true;
    this.name   = name;
    this.parent = parent;

  } else if (type === 'root') {
    
    this.isRoot = true;
    this.name   = name || '';

  } else {
    throw new TypeError('invalid type `' + type + '`');
  }

  this.data = data || {};
}

util.inherits(Node, EventEmitter);

/**
 * The absolute path to the node
 */
Object.defineProperty(Node.prototype, 'absolutePath', {
  get: function () {
    if (this.isRoot) {
      return this.name;
    } else {
      return this.parent.absolutePath + '/' + this.name;
    }
  },
  set: function () {
    throw new Error('prohibited')
  }
});

/**
 * Sets data
 * @param {[type]} data [description]
 */
Node.prototype.setData = function () {

  if (typeof arguments[0] === 'object') {
    // setData({ key: 'value' });
    for (var prop in arguments[0]) {
      if (arguments[0].hasOwnProperty(prop)) {
        this.setData(prop, arguments[0][prop]);
      }
    }
  } else if (arguments.length === 2) {
    // setData('key', 'value');
    this.data[arguments[0]] = arguments[1];
  }
};


module.exports = Node;