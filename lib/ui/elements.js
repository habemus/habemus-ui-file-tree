exports.LEAF_CLASS_NAME             = 'leaf';
exports.BRANCH_CLASS_NAME           = 'branch';
exports.BRANCH_COLLAPSED_CLASS_NAME = 'collapsed';
exports.BRANCH_LOADING_CLASS_NAME   = 'loading';


/**
 * Creates the leaf element
 * @param  {[type]} nodeData [description]
 * @return {[type]}      [description]
 */
exports.$leafEl = function (nodeData) {
  var el = document.createElement('li');
  el.className = 'leaf';

  return el;
};

exports.$leafLabel = function(nodeData) {
  var el = document.createElement('label');
  el.innerHTML = nodeData.name;

  return el;
};

/**
 * Creates a nodeData element
 * @param  {Node} The nodeData this element refers to
 *         - name
 *         - path
 * @return {DOM Element}
 */
exports.$branchEl = function (nodeData) {

  var el = document.createElement('li');
  el.className = 'branch';
  return el;
};

/**
 * Creates a label element for the nodeData
 * @param  {Node} nodeData
 *         - name
 *         - path
 * @return {DOM Element}
 */
exports.$branchLabel = function (nodeData) {
  var label = document.createElement('label');
  label.className = 'branch-label';
  label.innerHTML = nodeData.name;

  return label;
};

/**
 * Creates a container element for child nodeDatas
 * @param  {Node} nodeData
 *         - name
 *         - path
 * @return {DOM Element}
 */
exports.$branchContainer = function (nodeData) {
  var container = document.createElement('ul');
  container.className = 'branch-child-container';

  return container;
};