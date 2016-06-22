const uuid = require('node-uuid');

const Branch = require('../model/branch');

function Happiness(treeModel, containerElement) {

  if (!treeModel instanceof Branch) {
    throw new Error('treeModel must be instanceof Branch');
  }

  /**
   * The treeModel this tree ui represents
   * @type {Branch}
   */
  this.model = treeModel;

  /**
   * The root of the ui
   * @type {DOMElement}
   */
  this.rootElement = this._branchEl(treeModel);

  /**
   * The DOM element that this tree is attached to.
   * @type {DOM Element}
   */
  this.containerElement = undefined;

  // add event listeners
  this.model.on('node-added', this._onNodeAdded.bind(this));
  this.rootElement.addEventListener('click', function (e) {
    var target = e.target;

    switch (target.getAttribute('data-role')) {
      case 'branch-label':
        var container = target.parentNode.querySelector('[data-role="branch-child-container"]');

        var isHidden = container.getAttribute('hidden');

        if (isHidden) {
          container.removeAttribute('hidden');
        } else {
          container.setAttribute('hidden', true);
        }

        break;
      case 'leaf':
        console.log('open file ' + target.getAttribute('data-path'));
        break;
      default:
        console.log('nothing');
        break;
    }
  });

  if (containerElement) {
    this.attach(containerElement);
  }
}

Happiness.prototype.attach = function (containerElement) {
  this.containerElement = containerElement;

  this.containerElement.appendChild(this.rootElement);
};

Happiness.prototype.getElementByPath = function (path) {
  if (!path) { throw new Error('path is required to retrieve element'); }
  if (!this.containerElement) { throw new Error('tree not attached!'); }

  var selector = '[data-path="' + path + '"]';

  return this.containerElement.querySelector(selector);
};

Happiness.prototype._onNodeAdded = function (parentNode, node, index) {
  // create the element for the node
  var el;

  if (node.isBranch || node.isRoot) {
    el = this._branchEl(node);
  } else {
    el = this._leafEl(node);
  }

  // retrieve parentNode element
  var parentEl = this.getElementByPath(parentNode.absolutePath);
  var container = parentEl.querySelector('[data-role="branch-child-container"]');

  // try to get an element before which the new node element should be inserted
  var insertBefore = container.childNodes[index];

  if (insertBefore) {
    container.insertBefore(el, insertBefore);
  } else {
    container.appendChild(el);
  }
};

Happiness.prototype._leafEl = function (node) {
  var el = this.$leafEl(node);

  el.setAttribute('data-role', 'leaf');
  el.setAttribute('data-path', node.absolutePath);

  return el;
}

Happiness.prototype.$leafEl = function (node) {
  var el = document.createElement('li');
  el.className = 'leaf';
  el.innerHTML = node.name;

  return el;
};




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
  if (!node.isRoot) {
    container.setAttribute('hidden', true);
  }

  // append elements
  el.appendChild(label);
  el.appendChild(container);

  return el;
}


/**
 * Creates a node element
 * @param  {Node} The node this element refers to
 *         - name
 *         - absolutePath
 * @return {DOM Element}
 */
Happiness.prototype.$branchEl = function (node) {

  var el = document.createElement('li');
  el.className = 'branch';
  return el;
};

/**
 * Creates a label element for the node
 * @param  {Node} node
 *         - name
 *         - absolutePath
 * @return {DOM Element}
 */
Happiness.prototype.$branchLabel = function (node) {
  var label = document.createElement('label');
  label.className = 'branch-label';
  label.innerHTML = node.name;

  return label;
};

/**
 * Creates a container element for child nodes
 * @param  {Node} node
 *         - name
 *         - absolutePath
 * @return {DOM Element}
 */
Happiness.prototype.$branchContainer = function (node) {
  var container = document.createElement('ul');
  container.className = 'branch-child-container';

  return container;
};

module.exports = Happiness;