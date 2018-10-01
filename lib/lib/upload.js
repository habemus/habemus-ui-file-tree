// native
const NODE_PATH = require('path');

// third-party
const Bluebird = require('bluebird');
const filesizeParser = require('filesize-parser');
const browserParseFiles = require('browser-parse-files');

// own
const aux = require('./auxiliary');

module.exports = function (happinessTree, rootModel, uiCore, options) {

  // TODO: transform this into a service
  // TODO: cleanup upload dependencies

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
   * @param  {String} filepath
   * @param  {File} file
   * @return {Bluebird}
   */
  function uploadSingle(filepath, file) {
    var fileName = file.name;
    var fileSize = file.size;

    if (!fileName) {
      /**
       * No name
       */
      uiNotifications.error.show({
        text: _t('habemus-ui-file-tree.upload.error-missing-file-name'),
        duration: 4000, 
      });

      return;
    }

    if (fileSize > maxFileUploadSize) {
      /**
       * Max size
       */
      uiNotifications.error.show({
        text: _t('habemus-ui-file-tree.upload.error-max-size-exceeded', {
          fileName: fileName,
          maxSize: maxFileUploadSize,
        }),
        duration: 4000, 
      });

      return;
    }

    uiNotifications.loading.show({
      text: _t('habemus-ui-file-tree.upload.reading-file', {
        fileName: fileName,
      }),
      duration: Math.Infinity
    });

    return aux.wait(500).then(function () {

      console.log('start read file', file);

      return aux.browserReadFile(file);

    }).then(function (fileContents) {

      console.log('file read', fileContents);

      uiNotifications.loading.show({
        text: _t('habemus-ui-file-tree.upload.uploading-file', {
          fileName: fileName,
        }),
        duration: Math.Infinity,
      })

      return hDev.createFile(filepath, fileContents);
    })
    .then(function () {

      uiNotifications.loading.hide();
      uiNotifications.success.show({
        text: _t('habemus-ui-file-tree.upload.succeeded', {
          fileName: fileName,
        }),
        duration: 3000,
      });

      // aritificially delay some milliseconds so that
      // the experience is better
      return aux.wait(500);
    })
    .catch(function (err) {

      uiNotifications.loading.hide();
      uiNotifications.error.show({
        text: _t('habemus-ui-file-tree.upload.failed', {
          fileName: fileName,
          errorName: err.name,
        }),
        duration: 3000
      });

      console.warn(err);
      console.warn(err.stack);

      return aux.wait(2000);
    });
  };

  return {
    single: uploadSingle,
    fromDropEvent: function (basepath, dropEvent) {
      return browserParseFiles.fromDropEvent(dropEvent).then(function (parsed) {

        var rootDir     = parsed.rootDir;
        var parsedFiles = parsed.files;

        return parsedFiles.reduce(function (lastUploadPromise, parsedFile) {
          
          return lastUploadPromise.then(function () {
            return uploadSingle(
              NODE_PATH.join(basepath, rootDir, parsedFile.path),
              parsedFile.file
            );
          });

        }, Bluebird.resolve());
      })
      .then(function () {

        uiNotifications.success.show({
          text: _t('habemus-ui-file-tree.upload.all-files-succeeded'),
          duration: 3000,
        });

        return;
      });
    },

    fromFilesArray: function (basepath, files) {

      return files.reduce(function (lastUploadPromise, file) {
        
        return lastUploadPromise.then(function () {
          return uploadSingle(
            NODE_PATH.join(basepath, file.name),
            file
          );
        });

      }, Bluebird.resolve())
      .then(function () {

        uiNotifications.success.show({
          text: _t('habemus-ui-file-tree.upload.all-files-succeeded'),
          duration: 3000,
        });

        return;
      });
    },

    /**
     * Webkit exclusive
     */
    fromWebkitDirectoryInput: function (basepath, files) {
      // TODO: study best abstraction for files
      // we must do the upload manually here
      // due to the fact that we need to  use webkitRelativePath property
      return files.reduce(function (lastUploadPromise, file) {
        
        return lastUploadPromise.then(function () {
      
          var filename = file.webkitRelativePath ? file.webkitRelativePath : file.name;

          return uploadSingle(
            NODE_PATH.join(basepath, filename),
            file
          );
        });
      
      }, Bluebird.resolve())
      .then(function () {
      
        uiNotifications.success.show({
          text: _t('habemus-ui-file-tree.upload.all-files-succeeded'),
          duration: 3000,
        });
      
        return;
      });
    }
  };

};
