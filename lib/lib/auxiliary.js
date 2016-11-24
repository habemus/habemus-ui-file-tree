// third-party
const Bluebird = require('bluebird');

exports.wait = function (ms) {
  return new Bluebird(function (resolve) {
    setTimeout(resolve, ms);
  });
};

/**
 * Auxiliary function that reads a file reference from the browser
 * @param  {File} file
 * @return {Bluebird -> ArrayBuffer}
 */
exports.browserReadFile = function browserReadFile(file) {
  return new Bluebird(function (resolve, reject) {
    var reader = new FileReader();

    reader.onload = function () {
      // resolve with the result
      resolve(reader.result);
    };
    
    // start reading
    reader.readAsArrayBuffer(file);
  });
};
