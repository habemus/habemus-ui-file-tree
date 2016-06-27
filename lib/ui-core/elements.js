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
exports.LOADING = 'ht-loading';

/**
 * Class added to a new node element.
 * It is removed sometime before the node's complete removal.
 * Should be used for animations
 * @type {String}
 */
exports.ENTER            = 'ht-enter';
exports.EXIT             = 'ht-exit';


/**
 * Creates a leaf element
 * @param  {Node} nodeModel
 * @return {DOM Element}
 */
exports._leafEl = function (nodeModel) {
  var el = this.$leafEl(nodeModel);
  var label = this.$leafLabel(nodeModel);

  /**
   * Associate the leaf element to its model
   */
  el.model = nodeModel;

  el.setAttribute('data-role', 'leaf');
  // leaf element is draggable
  el.setAttribute('draggable', true);

  label.setAttribute('data-role', 'leaf-label');

  el.appendChild(label);

  return el;
}

/**
 * Branch element creation
 * @private
 * @param  {Node} nodeModel
 * @return {DOM Element}
 */
exports._branchEl = function (nodeModel) {
  var el = nodeModel.isRoot ?
    this.$rootEl(nodeModel) : this.$branchEl(nodeModel);
  var label = this.$branchLabel(nodeModel);
  var container = this.$branchContainer(nodeModel);

  /**
   * Associate all branch elements to corresponding nodeModel
   */
  el.model = nodeModel;

  el.setAttribute('data-role', 'branch');

  // branch element is always draggable
  el.setAttribute('draggable', true);

  // special attributes for the label
  label.setAttribute('data-role', 'branch-label');

  // special attributes for the container
  container.setAttribute('data-role', 'branch-child-container');

  // add the collapsed class to nodes that have the collapsed attribute set to true
  // only root containers start visible
  if (nodeModel.collapsed && !nodeModel.isRoot) {
    el.classList.add(this.BRANCH_COLLAPSED);
  }

  // append elements
  el.appendChild(label);
  el.appendChild(container);

  return el;
}


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
