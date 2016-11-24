// third-party
const Bluebird = require('bluebird');
const clipboard = require('clipboard-js');
const filesizeParser = require('filesize-parser');

// own
const browserReadFile = require('../../lib/browser-read-file');

function _wait(ms) {
  return new Bluebird(function (resolve, reject) {
    setTimeout(resolve, ms);
  });
}

module.exports = function (happinessTree, rootModel, uiCore, options) {

  var _t              = happinessTree.translate;
  var hDev            = happinessTree.hDev;
  var uiDialogs       = happinessTree.uiDialogs;
  var uiNotifications = happinessTree.uiNotifications;

  var maxFileUploadSize = happinessTree.config.maxFileUploadSize || filesizeParser('1MB');
  maxFileUploadSize = (typeof maxFileUploadSize === 'string') ?
    filesizeParser(maxFileUploadSize) : maxFileUploadSize;

  /**
   * Auxiliary function that reads the contents from a browser
   * file object and writes it to the hDev api.
   * 
   * @param  {String} basepath
   * @param  {File} file
   * @return {Bluebird}
   */
  function _uploadFile(basepath, file) {

    // TODO: abstract this from here
    var fileName = file.webkitRelativePath ? file.webkitRelativePath : file.name;
    var fileSize = file.size;

    if (!fileName) {
      /**
       * No name
       */
      uiNotifications.error.show({
        text: _t('happiness-tree.upload.error-missing-file-name'),
        duration: 4000, 
      });

      return;
    }

    if (fileSize > maxFileUploadSize) {
      /**
       * Max size
       */
      uiNotifications.error.show({
        text: _t('happiness-tree.upload.error-max-size-exceeded', {
          fileName: fileName,
          maxSize: maxFileUploadSize,
        }),
        duration: 4000, 
      });

      return;
    }

    uiNotifications.loading.show({
      text: _t('happiness-tree.upload.reading-file', {
        fileName: fileName,
      }),
      duration: Math.Infinity
    });

    return _wait(500).then(function () {

      return browserReadFile(file);

    }).then(function (fileContents) {

      uiNotifications.loading.show({
        text: _t('happiness-tree.upload.uploading-file', {
          fileName: fileName,
        }),
        duration: Math.Infinity,
      })

      var filepath = basepath + '/' + fileName;

      return hDev.createFile(filepath, fileContents);
    })
    .then(function () {

      uiNotifications.loading.hide();
      uiNotifications.success.show({
        text: _t('happiness-tree.upload.succeeded', {
          fileName: fileName,
        }),
        duration: 3000,
      });

      // aritificially delay some milliseconds so that
      // the experience is better
      return _wait(500);
    })
    .catch(function (err) {

      uiNotifications.loading.hide();
      uiNotifications.error.show({
        text: _t('happiness-tree.upload.failed', {
          fileName: fileName,
          errorName: err.name,
        }),
        duration: 3000
      });

      console.warn(err);

      return _wait(2000);
    });
  }


  /**
   * Options for branch context menus
   * @type {Array}
   */
  var BRANCH_MENU_OPTIONS = [
    {
      label: happinessTree.translate('happiness-tree.file.new'),
      callback: function (data) {
        data.menuElement.close();

        var nodeModel = data.context;

        // first open the directory
        happinessTree.openDirectory(nodeModel.path)
          .then(function () {
            // create an editable placeholder element
            var placeholder = uiCore.addEditablePlaceholder({
              type: 'leaf',
              directoryPath: nodeModel.path,
              value: happinessTree.translate('happiness-tree.file.new-placeholder')
            });

            // activate edition
            placeholder.edit(function (value) {

              // in case an empty value is provided,
              // cancel
              if (value === '') {
                uiDialogs.alert('filename must not be empty');
                placeholder.remove();
                return;
              }

              // create the file then remove
              nodeModel.fsCreateFile(value)
                .then(function () {
                  placeholder.remove();
                })
                .catch(function (err) {
                  uiDialogs.alert('error creating file');
                  console.warn(err);
                  placeholder.remove();
                });
            });
          });
      }
    },
    {
      label: happinessTree.translate('happiness-tree.directory.new'),
      callback: function (data) {
        data.menuElement.close();
        var nodeModel = data.context;

        happinessTree.openDirectory(nodeModel.path)
          .then(function () {

            // create an editable placeholder element
            var placeholder = uiCore.addEditablePlaceholder({
              type: 'branch',
              directoryPath: nodeModel.path,
              value: happinessTree.translate('happiness-tree.directory.new-placeholder')
            });

            placeholder.edit(function (value) {
              if (value === '') {
                uiDialogs.alert('filename must not be empty');
                placeholder.remove();
                return;
              }

              nodeModel.fsCreateDirectory(value)          
                .then(function () {
                  placeholder.remove();
                })
                .catch(function (err) {
                  uiDialogs.alert('error creating file');
                  console.warn(err);
                  placeholder.remove();
                });
            })
          });
      }
    },
    {
      label: happinessTree.translate('happiness-tree.directory.rename'),
      callback: function (data) {
        data.menuElement.close();
        var nodeModel = data.context;

        var element = uiCore.getElement(nodeModel.path);
        var editableLabel = element.querySelector('hab-editable-label');

        editableLabel.edit(function (value) {
          if (value === '') {
            uiDialogs.alert('name must not be empty');
            editableLabel.cancel();

            return;
          }

          return nodeModel.fsRename(value)
            .catch(function (err) {
              uiDialogs.alert('error renaming');
              console.warn(err);

              editableLabel.cancel();
            });
        });
      }
    },
    {
      label: _t('happiness-tree.directory.remove'),
      callback: function (data) {
        // close the context menu immediately
        data.menuElement.close();
        var nodeModel = data.context;

        var path = nodeModel.path;

        var msg = _t('happiness-tree.directory.remove-confirm', {
          path: path,
        });

        uiDialogs.confirm(msg)
          .then(function confrmed() {

            return hDev.remove(path)
          }, function cancelled() {
            console.log('removal cancelled by user');
          })
          .catch(function (err) {
            uiDialogs.alert('error removing');
            console.warn(err);
          });
      }
    },
    {
      label: _t('happiness-tree.directory.copy-path'),
      callback: function (data) {
        data.menuElement.close();
        var nodeModel = data.context;

        clipboard.copy(nodeModel.path)
          .then(function () {
            console.log('copied')
          });
      }
    },
    {
      label: _t('happiness-tree.directory.upload-file'),
      type: 'input:file',
      callback: function (data) {
        data.menuElement.close();
        var nodeModel = data.context;
        var basepath  = nodeModel.path;

        var files = data.files;

        if (!files) {
          return;
        }

        return files.reduce(function (lastUploadPromise, file) {

          return lastUploadPromise.then(function () {
            return _uploadFile(basepath, file);
          });

        }, Bluebird.resolve());

      },
    },
    {
      label: _t('happiness-tree.directory.upload-directory'),
      type: 'input:directory',
      callback: function (data) {
        data.menuElement.close();
        var nodeModel = data.context;
        var basepath  = nodeModel.path;

        var files = data.files;

        if (!files) {
          return;
        }

        return files.reduce(function (lastUploadPromise, file) {
          
          return lastUploadPromise.then(function () {
            return _uploadFile(basepath, file);
          });

        }, Bluebird.resolve());

      },
    }
  ];

  /**
   * Add the dirMenu that were passed
   */
  var CUSTOM;
  if (typeof options.dirMenu === 'function') {
    CUSTOM = options.dirMenu(happinessTree);
  } else if (Array.isArray(options.dirMenu)) {
    CUSTOM = options.dirMenu;
  }
  CUSTOM = CUSTOM || [];

  BRANCH_MENU_OPTIONS = BRANCH_MENU_OPTIONS.concat(CUSTOM);

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
