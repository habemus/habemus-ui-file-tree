module.exports = function (happinessTree, rootModel, uiCore, options) {

  /**
   * Options for branch context menus
   * @type {Array}
   */
  var BRANCH_MENU_OPTIONS = [
    {
      label: 'new file',
      callback: function (data) {
        data.menuElement.close();

        var nodeModel = data.context;

        happinessTree.openDirectory(nodeModel.path)
          .then(function () {

            var element = uiCore.getElement(nodeModel.path, 'branch-child-container');

            /////////////////
            // placeholder //
            //
            // TODO: improve the api of creating a element
            // we are currently using a private method (_leafEl)
            var newFilePlacehodler = uiCore._leafEl({ name: 'new-file' });
            newFilePlacehodler.classList.add(uiCore.ENTER);
            var editableLabel = newFilePlacehodler.querySelector('hab-editable-label');

            if (element.childNodes.length > 0) {
              element.insertBefore(newFilePlacehodler, element.childNodes[0]);
            } else {
              element.appendChild(newFilePlacehodler);
            }

            editableLabel.addEventListener('cancel', function () {
              newFilePlacehodler.remove();
            });
            
            editableLabel.edit(function (value) {
              if (value === '') {
                alert('filename must not be empty');
                editableLabel.cancel();

                newFilePlacehodler.remove();
                return;
              }

              nodeModel.fsCreateFile(value)
                .then(function () {
                  newFilePlacehodler.remove();
                })
                .catch(function (err) {
                  alert('error creating file');
                  console.warn(err);
                  newFilePlacehodler.remove();
                });
            });

          });
      }
    },
    {
      label: 'new folder',
      callback: function (data) {
        data.menuElement.close();
        var nodeModel = data.context;

        happinessTree.openDirectory(nodeModel.path)
          .then(function () {

            var element = uiCore.getElement(nodeModel.path, 'branch-child-container');

            /////////////////
            // placeholder //
            //
            // TODO: improve the api of creating a element
            // we are currently using a private method (_branchEl)
            var newFilePlacehodler = uiCore._branchEl({ name: 'new-folder' });
            newFilePlacehodler.classList.add(uiCore.ENTER);
            var editableLabel = newFilePlacehodler.querySelector('hab-editable-label');

            if (element.childNodes.length > 0) {
              element.insertBefore(newFilePlacehodler, element.childNodes[0]);
            } else {
              element.appendChild(newFilePlacehodler);
            }

            editableLabel.addEventListener('cancel', function () {
              newFilePlacehodler.remove();
            });

            editableLabel.edit(function (value) {
              if (value === '') {
                alert('filename must not be empty');
                editableLabel.cancel();

                newFilePlacehodler.remove();
                return;
              }

              nodeModel.fsCreateDirectory(value)          
                .then(function () {
                  newFilePlacehodler.remove();
                })
                .catch(function (err) {
                  alert('error creating file');
                  console.warn(err);
                  newFilePlacehodler.remove();
                });
            })
          });
      }
    },
    {
      label: 'rename',
      callback: function (data) {
        data.menuElement.close();
        var nodeModel = data.context;

        var element = uiCore.getElement(nodeModel.path);
        var editableLabel = element.querySelector('hab-editable-label');

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
  ];

  /**
   * Add the dirMenu that were passed
   */
  var _dirMenu;
  if (typeof options.dirMenu === 'function') {
    _dirMenu = options.dirMenu(happinessTree);
  } else if (Array.isArray(options.dirMenu)) {
    _dirMenu = options.dirMenu;
  }
  _dirMenu = _dirMenu || [];

  BRANCH_MENU_OPTIONS = BRANCH_MENU_OPTIONS.concat(_dirMenu);

  var branchMenu = document.createElement('hab-context-menu');
  branchMenu.set('options', BRANCH_MENU_OPTIONS);
  document.body.appendChild(branchMenu);

  uiCore.addTreeEventListener('contextmenu', 'branch', function (data) {

    // prevent default
    data.event.preventDefault();

    // select the branch element
    uiCore.uiSelectElement(data.element, { clearSelection: true });

    // offset the context menu open position
    var left = data.event.clientX + 2;
    var top = data.event.clientY - 2;

    var position = {
      left: left,
      top: top,
    };

    branchMenu.menuOpenWithContext(data.model, position);
  });
};
