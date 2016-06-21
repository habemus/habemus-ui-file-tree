const uuid = require('node-uuid');

function Happiness() {

  this._nodes = [];

  this.addNode('/', {});

  this.rootElement = this.getNode('/').element;
}

Happiness.prototype.createNodeElement = function (nodeId, nodeData) {

  var nodeEl = document.createElement('li');
  nodeEl.id = nodeId;

  var labelElement = document.createElement('label');
  labelElement.innerHTML = nodeId;
  nodeEl.appendChild(labelElement);

  var childContainer = document.createElement('ul');
  childContainer.setAttribute('data-tree-role', 'child-container');
  nodeEl.appendChild(childContainer);

  return nodeEl;
};

Happiness.prototype.appendChildElement = function (parentElement, childElement) {
  var childContainer = parentElement.querySelector('[data-tree-role="child-container"]');

  console.log(parentElement)

  console.log(childContainer)

  childContainer.appendChild(childElement);
};

Happiness.prototype.getNode = function (nodeId) {
  if (typeof nodeId !== 'string') {
    throw new TypeError('nodeId is required');
  }

  return this._nodes.find(function (n) {
    return n._id = nodeId;
  });
};

Happiness.prototype.addNode = function (nodeName, nodeData, options) {
  if (!nodeName) { throw new Error('nodeName is required'); }
  if (!nodeData) { throw new Error('nodeData is required'); }

  nodeData = nodeData || {};
  options  = options || {};
  parent   = options.parent || '/';
  parent   = (typeof parent === 'string') ? this.getNode(parent) : parent;

  var node = {
    _id: nodeId,
    data: nodeData,
    element: this.createNodeElement(nodeId, nodeData),
  };

  if (parent) {

    node.parent = parent;

    console.log(parent);

    // append node element to the parent node's element
    this.appendChildElement(parent.element, node.element);
  }

  // add the node to the _nodes array
  this._nodes.push(node);

  return nodeId;
};

Happiness.prototype.removeNode = function (nodeId) {

  // return nothing
  return;
};

module.exports = Happiness;