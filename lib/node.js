function Node(type, name, parent, data) {
  
  if (!type) {
    throw new Error('EntryData requires a type');
  }
  
  if (!name) {
    throw new Error('Node requires a name');
  }

  this.type   = type;
  this.name   = name;
  this.parent = parent || null;

  this.data   = data || {};
}

Node.prototype.getAbsolutePath = function () {

  var parts   = [];
  var current = this;

  while (current.parent) {
    parts.unshift(current.name);
    current = current.parent;
  }

  return '/' + parts.join('/');
};

/**
 * Sets data
 * @param {[type]} data [description]
 */
Node.prototype.setData = function () {

  if (typeof arguments[0] === 'object') {
    // setData({ key: 'value' });
    _.assign(this.data, data);
  } else if (arguments.length === 2) {
    // setData('key', 'value');
    this.data[arguments[0]] = arguments[1];
  }
};

Object.defineProperty(Node.prototype, 'isDirectory', {
  get: function () {
    return this.type === 'directory';
  }
});

Object.defineProperty(Node.prototype, 'isFile', {
  get: function () {
    return this.type === 'file';
  }
});


module.exports = Node;