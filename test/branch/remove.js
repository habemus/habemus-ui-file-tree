// native dependencies
const assert = require('assert');

const should = require('should');

const Branch = require('../../lib/model/branch');

describe('Branch#removeChild(nodeName)', function () {

  var ASSETS = {};

  beforeEach(function () {
    var root = ASSETS.root = new Branch({
      rootPath: 'some-path'
    });

    var b1  = ASSETS.b1  = root.createChild('branch', 'b1');
    var b11 = ASSETS.b11 = b1.createChild('branch', 'b11');
    var b12 = ASSETS.b12 = b1.createChild('branch', 'b12');
    var b13 = ASSETS.b13 = b1.createChild('branch', 'b13');
    var b14 = ASSETS.b14 = b1.createChild('branch', 'b14');


    var b2  = ASSETS.b2  = root.createChild('branch', 'b2');
    var b21 = ASSETS.b21 = b2.createChild('branch', 'b21');
    var b22 = ASSETS.b22 = b2.createChild('branch', 'b22');
    var b23 = ASSETS.b23 = b2.createChild('branch', 'b23');
    var b24 = ASSETS.b24 = b2.createChild('branch', 'b24');
  });

  afterEach(function () {
    ASSETS = {};
  });

  it('should require nodeName', function () {
    assert.throws(function () {
      ASSETS.b1.removeChild('');
    });

    assert.throws(function () {
      ASSETS.b1.removeChild();
    });
  });

  it('should remove the child node with the given name', function () {

    ASSETS.b1.removeChild('b11');

    should(ASSETS.b1.getChild('b11')).equal(undefined);
    ASSETS.b1.childNodes.length.should.equal(3);

    should(ASSETS.root.getNodeByPath('/b1/b11')).equal(undefined);
    ASSETS.root.getNodeByPath('b2/b21').should.equal(ASSETS.b21);
  });

  it('should throw an error if the node to be removed does not exist', function () {

    assert.throws(function () {
      ASSETS.b1.removeChild('node-that-does-not-exist');
    });

    // child nodes left untouched
    should(ASSETS.b1.getChild('b11')).equal(ASSETS.b11);
    ASSETS.b1.childNodes.length.should.equal(4);
  });

  it('should emit a `node-removed` event upon successful removal', function (done) {

    // track the 'node-removed' events
    var removed = {};

    // events propagate to the root
    ASSETS.root.on('node-removed', function (parent, node, index) {

      parent.should.equal(ASSETS.b1);
      node.should.equal(ASSETS.b11);
      index.should.equal(0);

      removed[node.name] = true;
    });

    // no silent removal
    ASSETS.b1.removeChild('b11');

    // do silent removal
    ASSETS.b1.removeChild('b12', { silent: true });

    ASSETS.b1.childNodes.length.should.equal(2);

    setTimeout(function () {
      removed.b11.should.equal(true);

      // ensure only one remove event was fired
      Object.keys(removed).length.should.equal(1);

      done();
    }, 100);
  });


});
