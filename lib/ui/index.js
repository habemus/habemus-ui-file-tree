const path = require('path');
const uuid = require('node-uuid');

const Branch = require('../model/branch');

const elements = require('./elements');

/**
 * UI constructor
 * @param {[type]} name [description]
 * @param {[type]} data [description]
 */
function Happiness(name, data) {
  name = name || '';

  /**
   * The display name of the root node
   * @type {String}
   */
  this.name = name;

  data = data || {};
  data.path = '';
  data.name = name;
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
 * Event delegation for the tree
 * 
 * @param {String} DOMEventName
 * @param {String} role
 *        The role the target element has
 *          - leaf
 *          - branch
 *          - branch-label
 *          - branch-child-container
 * @param {Function} eventHandler
 *        Special event handler that receives a special event object
 */
Happiness.prototype.addTreeEventListener = function (DOMEventName, role, eventHandler) {

  console.log('bind', arguments);

  var self = this;

  this.rootElement.addEventListener(DOMEventName, function (e) {
    var target = e.target;

    var targetPath = self.getElementPath(target);

    console.log(targetPath);

    // check that the target has a path defined
    if (targetPath !== false) {
      var targetRole = self.getElementRole(target);

      // check that the target's role matches the required one
      if (targetRole === role) {
        eventHandler({
          path: targetPath,
          role: role,
          target: target,
          // original event
          event: e,
        }); 
      }
    }
  });
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

  // check if attribute exists
  var exists = element.hasAttribute('data-path');

  if (exists) {
    return element.getAttribute('data-path') || '';
  } else {
    return false;
  }
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
 *                            branch's path
 * @param {Number} index      Position at which insert the branch
 * @param {Object} data       Arbitrary data used to render the branch element
 */
Happiness.prototype.addBranch = function (parentPath, name, index, data) {

  // parentPath defaults to '' (root)
  parentPath = parentPath || '';
  data = data || {};

  data.isBranch = true;
  data.name = name;
  data.path = parentPath + '/' + name;

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

  return branchElement;
};

/**
 * Adds a leaf element to the tree at the given parentPath
 * @param {String} parentPath Path to the parentNode
 * @param {String} name       The name of the new leaf.
 *                            Will be added to the parentPath to compose the
 *                            leaf's path
 * @param {Number} index      Position at which insert the leaf
 * @param {Object} data       Arbitrary data used to render the leaf element
 */
Happiness.prototype.addLeaf = function (parentPath, name, index, data) {

  // parentPath defaults to '' (root)
  parentPath = parentPath || '';
  data = data || {};

  data.isLeaf = true;
  data.name = name;
  data.path = parentPath + '/' + name;

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

  return leafElement;
};

Happiness.prototype._leafEl = function (nodeData) {
  var el = this.$leafEl(nodeData);
  var label = this.$leafLabel(nodeData);

  el.setAttribute('data-role', 'leaf');
  el.setAttribute('data-path', nodeData.path);

  el.appendChild(label);

  return el;
}

/**
 * Branch element creation
 * @private
 * @param  {Object} nodeData [description]
 * @return {DOM Element}      [description]
 */
Happiness.prototype._branchEl = function (nodeData) {
  var el = this.$branchEl(nodeData);
  var label = this.$branchLabel(nodeData);
  var container = this.$branchContainer(nodeData);

  // special attributes for the branch element
  el.setAttribute('data-role', 'branch');
  el.setAttribute('data-path', nodeData.path);

  // special attributes for the label
  label.setAttribute('data-role', 'branch-label');
  label.setAttribute('data-path', nodeData.path);

  // special attributes for the container
  container.setAttribute('data-role', 'branch-child-container');
  container.setAttribute('data-path', nodeData.path);

  // append elements
  el.appendChild(label);
  el.appendChild(container);

  return el;
}

for (var m in elements) {
  Happiness.prototype[m] = elements[m];
}

module.exports = Happiness;