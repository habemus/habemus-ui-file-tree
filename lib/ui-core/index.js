// element-related methods
const elements = require('./elements');

/**
 * UI constructor
 * @param {Node} rootModel
 */
function Happiness(rootModel) {
  /**
   * The root of the ui
   * @type {DOMElement}
   */
  this.rootElement = this._branchEl(rootModel);

  this.rootModel = rootModel;
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
 * Retrieves the element's corresponding model (closest)
 * @param  {DOM Element} element
 * @return {Node}
 */
Happiness.prototype.getElementModel = function (element) {
  var _el = element;

  /**
   * Walk the node tree until a model is found.
   */
  while (!_el.model) {
    _el = _el.parentNode;
  }

  if (!_el) {
    return false;
  } else {
    return _el.model;
  }
}

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
Happiness.prototype.addTreeEventListener = function (DOMEventName, requiredRoles, eventHandler) {

  var self = this;

  // transform requiredRoles in an array of requiredRoless
  // if it is a single one
  requiredRoles = (typeof requiredRoles === 'string') ? [requiredRoles] : requiredRoles; 

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
    var targetModel = self.getElementModel(target);
    var targetPath = targetModel.path;

    // check that the target has a path defined
    if (targetPath !== false) {
      var targetRole = self.getElementRole(target);
      /**
       * The closest branch model.
       * If the node is a leaf, return parent
       * if the node is the root or a branch, return the node itself
       * @type {Node}
       */
      var closestBranchModel = (targetModel.isLeaf) ? targetModel.parent : targetModel;

      // check that the target's requiredRoles matches the required one
      if (requiredRoles.indexOf(targetRole) !== -1) {
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
Happiness.prototype.getElement = function (path, role) {
  if (!path && path !== '') { throw new Error('path is required to retrieve element'); }
  if (!this.containerElement) { throw new Error('tree not attached!'); }

  var pathElement = path === '' ?
    this.rootElement : this.rootElement.querySelector('[data-path="' + path + '"]');

  if (role) {
    return pathElement.querySelector('[data-role="' + role + '"]');
  } else {
    return pathElement;
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
Happiness.prototype.addBranch = function (nodeModel, index) {

  // create an element for the branch
  var branchElement = this._branchEl(nodeModel);

  this.addNodeElement(nodeModel, branchElement, index);

  // loop childNodes and add corresponding nodes
  nodeModel.childNodes.forEach(function (childNode) {
    if (childNode.isBranch) {
      this.addBranch(childNode);
    } else if (childNode.isLeaf) {
      this.addLeaf(childNode);
    }
  }.bind(this));

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
Happiness.prototype.addLeaf = function (nodeModel, index) {
  // create an element for the branch
  var leafElement = this._leafEl(nodeModel);

  this.addNodeElement(nodeModel, leafElement, index)

  return leafElement;
};

/**
 * Adds a node element to the tree at a given index
 * @param {Node} nodeModel
 * @param {DOM Element} element
 * @param {Number} index
 */
Happiness.prototype.addNodeElement = function (nodeModel, element, index) {

  // set the 'data-path' attribute of the element
  // to match the model's
  element.setAttribute('data-path', nodeModel.path);

  // retrieve the parent's branch-child-container
  var container = this.getElement(nodeModel.parent.path, 'branch-child-container');
  
  // try to get an element before which the new node element should be inserted
  var before = container.childNodes[index];

  if (before) {
    container.insertBefore(element, before);
  } else {
    container.appendChild(element);
  }

  // add the enter class on the next tick
  // so that the ui first renders the element then animates it in
  setTimeout(function () {
    element.classList.add(this.ENTER);
  }.bind(this), 0);

  // return nothing
  return;
}

/**
 * Removes the element at the given path
 * Sets the removal for 200 ms, to wait for the exit animation to be over
 * @param  {String} path
 */
Happiness.prototype.removeElement = function (path) {
  var el = this.getElement(path);

  el.classList.remove(this.ENTER);

  setTimeout(function () {
    el.remove();
  }, 200);

  return;
};

/**
 * Creates a leaf element
 * @param  {Node} nodeModel
 * @return {DOM Element}
 */
Happiness.prototype._leafEl = function (nodeModel) {
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
Happiness.prototype._branchEl = function (nodeModel) {
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

// assign element methods
for (var m in elements) {
  Happiness.prototype[m] = elements[m];
}

module.exports = Happiness;