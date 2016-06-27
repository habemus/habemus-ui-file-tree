const clipboard = require('clipboard-js');

module.exports = function (rootModel, ui) {

  /**
   * Options for leaf context menus
   * @type {Array}
   */
  const LEAF_OPTIONS = [
    {
      label: 'remove',
      callback: function (data) {
        data.menuElement.close();
        var nodeModel = data.context;

        nodeModel.fsRemove()
          .catch(function (err) {
            alert('error removing');
            console.warn(err);
          });
      }
    },
    {
      label: 'rename',
      callback: function (data) {
        data.menuElement.close();
        var nodeModel = data.context;

        var element = ui.getElement(nodeModel.path);
        var editableLabel = element.querySelector('ui-editable-label');

        editableLabel.edit(function (value) {
          if (value === '') {
            alert('value must not be empty');
            editableLabel.cancel();

            return;
          }

          return nodeModel.fsRename(value)
            .catch(function (err) {
              alert('error renaming');
              console.warn(err);

              editableLabel.cancel();
            });
        });
      }
    },
    {
      label: 'copy path',
      callback: function (data) {
        data.menuElement.close();
        var nodeModel = data.context;

        clipboard.copy(nodeModel.path)
          .then(function () {
            console.log('copied')
          });

      }
    }
  ];

  var leafMenu = document.createElement('ht-ui-context-menu');
  leafMenu.set('options', LEAF_OPTIONS);
  document.body.appendChild(leafMenu);

  ui.addTreeEventListener('contextmenu', 'leaf', function (data) {
    var position = {
      left: data.event.clientX + 'px',
      top: data.event.clientY + 'px',
    };

    leafMenu.menuOpenWithContext(data.model, position);
  });
};
