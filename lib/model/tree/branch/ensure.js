exports.ensureExists = function (type, path, data) {

  var deepestNodeData = this.getDeepestNodeByPath(path);

  var remainingPathParts = deepestNodeData.remainingPathParts;
  var deepestNode = deepestNodeData.node;

  while (remainingPathParts.length > 0) {
    if (remainingPathParts.length === 1) {
      // create a node of the required type, as it is the last one
      deepestNode = deepestNode.createChild(type, remainingPathParts.shift(), data);

    } else {
      deepestNode = deepestNode.createChild('branch', remainingPathParts.shift());
    }
  }
};

exports.ensureDoesNotExist = function (type, path) {
  // attempt to retrive the node for the path
  // if it exists, remove it
  var node = this.getNodeByPath(path);

  if (node && node.type === type) {
    node.removeSelf();
  }

};
