// constants
exports.BRANCH_COLLAPSED = 'ht-collapsed';
exports.SELECTED         = 'ht-selected';

/**
 * Toggles a branch element collapsed state
 * @param element {DOMElement}
 * @param open {Boolean}
 */
exports.uiToggleBranchElement = function (element, open) {
  if (typeof open === 'boolean') {
    // use opposite value of open, because we are using a
    // negative class (collapsed)
    element.classList.toggle(this.BRANCH_COLLAPSED, !open);
  } else {
    element.classList.toggle(this.BRANCH_COLLAPSED);
  }
};

/**
 * Collapses all branches
 */
exports.uiCollapseAllBranches = function () {
  var branches = this.rootElement.querySelectorAll('.' + this.BRANCH);

  Array.prototype.forEach.call(branches, function (branchEl) {
    branchEl.classList.add(this.BRANCH_COLLAPSED);
  }.bind(this));
};

/**
 * Selects element
 * @param element {DOMElement}
 * @param options {Object}
 *          - clearSelection {Boolean} defaults to true
 */
exports.uiSelectElement = function (element, options) {
  options = options || {};

  // default clearSelection to true
  options.clearSelection = (typeof options.clearSelection !== 'undefined') ?
    options.clearSelection : true;

  if (options && options.clearSelection) {
    this.uiClearSelection();
  }

  element.classList.add(this.SELECTED);
};

/**
 * Deselects an element
 * @param element {DOMElement}
 */
exports.uiDeselectElement = function (element) {
  element.classList.remove(this.SELECTED)
};

/**
 * Clears all selected elements
 */
exports.uiClearSelection = function () {
  var selected = this.containerElement.querySelectorAll('.' + this.SELECTED);

  Array.prototype.forEach.call(selected, function (el) {
    el.classList.remove(this.SELECTED);
  }.bind(this));
};
