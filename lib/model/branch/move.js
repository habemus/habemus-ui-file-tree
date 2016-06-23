
/**
 * Moves a child node to another position path.
 * @param  {String} nodeName
 * @param  {String} toPath
 * @param  {Object} options
 * @return {undefined}
 */
exports.moveChildTo = function (nodeName, toPath, options) {

  if (!nodeName) { throw new Error('nodeName is required'); }
  if (!toPath) { throw new Error('toPath is required'); }

  // check that both paths exist
  // and that the destination path is a branch or the root itself
  var node = this.getChild(nodeName);
  if (!node) { throw new Error(nodeName + ' does not exist'); }

  var toNode = this.getNodeByPath(toPath);
  if (!toNode) { throw new Error(toPath + ' does not exist'); }
  if (toNode.isLeaf) { throw new Error('target path is not a branch node'); }

  options = options || {};

  // silently remove the node
  node.parent.removeChild(node.name, { silent: true });

  // silently add the node
  toNode.addChild(node, { silent: true });

  // retrieve index of the newly added node
  var nodeIndex = toNode.getChildIndex(node.name);

  // if no silent option was passed, emit event
  // on the source branch (this)
  if (!options.silent) {
    this.emit('node-moved', toNode, node, nodeIndex);
  }

  // return nothing
  return;
}