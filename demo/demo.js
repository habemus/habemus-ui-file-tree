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

// promisify some methods
var _writeFile = Bluebird.promisify(fs.writeFile);
var _readdir   = Bluebird.promisify(fs.readdir);
var _readFile  = Bluebird.promisify(fs.readFile);
var _mkdir     = Bluebird.promisify(fs.mkdir);
var _lstat     = Bluebird.promisify(fs.lstat);
var _move      = Bluebird.promisify(fse.move);
var _remove    = Bluebird.promisify(fse.remove);

// constants
// const FS_ROOT_PATH = path.join(__dirname, '../node_modules');
const FS_ROOT_PATH = path.join(__dirname, '_demo_files');

function wait(ms) {
  return new Bluebird((resolve, reject) => {
    setTimeout(resolve, 300);
  });
}

const hfs = {
  readDirectory: function (p) {
    // build the real path
    p = path.join(FS_ROOT_PATH, p);

    // simulate very bad connection
    return wait()
      .then(() => {
        return _readdir(p)
      })
      .then((contents) => {
        return Bluebird.all(contents.map((contentName) => {

          var contentPath = path.join(p, contentName);

          return _lstat(contentPath)
            .then((stat) => {

              // process the stat object before returning
              stat.basename = contentName;

              return stat;
            });
        }));
      });
  },

  remove: function (p) {
    p = path.join(FS_ROOT_PATH, p);

    return wait()
      .then(function () {
        return _remove(p);
      });
  },

  move: function (src, dest) {
    src = path.join(FS_ROOT_PATH, src);
    dest = path.join(FS_ROOT_PATH, dest);

    return wait().then(function () {
      return _move(src, dest);
    });
  },

  readFile: function (p, options) {
    p = path.join(FS_ROOT_PATH, p);

    return wait().then(function () {
      return _readFile(p, options);
    });
  },

  createFile: function (p) {
    p = path.join(FS_ROOT_PATH, p);

    return wait()
      .then(function () {
        return _lstat(p);
      })
      .then(function (stats) {
        // stats exist, throw error
        return Bluebird.reject('file exists');
      })
      .catch(function (err) {
        // stats do not exist, create file
        return _writeFile(p, '');
      });
  },

  createDirectory: function (p) {
    p = path.join(FS_ROOT_PATH, p);

    return wait().then(function () {
      return _mkdir(p);
    });
  }
};

// instantiate the tree ui
var happiness = tree({
  hfs: hfs,
  rootName: 'my-project'
});
happiness.attach(document.querySelector('#tree-container'));
// initialize by retrieving root childNodes
happiness.openDirectory('')
  .then(function () {
    console.log('initial loading done');
  });

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
