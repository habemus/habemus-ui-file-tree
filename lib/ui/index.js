const uuid = require('node-uuid');

const Branch = require('../model/branch');

const elements = require('./elements');

function Happiness(rootPath, rootName, data) {

  data = data || {};
  data.absolutePath = rootPath;
  data.name = rootName;
  data.isRoot = true;

  /**
   * The root of the ui
   * @type {DOMElement}
   */
  this.rootElement = this._branchEl(data);
}

/**
 * Attaches the tree's root element to the container
 * @param  {DOM Element} containerElement
 */
Happiness.prototype.attach = function (containerElement) {
  this.containerElement = containerElement;

  this.containerElement.appendChild(this.rootElement);
};

/**
 * Retrieves the element that represents the path
 * @param  {String} path
 * @param  {String} role
 * @return {DOM Element}
 */
Happiness.prototype.getElement = function (role, path) {
  if (!path && path !== '') { throw new Error('path is required to retrieve element'); }
  if (!this.containerElement) { throw new Error('tree not attached!'); }

  var selector = '[data-role="' + role + '"][data-path="' + path + '"]';

  var element = this.containerElement.querySelector(selector);

  if (!element) {
    throw new Error('no ' + role + ' for the path ' + path);
  } else {
    return element;
  }
};

/**
 * Retrieves the path the element represents
 * @param  {DOM Element} element The element to check for path
 * @return {String}      Returns false if the element represents no path
 */
Happiness.prototype.getElementPath = function (element) {
  return element.getAttribute('data-path') || false;
};

/**
 * Retrieves the role the element represents
 * @param  {DOM Element} element The element to check for role
 * @return {String}      Returns false if the element represents no role
 */
Happiness.prototype.getElementRole = function (element) {
  return element.getAttribute('data-role') || false;
};

/**
 * Adds a branch element to the tree at the given parentPath
 * @param {String} parentPath Path to the parentNode
 * @param {String} name       The name of the new branch.
 *                            Will be added to the parentPath to compose the
 *                            branch's absolutePath
 * @param {Number} index      Position at which insert the branch
 * @param {Object} data       Arbitrary data used to render the branch element
 */
Happiness.prototype.addBranch = function (parentPath, name, index, data) {

  // parentPath defaults to '' (root)
  parentPath = parentPath || '';
  data = data || {};

  data.isBranch = true;
  data.name = name;
  data.absolutePath = parentPath + '/' + name;

  // retrieve the parent's branch-child-container
  var container = this.getElement('branch-child-container', parentPath);

  // create an element for the branch
  var branchElement = this._branchEl(data);

  // try to get an element before which the new node element should be inserted
  var before = container.childNodes[index];

  if (before) {
    container.insertBefore(branchElement, before);
  } else {
    container.appendChild(branchElement);
  }
};

/**
 * Adds a leaf element to the tree at the given parentPath
 * @param {String} parentPath Path to the parentNode
 * @param {String} name       The name of the new leaf.
 *                            Will be added to the parentPath to compose the
 *                            leaf's absolutePath
 * @param {Number} index      Position at which insert the leaf
 * @param {Object} data       Arbitrary data used to render the leaf element
 */
Happiness.prototype.addLeaf = function (parentPath, name, index, data) {

  // parentPath defaults to '' (root)
  parentPath = parentPath || '';
  data = data || {};

  data.isLeaf = true;
  data.name = name;
  data.absolutePath = parentPath + '/' + name;

  // retrieve the parent's branch-child-container
  var container = this.getElement('branch-child-container', parentPath);

  // create an element for the branch
  var leafElement = this._leafEl(data);

  // try to get an element before which the new node element should be inserted
  var before = container.childNodes[index];

  if (before) {
    container.insertBefore(leafElement, before);
  } else {
    container.appendChild(leafElement);
  }
};

Happiness.prototype._leafEl = function (node) {
  var el = this.$leafEl(node);

  el.setAttribute('data-role', 'leaf');
  el.setAttribute('data-path', node.absolutePath);

  return el;
}

/**
 * Branch element creation
 * @param  {[type]} node [description]
 * @return {[type]}      [description]
 */
Happiness.prototype._branchEl = function (node) {
  var el = this.$branchEl(node);
  var label = this.$branchLabel(node);
  var container = this.$branchContainer(node);

  // special attributes for the branch element
  el.setAttribute('data-role', 'branch');
  el.setAttribute('data-path', node.absolutePath);

  // special attributes for the label
  label.setAttribute('data-role', 'branch-label');
  label.setAttribute('data-path', node.absolutePath);

  // special attributes for the container
  container.setAttribute('data-role', 'branch-child-container');
  container.setAttribute('data-path', node.absolutePath);
  // if (!node.isRoot) {
  //   container.setAttribute('hidden', true);
  // }

  // append elements
  el.appendChild(label);
  el.appendChild(container);

  return el;
}

for (var m in elements) {
  Happiness.prototype[m] = elements[m];
}

module.exports = Happiness;