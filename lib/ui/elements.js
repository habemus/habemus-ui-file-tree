/**
 * Creates the leaf element
 * @param  {[type]} node [description]
 * @return {[type]}      [description]
 */
exports.$leafEl = function (node) {
  var el = document.createElement('li');
  el.className = 'leaf';
  el.innerHTML = node.name;

  return el;
};

/**
 * Creates a node element
 * @param  {Node} The node this element refers to
 *         - name
 *         - path
 * @return {DOM Element}
 */
exports.$branchEl = function (node) {

  var el = document.createElement('li');
  el.className = 'branch';
  return el;
};

/**
 * Creates a label element for the node
 * @param  {Node} node
 *         - name
 *         - path
 * @return {DOM Element}
 */
exports.$branchLabel = function (node) {
  var label = document.createElement('label');
  label.className = 'branch-label';
  label.innerHTML = node.name;

  return label;
};

/**
 * Creates a container element for child nodes
 * @param  {Node} node
 *         - name
 *         - path
 * @return {DOM Element}
 */
exports.$branchContainer = function (node) {
  var container = document.createElement('ul');
  container.className = 'branch-child-container';

  return container;
};