const clipboard = require('clipboard-js');

module.exports = function (rootModel, ui) {

  /**
   * Creates an option element
   * @param  {Object} data
   *         - label
   *         - callback
   * @return {DOM Element}
   */
  function $menuOption(data) {
    var el = document.createElement('div');

    el.innerHTML = data.label;

    return el;
  }

  /**
   * Creates a menu element
   * @param  {Array} options
   *         Array of options that the menu should make available
   *         to the user
   * @return {DOM Element}
   */
  function $menu(options) {

    // variable to keep reference to the target model
    var _contextModel;

    var menuElement = document.createElement('ht-ui-context-menu');

    // setup backdrop
    menuElement.setAttribute('with-backdrop', true);
    // make backdrop traansparent
    menuElement.backdropElement.style.opacity = 0;

    menuElement.style.backgroundColor = 'white';
    menuElement.style.padding = '10px 10px';
    menuElement.style.position = 'fixed';

    // loop over options available at the menu
    // create corresponding elemtns for them
    // and attach event listeners
    options.forEach(function (menuOption) {
      var el = $menuOption(menuOption);

      el.addEventListener('click', function (e) {

        menuOption.callback({
          model: _contextModel,
          menuElement: menuElement,
          event: e,
          menuOption: menuOption,
        });

      });

      menuElement.appendChild(el);
    });

    // menuElement.addEventListener('iron-overlay-closed', function (e) {
    //   menuElement.backdropElement.style.opacity = '';
    // });

    // append the menuElement to the body
    document.body.appendChild(menuElement);
    return {
      open: function (position, model) {

        if (!position) { throw new Error('position is required'); }
        if (!model) { throw new Error('model is required'); }

        // set the context model
        _contextModel = model;

        // let the menu resetFit (see IronOverlayBehavior docs)
        menuElement.resetFit();

        // set positioning styles
        menuElement.style.left = position.left;
        menuElement.style.top  = position.top;

        menuElement.open();
      },
      close: function () {

        // unset the context model
        _contextModel = undefined;

        menuElement.close();
      },
      element: menuElement,
    }
  }

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

        data.model.fsRemove()
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

        var element = ui.getElement(data.model.path);
        var editableLabel = element.querySelector('ui-editable-label');

        editableLabel.edit(function (value) {
          if (value === '') {
            alert('name must not be empty');
            editableLabel.cancel();

            return;
          }

          return data.model.fsRename(value)
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

        var element = ui.getElement(data.model.path, 'branch-child-container');

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

          data.model.fsWriteFile(value, '')
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

        clipboard.copy(data.model.path)
          .then(function () {
            console.log('copied')
          });

      }
    }
  ];

  /**
   * Options for leaf context menus
   * @type {Array}
   */
  const LEAF_OPTIONS = [
    {
      label: 'remove',
      callback: function (data) {
        data.menuElement.close();

        data.model.fsRemove()
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

        var element = ui.getElement(data.model.path);
        var editableLabel = element.querySelector('ui-editable-label');

        editableLabel.edit(function (value) {
          if (value === '') {
            alert('value must not be empty');
            editableLabel.cancel();

            return;
          }

          return data.model.fsRename(value)
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

        clipboard.copy(data.model.path)
          .then(function () {
            console.log('copied')
          });

      }
    }
  ];

  // create menu elments for branch and leaf
  var branchMenu = $menu(BRANCH_OPTIONS);
  var leafMenu = $menu(LEAF_OPTIONS);
  
  ui.addTreeEventListener('contextmenu', 'branch', function (data) {
    var position = {
      left: data.event.clientX + 'px',
      top: data.event.clientY + 'px',
    };

    branchMenu.open(position, data.model);
  });

  ui.addTreeEventListener('contextmenu', 'leaf', function (data) {
    var position = {
      left: data.event.clientX + 'px',
      top: data.event.clientY + 'px',
    };

    leafMenu.open(position, data.model);
  });
};
