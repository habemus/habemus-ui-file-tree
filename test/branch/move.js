// native dependencies
const assert = require('assert');

const should = require('should');

const Branch = require('../../lib/model/branch');

describe('Branch#moveNode(nodePath, toPath)', function () {

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
    var b24 = ASSETS.b24 = b2.createChild('leaf', 'b24');
  });

  afterEach(function () {
    ASSETS = {};
  });

  it('should require nodePath', function () {

    assert.throws(function () {
      ASSETS.root.moveNode(undefined, 'b13');
    });
  });

  it('should require toPath', function () {
    assert.throws(function () {
      ASSETS.root.moveNode('b1', undefined);
    });
  });

  it('should move the node to another path', function () {

    ASSETS.root.childNodes.length.should.equal(2);
    ASSETS.b2.childNodes.length.should.equal(4);

    ASSETS.root.moveNode('b1', 'b2');

    ASSETS.root.childNodes.length.should.equal(1);
    ASSETS.b2.childNodes.length.should.equal(5);
  });


  it('should move the node to another path', function () {

    ASSETS.root.childNodes.length.should.equal(2);
    ASSETS.b1.childNodes.length.should.equal(4);

    ASSETS.root.moveNode('b1/b11', '');

    ASSETS.root.childNodes.length.should.equal(3);
    ASSETS.b1.childNodes.length.should.equal(3);
  });

  it('should modify the moved node\'s path', function () {

    ASSETS.b1.path.should.equal('/b1');

    ASSETS.root.moveNode('b1', 'b2');

    ASSETS.b1.path.should.equal('/b2/b1');
  });


  it('should fail to move the child node if the toPath does not exist', function () {

    ASSETS.root.childNodes.length.should.equal(2);
    ASSETS.b2.childNodes.length.should.equal(4);

    assert.throws(function () {
      ASSETS.root.moveNode('b1', 'does-not-exist');
    });

    ASSETS.root.childNodes.length.should.equal(2);
    ASSETS.b2.childNodes.length.should.equal(4);
  });

  it('should fail to move the node if the toPath is a leaf node', function () {

    ASSETS.root.childNodes.length.should.equal(2);
    ASSETS.b2.childNodes.length.should.equal(4);

    assert.throws(function () {
      ASSETS.root.moveNode('b1', 'b2/b24');
    });

    ASSETS.root.childNodes.length.should.equal(2);
    ASSETS.b2.childNodes.length.should.equal(4);
  });

  it('should fail to move if the moved node does not exist', function () {

    ASSETS.root.childNodes.length.should.equal(2);
    ASSETS.b2.childNodes.length.should.equal(4);

    assert.throws(function () {
      ASSETS.root.moveNode('does-not-exist', 'b2');
    });

    ASSETS.root.childNodes.length.should.equal(2);
    ASSETS.b2.childNodes.length.should.equal(4);
  });

  it('should fail to move a node to a path that is within itself', function () {

    ASSETS.root.childNodes.length.should.equal(2);
    ASSETS.b2.childNodes.length.should.equal(4);

    assert.throws(function () {
      ASSETS.root.moveNode('b2', 'b2/b22');
    });

    assert.throws(function () {
      ASSETS.root.moveNode('b2', 'b2');
    });

    ASSETS.root.childNodes.length.should.equal(2);
    ASSETS.b2.childNodes.length.should.equal(4);
  });

  it('should emit `node-moved` event on the source node', function (done) {
    // track node-moved events
    var moved = {};

    ASSETS.b1.on('node-moved', function (fromNode, toNode, node, index) {
      fromNode.should.equal(ASSETS.b1);
      toNode.should.equal(ASSETS.b11);
      node.should.equal(ASSETS.b13);
      index.should.equal(0);

      moved[node.name] = true;
    });

    ASSETS.b1.childNodes.length.should.equal(4);
    ASSETS.b11.childNodes.length.should.equal(0);

    ASSETS.b1.moveNode('b13', 'b11');

    ASSETS.b1.childNodes.length.should.equal(3);
    ASSETS.b11.childNodes.length.should.equal(1);

    // move silently
    ASSETS.b1.moveNode('b12', 'b11', { silent: true });

    ASSETS.b1.childNodes.length.should.equal(2);
    ASSETS.b11.childNodes.length.should.equal(2);

    setTimeout(function () {
      moved['b13'].should.equal(true);

      // event should have been emitted only once
      Object.keys(moved).length.should.equal(1);

      done();
    }, 200);
  });
});
