// native
const EventEmitter = require('events').EventEmitter;
const util         = require('util');

/**
 * List of properties that must not be set at the instance level
 * @type {Array}
 */
const PROHIBITED_PROPERTIES = [
  'path',
  'absolutePath',
  'isRoot',
  'isBranch',
  'isLeaf',
  'set',
  'get',
  'root',

  // event emitter
  'emit',
  'addListener',
  'on',
  'once',
  'removeListener'
];

/**
 * Node constructor
 * @param {String} type   The type of the node. May be 'root', 'branch' or 'leaf'
 * @param {String} name   The name of the node.
 * @param {Object} data   Arbitrary data to be saved onto the node
 * @param {Node} parent   The parent node this node refers to.
 */
// function Node(type, name, data, parent) {
function Node(data) {

  if (!data) { throw new Error('data must not be undefined'); }

  // set the data
  this.set(data);
  
  // verify required properties according to type
  if (this.type === 'branch') {
    this.isBranch = true;

    if (!(this.parent instanceof Node)) {
      throw new TypeError('parent must be instance of Node');
    }
    if (!this.name) {
      throw new Error('branch node must have a name');
    }

  } else if (this.type === 'leaf') {
    this.isLeaf = true;

    if (!(this.parent instanceof Node)) {
      throw new TypeError('parent must be instance of Node');
    }

    if (!this.name) {
      throw new Error('leaf node must have a name');
    }

  } else if (this.type === 'root') {
    this.isRoot = true;

    if (!this.rootPath) {
      throw new Error('root node must have a rootPath');
    }
  } else {
    throw new TypeError('invalid type `' + this.type + '`');
  }
}

util.inherits(Node, EventEmitter);

/**
 * The path to the node starting at the root
 * excluding rootPath
 */
Object.defineProperty(Node.prototype, 'path', {
  get: function () {
    if (this.isRoot) {
      return '';
    } else {
      return this.parent.path + '/' + this.name;
    }
  },
  set: function () {
    throw new Error('prohibited')
  }
});

/**
 * The absolutePath to the node starting at the root
 * including rootPath
 */
Object.defineProperty(Node.prototype, 'absolutePath', {
  get: function () {
    if (this.isRoot) {
      return this.get('rootPath');
    } else {
      return this.parent.absolutePath + '/' + this.name;
    }
  },
  set: function () {
    throw new Error('prohibited')
  }
});

/**
 * Reference to the root node
 */
Object.defineProperty(Node.prototype, 'root', {
  get: function () {
    if (this.isRoot) {
      return this;
    } else {
      return this.parent.root;
    }
  },
  set: function () {
    throw new Error('prohibited')
  }
});

/**
 * Sets data
 * @param {Object} data data object
 *
 * or
 *
 * @param {String} key
 * @param {*}      value
 */
Node.prototype.set = function () {

  if (typeof arguments[0] === 'object') {

    var dataObj = arguments[0];

    Object.keys(dataObj).forEach(function (key) {

      if (PROHIBITED_PROPERTIES.indexOf(key) !== -1) {
        throw new TypeError('Setting ' + key + ' is prohibited');
      }

      this[key] = dataObj[key];

    }.bind(this));

  } else {
    
    var key = arguments[0];
    var value = arguments[1];

    if (PROHIBITED_PROPERTIES.indexOf(key) !== -1) {
      throw new TypeError('Setting ' + key + ' is prohibited');
    }

    this[key] = value;
  }
};

/**
 * Retrieves the value for a given key
 * @param  {String} key
 * @return {*}
 */
Node.prototype.get = function (key) {
  return this[key];
};

/**
 * Checks whether the current node has a given ancestor
 * (is beneath)
 * @param  {Node}    node
 * @return {Boolean}
 */
Node.prototype.hasAncestor = function (node) {

  if (this.isRoot) {
    return false;
  } else {
    // if the node is a root node, immediately return true
    if (node.isRoot) { return true; }

    if (this.parent === node) {
      return true
    } else {
      return this.parent.hasAncestor(node);
    }
  }
};

module.exports = Node;