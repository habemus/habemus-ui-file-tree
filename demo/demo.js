// third-party dependencies
const Bluebird = require('bluebird');
// the UITree Constructor
const tree = require('../lib');

// the h-dev api
const hDev = require('./h-dev');

const translations = require('./translations.json');

// instantiate the tree ui
var happiness = tree({
  hDev: hDev,
  rootName: 'my-project',
  translate: function (key) {
    return translations[key];
  },
});
happiness.attach(document.querySelector('#tree-container'));
// initialize by retrieving root childNodes
happiness.openDirectory('')
  .then(function () {
    console.log('initial loading done');
  });

/**
 * Demo control setup
 */
var demoMethods = {
  revealPath: function (formData) {    
    happiness.revealPath(formData.path)
      .then(function () {
        console.log('revealed');
      })
      .catch(function (err) {
        console.warn('could not reveal', err);
      });
  },
  openDirectory: function (formData) {
    happiness.openDirectory(formData.path)
      .then(function () {
        console.log('reached end');
      }).catch(function (err) {
        console.warn('could not reach end', err);
      });
  }
};

var demoControls = document.getElementById('demo-controls');
demoControls.addEventListener('submit', function (e) {
  e.preventDefault();
  e.stopPropagation();

  var target = e.target;

  var method = target.getAttribute('data-method');
  var inputs = Array.prototype.slice.call(target.querySelectorAll('input'), 0);

  var data = inputs.reduce(function (d, input) {

    var name = input.getAttribute('name');

    if (name) {
      d[name] = input.value;
    }

    return d;

  }, {});

  demoMethods[method](data);

});
