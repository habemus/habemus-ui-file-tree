// native dependencies
const fs   = require('fs');
const path = require('path');
const util = require('util');

// third-party dependencies
const fse        = require('fs-extra');
const readdirp   = require('readdirp');
const Bluebird   = require('bluebird');
const mime       = require('mime');

const MODES = {
  'application/javascript': 'ace/mode/javascript',
  'application/json': 'ace/mode/json',
  'text/css': 'ace/mode/css',
  'text/html': 'ace/mode/html',
  'text': 'ace/mode/markdown',
};

// the UITree Constructor
const tree = require('../lib');

// constants
// const FS_ROOT_PATH = path.join(__dirname, '../node_modules');
const FS_ROOT_PATH = path.join(__dirname, '_demo_files');

function wait(ms) {
  return new Bluebird((resolve, reject) => {
    setTimeout(resolve, 300);
  });
}

const hfs = require('./hfs');

// instantiate the tree ui
var happiness = tree({
  hfs: hfs,
  rootName: 'my-project'
});
happiness.attach(document.querySelector('#tree-container'));
// initialize by retrieving root childNodes
// happiness.openDirectory('')
//   .then(function () {
//     console.log('initial loading done');
//   });

// happiness.openDirectory(
//   '/ccc/aaabb./commd/chalk/'
// ).then(function () {
//   console.log('reached end');
// }).catch(function (err) {
//   console.warn('could not reach end', err);
// });

// happiness.openDirectory(
//   '/ccc/aaabb./commd/chalk/clone-stats/caseless/center-align/buffer-shims/images/test'
// ).then(function () {
//   console.log('reached end');
// }).catch(function (err) {
//   console.warn('could not reach end', err);
// });

happiness.revealPath(
  '/ccc/aaabb./commd/chalk/clone-stats/caseless/center-align/buffer-shims/images/index.js'
)
.then(function () {
  console.log('revealed');
})
.catch(function (err) {
  console.warn('could not reveal', err);
})

////////////
// editor //
var editor = ace.edit(document.querySelector('#editor'));

happiness.uiAddTreeEventListener('click', 'leaf', function (data) {
  console.log(data.model.path);

  hfs.readFile(data.model.path, 'utf8')
    .then(function (contents) {

      // save the open path to the editor object
      editor.path = data.model.path;

      var mimeType = mime.lookup(data.model.path);
      var aceMode = MODES[mimeType];

      var editSession = ace.createEditSession(new Buffer(contents).toString(), aceMode);

      editor.setSession(editSession);
      // editor.setValue(contents);

    })
    .catch(function (err) {
      alert('error reading file');
      console.warn(err);
    });
});

// keypress
var listener = new window.keypress.Listener();

function save() {
  if (editor.path) {
    var value = editor.getValue();

    hfs.writeFile(editor.path, value);
  }
}
listener.simple_combo('cmd s', save);
listener.simple_combo('ctrl s', save);
