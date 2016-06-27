const clipboard = require('clipboard-js');

module.exports = function (rootModel, ui) {

  /**
   * Options for branch context menus
   * @type {Array}
   */
  const BRANCH_OPTIONS = [
    {
      label: 'remove',
      callback: function (data) {
        // close the context menu immediately
        data.menuElement.close();

        var nodeModel = data.context;

        nodeModel.fsRemove()
          .then(function () {
            // console.log('remove successful');
          })
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
            alert('name must not be empty');
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
      label: 'add file',
      callback: function (data) {
        data.menuElement.close();

        var nodeModel = data.context;

        var element = ui.getElement(nodeModel.path, 'branch-child-container');

        /////////////////
        // placeholder //
        //
        // TODO: improve the api of creating a element
        // we are currently using a private method (_leafEl)
        var newFilePlacehodler = ui._leafEl({ name: 'new-file' });
        newFilePlacehodler.classList.add(ui.ENTER);
        var editableLabel = newFilePlacehodler.querySelector('ui-editable-label');

        if (element.childNodes.length > 0) {
          element.insertBefore(newFilePlacehodler, element.childNodes[0]);
        } else {
          element.appendChild(newFilePlacehodler);
        }

        editableLabel.edit(function (value) {
          if (value === '') {
            alert('filename must not be empty');
            editableLabel.cancel();

            newFilePlacehodler.remove();
            return;
          }

          nodeModel.fsWriteFile(value, '')
            .then(function () {
              newFilePlacehodler.remove();
            })
            .catch(function (err) {
              alert('error creating file');
              console.warn(err);
              newFilePlacehodler.remove();
            });
        })
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

  var branchMenu = document.createElement('ht-ui-context-menu');
  branchMenu.set('options', BRANCH_OPTIONS);
  document.body.appendChild(branchMenu);

  ui.addTreeEventListener('contextmenu', 'branch', function (data) {
    var position = {
      left: data.event.clientX + 'px',
      top: data.event.clientY + 'px',
    };

    branchMenu.menuOpenWithContext(data.model, position);
  });
};
