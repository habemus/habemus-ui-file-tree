const util = require('util');

const Node = require('./node');

function Leaf(data) {
  data.type = 'leaf';
  
  Node.call(this, data);
}

util.inherits(Leaf, Node);

module.exports = Leaf;