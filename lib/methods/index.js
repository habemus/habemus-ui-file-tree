// native dependencies
const _path = require('path');

// third-party dependencies
const Bluebird = require('bluebird');

/**
 * Auxiliary function that retrieves the closest element
 * with overflow `auto` or overflow `scroll`
 * @param  {DOM Element} element
 * @return {DOM Element}
 */
function _getClosestScrollContainer(element) {

  var scrollContainer = null;

  var _current = element;
  var _currentStyles;
  var _parentElement;

  while ((scrollContainer === null) && _current) {
    _parentElement = _current.parentElement;

    var _currentStyles = window.getComputedStyle(_current);

    // TODO: we might need to check for overflowX and overflowY as well
    if (_currentStyles.overflow === 'auto' || _currentStyles.overflow === 'scroll') {
      scrollContainer = _current;
      break;
    }

    if (_parentElement) {
      _current = _parentElement;
    } else {
      _current = null;
    }
  }

  return scrollContainer;
}

/**
 * Checks whether the element is within the view and if needed,
 * scrolls the closest scrollContainer to show the element.
 * 
 * @param  {DOMElement} element
 * @return {undefined}
 */
function _scrollIntoViewIfNeeded(element) {


  // WARNING:
  // all this scrolling is highly experimental and might break
  var elementRect = element.getBoundingClientRect();

  var scrollContainer = _getClosestScrollContainer(element);

  if (scrollContainer) {

    var scrollRect = scrollContainer.getBoundingClientRect();

    if (scrollRect.bottom < elementRect.bottom ||
        scrollRect.top > elementRect.top) {
      // TODO: follow the development of this technology
      // in order to use it instead of manipulating scrollTop
      // manually
      // experimental technology
      // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
      // element.scrollIntoView();
      
      var currentScrollTop = parseInt(scrollContainer.scrollTop, 10);

      var scrollDelta = elementRect.top - ((scrollRect.height / 2) + (elementRect.height / 2));

      scrollContainer.scrollTop = currentScrollTop + scrollDelta;
    }
  }
}

/**
 * Proxy some ui methods
 */
exports.uiAddTreeEventListener = function (eventName, elementRole, eventHandler) {
  this.uiCore.addTreeEventListener(eventName, elementRole, eventHandler);
};
exports.uiSelect = function (path, options) {
  var element = this.uiCore.getElement(path);
  this.uiCore.uiSelectElement(element, options);
};
exports.attach = function (containerElement) {
  this.uiCore.attach(containerElement);
};
exports.uiToggleBranch = function (path, open) {
  var element = this.uiCore.getElement(path);
  this.uiCore.uiToggleBranchElement(element, open);
};

/**
 * Macro level methods:
 * these methods involve both the tree model and the tree ui
 */

/**
 * Opens the directory.
 *
 * If the path has not been loaded yet,
 * opens all directories before up to the path
 * 
 * @param  {String} path
 * @return {Bluebird}
 */
exports.openDirectory = function (path) {
  if (!path && path !== '') { throw new Error('path is required'); }

  if (path === '' || path === '/') {

    if (this.rootModel.status === 'loaded') {
      return Bluebird.resolve();
    }

    // read the root directory contents
    // as the root ui branch is always open, no need of
    // toggling it open
    return this.rootModel.fsRead().then(function () {
      // ensure empty return
      return;
    });
  } else {

    var self = this;

    // retrieve the deepest path that currently exists
    var deepestNodeData = this.rootModel.getDeepestNodeByPath(path);

    var deepestNode        = deepestNodeData.node;
    var remainingPathParts = deepestNodeData.remainingPathParts;

    if (remainingPathParts.length === 0) {
      // target node exists
      // check if is a directory and open it
      if (deepestNode.isBranch) {

        if (deepestNode.status === 'loaded') {
          
          // read succesful,
          // toggle all branches open up to the deepest node
          deepestNode.traverseAncestors(function (node) {
            self.uiToggleBranch(node.path, true);
          });

          return Bluebird.resolve();
        } else {
          
          return deepestNode.fsRead()
            .then(function () {
              // read succesful,
              // toggle all branches open up to the deepest node
              deepestNode.traverseAncestors(function (node) {
                self.uiToggleBranch(node.path, true);
              });
            });
        }
      } else {
        console.warn('target node is not a branch');
      }
    } else {
      // target node does not exist
      // loop through remainingPathParts
      
      var _successfullyReadPaths = [];

      function _retrieveNodeContents(node) {
        return node.fsRead().then(function () {
          // read succesful,
          // schedule to toggle it open
          _successfullyReadPaths.push(node.path);

          // return node so that we can chain the promises
          return node;
        });
      }

      // chain of read promises
      return remainingPathParts.reduce(function (parentNodeRead, part) {

        return parentNodeRead.then(function (parentNode) {

          var childNode = parentNode.getChild(part);

          if (!childNode) {
            // not found
            return Bluebird.reject(
              new Error('node `' + parentNode.path + '` does not have a `' + part + '` child')
            );
          } else if (!childNode.isBranch) {
            // found, but not a branch
            return Bluebird.reject(
              new Error('node `' + childNode.path + '` is not a branch')
            );
          } else {
            // read deeper
            return _retrieveNodeContents(childNode);
          }
        })

      }, _retrieveNodeContents(deepestNode))
      .then(function () {
        // all reads succesful
        _successfullyReadPaths.forEach(function (path) {
          self.uiToggleBranch(path, true);
        });

        return;
      })
      .catch(function (err) {
        // read error: open the successful reads and return rejection
        _successfullyReadPaths.forEach(function (path) {
          self.uiToggleBranch(path, true);
        });

        return Bluebird.reject(err);
      });
    }
  }

};

