const util = require('util');

const Node = require('./node');

function Leaf(name, data, parent) {
  Node.call(this, 'leaf', name, data, parent);
}

util.inherits(Leaf, Node);

module.exports = Leaf;