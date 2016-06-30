// native dependencies
const assert = require('assert');

const should = require('should');

const Branch = require('../../lib/model/tree/branch');
const Leaf = require('../../lib/model/tree/leaf');

describe('Branch#getChild(nodeName)', function () {

  it('should require nodeName', function () {
    var root = new Branch({
      rootPath: 'some-path'
    });

    root.createChild('branch', 'branch-1');

    assert.throws(function () {
      root.getChild(undefined);
    });

    assert.throws(function () {
      root.getChild('');
    });
  });

  it('should retrieve a child node by name', function () {
    var root = new Branch({
      rootPath: 'some-path'
    });

    root.createChild('branch', 'branch-1');
    root.createChild('leaf', 'leaf-1');

    var b1 = root.getChild('branch-1');
    b1.should.be.instanceof(Branch);
    b1.name.should.equal('branch-1');

    var l1 = root.getChild('leaf-1');
    l1.should.be.instanceof(Leaf);
    l1.name.should.equal('leaf-1');
  });

  it('should return undefined if the child does not exist', function () {
    var root = new Branch({
      rootPath: 'some-path'
    });

    root.createChild('branch', 'branch-1');

    should(root.getChild('branch-that-does-not-exist')).eql(undefined);
  });

});

describe('Branch#getChildIndex(nodeName)', function () {

  it('should require nodeName', function () {
    var root = new Branch({
      rootPath: 'some-path'
    });

    root.createChild('branch', 'branch-1');

    assert.throws(function () {
      root.getChildIndex(undefined);
    });

    assert.throws(function () {
      root.getChildIndex('');
    });
  });

  it('should retrieve the position of the child with the given name', function () {
    var root = new Branch({
      rootPath: 'some-path'
    });

    root.createChild('branch', 'branch-1');
    root.createChild('leaf', 'leaf-1');

    root.getChildIndex('branch-1').should.equal(0);
    root.getChildIndex('leaf-1').should.equal(1);
  });

  it('should return -1 if the child does not exist', function () {
    var root = new Branch({
      rootPath: 'some-path'
    });

    root.createChild('branch', 'branch-1');

    root.getChildIndex('branch-that-does-not-exist').should.eql(-1);
  });

});

describe('Branch#getNodeByPath(path)', function () {

  it('should require the path', function () {
    var root = new Branch({
      rootPath: 'some-path'
    });

    var b1 = root.createChild('branch', 'b1');
    var b11 = b1.createChild('branch', 'b11');

    assert.throws(function () {
      root.getNodeByPath('');
    });

    assert.throws(function () {
      root.getNodeByPath(undefined);
    });
  });

  // it.skip('should return itself if the given path is \'\' (empty string)', function () {
  //   var root = new Branch({
  //     rootPath: 'some-path'
  //   });

  //   var b1 = root.createChild('branch', 'b1');
  //   var b11 = b1.createChild('branch', 'b11');

  //   root.getNodeByPath('').should.equal(root);
  //   b1.getNodeByPath('').should.equal(b1);
  //   b11.getNodeByPath('').should.equal(b11);
  // });

  it('should retrieve the node by the given path', function () {
    var root = new Branch({
      rootPath: 'some-path'
    });

    var b1 = root.createChild('branch', 'b1');
    var b11 = b1.createChild('branch', 'b11');

    // the starting and trailing forward slash are ignored
    root.getNodeByPath('b1').should.equal(b1);
    root.getNodeByPath('/b1').should.equal(b1);
    root.getNodeByPath('b1/').should.equal(b1);

    root.getNodeByPath('b1/b11').should.equal(b11);
    root.getNodeByPath('/b1/b11').should.equal(b11);
    root.getNodeByPath('b1/b11/').should.equal(b11);

    b1.getNodeByPath('b11').should.equal(b11);
    b1.getNodeByPath('/b11').should.equal(b11);
    b1.getNodeByPath('b11/').should.equal(b11);
  });

  it('should return undefined if the path refers to no node', function () {
    var root = new Branch({
      rootPath: 'some-path'
    });

    var b1 = root.createChild('branch', 'b1');
    var b11 = b1.createChild('branch', 'b11');

    should(root.getNodeByPath('/b1/b12')).equal(undefined);
    should(root.getNodeByPath('/b2')).equal(undefined);

    should(b11.getNodeByPath('/something-that-does-not-quite-exist')).equal(undefined);
  });

});


describe('Branch#getDeepestNodeByPath(path)', function () {

  // it('should require the path', function () {
  //   var root = new Branch({
  //     rootPath: 'some-path'
  //   });

  //   var b1 = root.createChild('branch', 'b1');
  //   var b11 = b1.createChild('branch', 'b11');

  //   assert.throws(function () {
  //     root.getNodeByPath('');
  //   });

  //   assert.throws(function () {
  //     root.getNodeByPath(undefined);
  //   });
  // });

  // it.skip('should return itself if the given path is \'\' (empty string)', function () {
  //   var root = new Branch({
  //     rootPath: 'some-path'
  //   });

  //   var b1 = root.createChild('branch', 'b1');
  //   var b11 = b1.createChild('branch', 'b11');

  //   root.getNodeByPath('').should.equal(root);
  //   b1.getNodeByPath('').should.equal(b1);
  //   b11.getNodeByPath('').should.equal(b11);
  // });
  
  var ASSETS;

  beforeEach(function () {
    var root = new Branch({
      rootPath: 'some-path',
    });

    var b1 = root.createChild('branch', 'b1');
    var b11 = b1.createChild('branch', 'b11');
    var b111 = b11.createChild('branch', 'b111');
    var b112 = b11.createChild('branch', 'b112');

    var b12 = b1.createChild('branch', 'b12');

    ASSETS = {
      root: root,
      b1: b1,
      b11: b11,
      b111: b111,
      b112: b112,
      b12: b12
    };

    // ensure hierarchy is correct in the beforeEach loop
    ASSETS.root.getNodeByPath('/b1/b11/b112').should.equal(ASSETS.b112);
  });

  afterEach(function () {
    ASSETS = {};
  });

  it('should require the path', function () {
    assert.throws(function () {
      ASSETS.root.getDeepestNodeByPath();
    });
  })
  
  it('should retrieve the deepest node that exists towards the given path', function () {
    var deepestData = ASSETS.root.getDeepestNodeByPath('/b1/b11/does/not/exist');

    deepestData.node.should.equal(ASSETS.b11);
    deepestData.remainingPathParts.should.eql(['does', 'not', 'exist']);

    var existsData = ASSETS.root.getDeepestNodeByPath('/b1/b11/b112');

    existsData.node.should.equal(ASSETS.b112);
    existsData.remainingPathParts.length.should.equal(0);
  });
});
