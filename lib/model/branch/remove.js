exports.removeChild = function (nodeName, options) {
  if (!nodeName) { throw new Error('nodeName is required'); }

  options = options || {};

  var node = this.getChild(nodeName);

  if (!node) {
    throw new Error(this.path + '/' + nodeName + ' does not exist');

  } else {

    // get the index for the event
    var nodeIndex = this.getChildIndex(nodeName);

    // remove
    this._childNodes.remove(node);

    // only emit the 'node-removed' event if the silent option is not passed
    if (!options.silent) {
      this.emit('node-removed', this, node, nodeIndex);
    }

    return;
  }
};