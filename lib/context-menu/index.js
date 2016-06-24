module.exports = function (rootModel, ui) {

  /**
   * Context menu on branch labels
   * 
   * @param  {Object} data
   *         - path
   *         - element
   */
  $.contextMenu({
    selector: '.' + ui.BRANCH_LABEL,
    items: {
      remove: {
        name: 'remove',
        callback: function(key, opt) {

          var el = this[0];

          var path = ui.getElementPath(el);

          rootModel.getNodeByPath(path).remove()
            .then(function () {

            })
            .catch(function (err) {
              console.warn('error removing ', err);
            });
        }
      },

      newFile: {
        name: 'new file',
        callback: function (key, opt) {
          var el = this[0];

          var path = ui.getElementPath(el);

          rootModel.getNodeByPath(path)
            .writeFile(Math.ceil(Math.random() * 1000) + '.html', '')
            .then(function () {

            })
            .catch(function (err) {
              console.warn('error createing file', err);
            });
        }
      }
    }
  });

  /**
   * Leaf label context-menu
   */
  $.contextMenu({
    selector: '.' + ui.LEAF_LABEL,
    items: {
      remove: {
        name: 'remove',
        callback: function(key, opt) {

          var el = this[0];

          var path = ui.getElementPath(el);

          rootModel.getNodeByPath(path).remove()
            .then(function () {

            })
            .catch(function (err) {
              console.warn('error removing ', err);
            });
        }
      },
    }
  })

};