/**
 * Reveals the file and optionally selects it
 * If the file has not been loaded yet,
 * attempts to load it.
 * 
 * @param  {String} path
 * @param  {Object} options
 * @return {Bluebird}
 */
exports.revealPath = function (path, options) {
  return this.openDirectory(_path.dirname(path))
    .then(function () {
      this.uiSelect(path, options);

      var element = this.uiCore.getElement(path);
      _scrollIntoViewIfNeeded(element);

    }.bind(this));
};

exports.promptNewFile = function (parentDir) {

  var self      = this;
  var nodeModel = typeof parentDir === 'object' ?
    parentDir : this.rootModel.getNodeByPath(parentDir);

  // first open the directory
  return this.openDirectory(nodeModel.path)
    .then(function () {
      // create an editable placeholder element
      var placeholder = self.uiCore.addEditablePlaceholder({
        type: 'leaf',
        directoryPath: nodeModel.path,
        value: self.translate('habemus-ui-file-tree.file.new-placeholder')
      });

      // activate edition
      placeholder.edit(function (value) {

        // in case an empty value is provided,
        // cancel
        if (value === '') {
          self.uiDialogs.alert(self.translate('habemus-ui-file-tree.file.new-error.empty-name'));
          placeholder.remove();
          return;
        }

        // remove placeholder immediately
        placeholder.remove();

        self.uiNotifications.loading.show({
          text: self.translate('habemus-ui-file-tree.file.new-loading'),
          duration: Math.Infinity,
        });

        // create the file then remove
        nodeModel.fsCreateFile(value)
          .then(function () {
            self.uiNotifications.loading.hide();
          })
          .catch(function (err) {
            self.uiNotifications.loading.hide();
            self.uiDialogs.alert(self.translate('habemus-ui-file-tree.file.new-error.general'));
            console.warn(err);
          });
      });
    });
};

exports.promptNewDirectory = function (parentDir) {

  var self      = this;
  var nodeModel = typeof parentDir === 'object' ?
    parentDir : this.rootModel.getNodeByPath(parentDir);

  return this.openDirectory(nodeModel.path)
    .then(function () {

      // create an editable placeholder element
      var placeholder = self.uiCore.addEditablePlaceholder({
        type: 'branch',
        directoryPath: nodeModel.path,
        value: self.translate('habemus-ui-file-tree.directory.new-placeholder')
      });

      placeholder.edit(function (value) {
        if (value === '') {
          self.uiDialogs.alert(self.translate('habemus-ui-file-tree.directory.new-error.empty-name'));
          placeholder.remove();
          return;
        }

        // remove placeholder immediately
        placeholder.remove();

        self.uiNotifications.loading.show({
          text: self.translate('habemus-ui-file-tree.directory.new-loading'),
          duration: Math.Infinity,
        });

        nodeModel.fsCreateDirectory(value)          
          .then(function () {
            self.uiNotifications.loading.hide();
          })
          .catch(function (err) {
            self.uiNotifications.loading.hide();
            self.uiDialogs.alert(self.translate('habemus-ui-file-tree.directory.new-error.general'));
            console.warn(err);
          });
      })
    });
};
