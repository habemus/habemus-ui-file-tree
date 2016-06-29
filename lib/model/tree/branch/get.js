// own dependencies
const aux = require('../auxiliary');

/**
 * Retrieves a child node by its name
 * @param  {String} nodeName
 * @return {Node}
 */
exports.getChild = function (nodeName) {
  if (!nodeName) { throw new Error('nodeName is required'); }

  return this.childNodes.find(function (node) {
    return node.name === nodeName;
  });
};

exports.getChildIndex = function (nodeName) {
  if (!nodeName) { throw new Error('nodeName is required'); }
  
  return this.childNodes.findIndex(function (node) {
    return node.name === nodeName;
  });
};

/**
 * Retrieves a descendant node by path
 * @param  {String|Array} nodepath
 * @return {Node}
 */
exports.getNodeByPath = function (path) {
  if (!path) { throw new Error('path must not be empty'); }

  // break the path into parts so its easier to manipulate it
  var parts = Array.isArray(path) ? path : aux.splitPath(path);

  var currentPart = parts.shift();

  var isTarget = (parts.length === 0);

  // try to find current part
  var node = this.childNodes.find(function (cn) {
    return cn.name === currentPart;
  });

  if (node) {
    return isTarget ? node : node.getNodeByPath(parts);
  } else {
    return;
  }
};

// TODO: merge getDeepestNodeByPath with getNodeByPath

/**
 * Retrieves the deepest node that corresponds to the path given.
 * Returns an object with the remaining path parts and the node.
 * @param  {String} path
 * @return {Object}
 *         - node: Node
 *         - remainingParts: Array
 */
exports.getDeepestNodeByPath = function (path) {
  if (!path) { throw new Error('path must not be empty'); }

  // break the path into parts so its easier to manipulate it
  var parts = Array.isArray(path) ? path : aux.splitPath(path);

  var currentPart = parts.shift();

  var isTarget = (parts.length === 0);

  // try to find current part
  var node = this.childNodes.find(function (cn) {
    return cn.name === currentPart;
  });

  if (node) {

    if (isTarget) {
      // we arrived at the target node
      return {
        node: node,
        remainingPathParts: parts,
      };

    } else {
      // go deeper
      return node.getDeepestNodeByPath(parts);
    }

  } else {
    // put back the not found part
    parts.unshift(currentPart);

    return {
      node: this,
      remainingPathParts: parts
    }
  }
}