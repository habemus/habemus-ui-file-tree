exports.ROOT             = 'ht-root';
exports.NODE             = 'ht-node';
exports.LABEL            = 'ht-label';

exports.BRANCH           = 'ht-branch';
exports.BRANCH_LABEL     = 'ht-branch-label';
exports.LEAF             = 'ht-leaf';
exports.LEAF_LABEL       = 'ht-leaf-label';

// drag and drop
exports.DRAGGING = 'ht-dragging';
exports.DRAGOVER = 'ht-dragover';

// statuses
exports.BRANCH_COLLAPSED = 'ht-collapsed';
exports.LOADING          = 'ht-loading';
exports.SELECTED         = 'ht-selected';

/**
 * Class added to a new node element.
 * It is removed sometime before the node's complete removal.
 * Should be used for animations
 * @type {String}
 */
exports.ENTER            = 'ht-enter';

/**
 * Method called to create the element for the root model
 * @param  {Node} nodeData
 * @return {DOM Element}
 */
exports.$rootEl = function (nodeData) {
  var el = document.createElement('div');
  el.classList.add(this.NODE);
  el.classList.add(this.ROOT);

  return el;
}

/**
 * Creates a nodeData element
 * @param  {Node} The nodeData this element refers to
 *         - name
 *         - path
 * @return {DOM Element}
 */
exports.$branchEl = function (nodeData) {

  var el = document.createElement('li');
  el.classList.add(this.NODE);
  el.classList.add(this.BRANCH);
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
  var label = document.createElement('span');
  label.classList.add(this.LABEL);
  label.classList.add(this.BRANCH_LABEL);
  label.innerHTML = [
    '<iron-icon icon="chevron-right"></iron-icon>',
    '<ui-editable-label value="' + nodeData.name + '"><ui-editable-label>'
  ].join('');

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

/**
 * Creates the leaf element
 * @param  {[type]} nodeData [description]
 * @return {[type]}      [description]
 */
exports.$leafEl = function (nodeData) {
  var el = document.createElement('li');
  el.classList.add(this.NODE);
  el.classList.add(this.LEAF);

  return el;
};

exports.$leafLabel = function(nodeData) {
  var el = document.createElement('span');
  el.classList.add(this.LABEL);
  el.classList.add(this.LEAF_LABEL);
  el.innerHTML = [
    '<iron-icon icon="editor:insert-drive-file"></iron-icon>',
    '<ui-editable-label value="' + nodeData.name + '"><ui-editable-label>'
  ].join('');

  return el;
};
