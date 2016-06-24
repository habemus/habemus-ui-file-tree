const path = require('path');
const uuid = require('node-uuid');

const Branch = require('../model/branch');

const elements = require('./elements');

/**
 * UI constructor
 * @param {[type]} name [description]
 * @param {[type]} data [description]
 */
function Happiness(rootModel) {
  /**
   * The root of the ui
   * @type {DOMElement}
   */
  this.rootElement = this._branchEl(rootModel);
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
 * @param {String|Array} role
 *        The role the target element has
 *          - leaf
 *          - branch
 *          - branch-label
 *          - branch-child-container
 *        It may be an array of roles
 *        
 * @param {Function} eventHandler
 *        Special event handler that receives a special event object
 */
Happiness.prototype.addTreeEventListener = function (DOMEventName, role, eventHandler) {

  var self = this;


  // transform role in an array of roles
  // if it is a single one
  role = (typeof role === 'string') ? [role] : role; 

  this.rootElement.addEventListener(DOMEventName, function (e) {
    /**
     * 
     * Target element
     * @type {DOM Element}
     */
    var target = e.target;

    /**
     * Target element model
     * @type {Node}
     */
    var targetModel = target.model;

    var targetPath = targetModel.path;

    // check that the target has a path defined
    if (targetPath !== false) {
      var targetRole = self.getElementRole(target);

      


      if (role[0] === 'leaf' && DOMEventName === 'click') {
        console.log('clicked!')
        console.log(targetPath);
        console.log(targetRole);
      }


      /**
       * The closest branch model.
       * If the node is a leaf, return parent
       * if the node is the root or a branch, return the node itself
       * @type {Node}
       */
      var closestBranchModel = (targetModel.isLeaf) ? targetModel.parent : targetModel;

      // check that the target's role matches the required one
      if (role.indexOf(targetRole) !== -1) {
        eventHandler({
          path: targetPath,
          role: targetRole,
          element: target,
          model: targetModel,
          closestBranchModel: closestBranchModel,
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
// Happiness.prototype.addBranch = function (parentPath, name, index, data) {

//   // parentPath defaults to '' (root)
//   parentPath = parentPath || '';
//   data = data || {};

//   data.isBranch = true;
//   data.name = name;
//   data.path = parentPath + '/' + name;

//   // retrieve the parent's branch-child-container
//   var container = this.getElement('branch-child-container', parentPath);

//   // create an element for the branch
//   var branchElement = this._branchEl(data);

//   // try to get an element before which the new node element should be inserted
//   var before = container.childNodes[index];

//   if (before) {
//     container.insertBefore(branchElement, before);
//   } else {
//     container.appendChild(branchElement);
//   }

//   return branchElement;
// };

Happiness.prototype.addBranch = function (nodeModel, index) {

  // retrieve the parent's branch-child-container
  var container = this.getElement('branch-child-container', nodeModel.parent.path);

  // create an element for the branch
  var branchElement = this._branchEl(nodeModel);

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
// Happiness.prototype.addLeaf = function (parentPath, name, index, data) {

//   // parentPath defaults to '' (root)
//   parentPath = parentPath || '';
//   data = data || {};

//   data.isLeaf = true;
//   data.name = name;
//   data.path = parentPath + '/' + name;

//   // retrieve the parent's branch-child-container
//   var container = this.getElement('branch-child-container', parentPath);

//   // create an element for the branch
//   var leafElement = this._leafEl(data);

//   // try to get an element before which the new node element should be inserted
//   var before = container.childNodes[index];

//   if (before) {
//     container.insertBefore(leafElement, before);
//   } else {
//     container.appendChild(leafElement);
//   }

//   return leafElement;
// };
Happiness.prototype.addLeaf = function (nodeModel, index) {

  // retrieve the parent's branch-child-container
  var container = this.getElement('branch-child-container', nodeModel.parent.path);

  // create an element for the branch
  var leafElement = this._leafEl(nodeModel);

  // try to get an element before which the new node element should be inserted
  var before = container.childNodes[index];

  if (before) {
    container.insertBefore(leafElement, before);
  } else {
    container.appendChild(leafElement);
  }

  return leafElement;
};

Happiness.prototype.removeNode = function (role, path) {
  this.getElement(role, path).remove();
};


// element building

Happiness.prototype._leafEl = function (nodeData) {
  var el = this.$leafEl(nodeData);
  var label = this.$leafLabel(nodeData);

  /**
   * Associate elements to corresponding model
   */
  el.model = nodeData;
  label.model = nodeData;

  el.setAttribute('data-role', 'leaf');
  el.setAttribute('data-path', nodeData.path);

  // leaf element is draggable
  el.setAttribute('draggable', true);

  label.setAttribute('data-role', 'leaf-label');
  label.setAttribute('data-path', nodeData.path);

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

  /**
   * Associate all branch elements to corresponding nodeModel
   */
  el.model = nodeData;
  label.model = nodeData;
  container.model = nodeData;

  // special attributes for the branch element
  el.setAttribute('data-role', 'branch');
  el.setAttribute('data-path', nodeData.path);

  // branch element is always draggable
  el.setAttribute('draggable', true);

  // special attributes for the label
  label.setAttribute('data-role', 'branch-label');
  label.setAttribute('data-path', nodeData.path);

  // special attributes for the container
  container.setAttribute('data-role', 'branch-child-container');
  container.setAttribute('data-path', nodeData.path);

  // only root containers start visible
  if (!nodeData.isRoot) {
    el.classList.add(this.BRANCH_COLLAPSED);
  }

  // append elements
  el.appendChild(label);
  el.appendChild(container);

  return el;
}

// assign elements methods
for (var m in elements) {
  Happiness.prototype[m] = elements[m];
}

module.exports = Happiness;