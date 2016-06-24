exports.BRANCH_COLLAPSED = 'ht-collapsed';
exports.BRANCH_LOADING   = 'ht-loading';
exports.BRANCH = 'ht-branch';
exports.BRANCH_LABEL = 'ht-branch-label';
exports.LEAF   = 'ht-leaf';
exports.LEAF_LABEL = 'ht-leaf-label';
exports.ROOT   = 'ht-root';


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
  el.className = this.LEAF_LABEL;
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
  el.className = this.BRANCH;
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
  label.className = this.BRANCH_LABEL;
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