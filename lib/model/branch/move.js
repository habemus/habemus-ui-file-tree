/**
 * Moves a descendant node to another position path.
 * @param  {String} nodePath
 * @param  {String} toPath
 * @param  {Object} options
 * @return {undefined}
 */
exports.moveNode = function (nodePath, toPath, options) {

  if (typeof nodePath !== 'string') { throw new Error('nodePath is required'); }
  if (typeof toPath !== 'string') { throw new Error('toPath is required'); }

  // check that both paths exist
  // and that the destination path is a branch or the root itself
  var node = this.getNodeByPath(nodePath);
  if (!node) { throw new Error(nodePath + ' does not exist'); }

  // if the toPath is an empty string, the destination node is this node
  var toNode = (toPath === '') ? this : this.getNodeByPath(toPath);
  if (!toNode) { throw new Error(toPath + ' does not exist'); }
  if (toNode.isLeaf) { throw new Error('target path is not a branch node'); }

  options = options || {};

  // grab reference to the source node
  // (the parent branch of the moved node)
  var fromNode = node.parent;

  // silently remove the node
  fromNode.removeChild(node.name, { silent: true });

  // silently add the node
  toNode.addChild(node, { silent: true });

  // retrieve index of the newly added node
  var nodeIndex = toNode.getChildIndex(node.name);

  // if no silent option was passed, emit event
  // on the source branch 
  if (!options.silent) {
    this.emit('node-moved', fromNode, toNode, node, nodeIndex);
  }

  // return nothing
  return;
}