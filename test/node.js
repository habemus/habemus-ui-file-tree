// native
const assert = require('assert');

// third-party deps
const should = require('should');

const Node = require('../lib/model/node');

describe('new Node', function () {

  it('should require a data object', function () {
    assert.throws(function () {
      var invalidNode = new Node();
    });
  });

  it('should require a valid type (`root`, `branch` or `leaf`)', function () {
    assert.throws(function () {
      var invalidNode = new Node({
        type: 'invalid-type'
      });
    }, TypeError);
  });

  it('attempting to manually set `path` property should throw an error', function () {
    var root = new Node({
      type: 'root',
      rootPath: 'some-path'
    });

    var leaf = new Node({
      type: 'leaf',
      name: 'some-leaf',
      parent: root
    });

    assert.throws(function () {
      leaf.path = 'fake-path';
    });

    leaf.path.should.equal('/some-leaf');
  });

  it('attempting to manually set `absolutePath` property should throw an error', function () {
    var root = new Node({
      type: 'root',
      rootPath: 'some-path'
    });

    var leaf = new Node({
      type: 'leaf',
      name: 'some-leaf',
      parent: root
    });

    assert.throws(function () {
      leaf.absolutePath = 'fake-path';
    });

    leaf.absolutePath.should.equal('some-path/some-leaf');
  });

  describe('type: root', function () {

    it('should require rootPath', function () {
      assert.throws(function () {
        var root = new Node({
          type: 'root',
          rootPath: undefined
        });
      });
    });

    it('should instantiate new node with isRoot === true', function () {
      var root = new Node({
        type: 'root',
        rootPath: '/some/path'
      });

      root.isRoot.should.equal(true);
      root.rootPath.should.equal('/some/path');
      root.type.should.equal('root');
    });

  });

  describe('type: branch', function () {
    it('should require a parent node', function () {
      assert.throws(function () {
        var branch = new Node({
          type: 'branch',
          parent: undefined,
          name: 'some-branch',
        });
      });
    });

    it('should require a name', function () {
      assert.throws(function () {
        var root = new Node({
          type: 'root',
          rootPath: '/some/path'
        });

        var branch = new Node({
          type: 'branch',
          parent: root,
          name: undefined
        });
      });
    });

    it('should instantiate a new node with isBranch === true', function () {
      var root = new Node({
        type: 'root',
        rootPath: '/some/path'
      });

      var branch = new Node({
        type: 'branch',
        parent: root,
        name: 'some-branch',
      });

      branch.isBranch.should.equal(true);
      branch.name.should.equal('some-branch');
      branch.type.should.equal('branch');
    });
  });

  describe('type: leaf', function () {
    it('should require a parent node', function () {

      assert.throws(function () {
        var leaf = new Node({
          type: 'leaf',
          parent: false,
          name: 'some-leaf'
        });
      });
    });

    it('should require a name', function () {
      assert.throws(function () {
        var root = new Node({
          type: 'root',
          rootPath: '/some/path'
        });

        var leaf = new Node({
          type: 'leaf',
          parent: root,
          // name: 'some-leaf'
        });
      });
    });

    it('should instantiate a leaf node with isLeaf === true', function () {
      var root = new Node({
        type: 'root',
        rootPath: '/some/path',
      });

      var leaf = new Node({
        type: 'leaf',
        parent: root,
        name: 'some-leaf'
      });

      leaf.isLeaf.should.equal(true);
      leaf.name.should.equal('some-leaf');
      leaf.type.should.equal('leaf');
    })
  });

});

describe('Node#set(data), Node#set(key, value), Node#get(key)', function () {

  it('should prohibit some instance level keys', function () {
    const PROHIBITED_PROPERTIES = [
      'path',
      'absolutePath',
      'isRoot',
      'isBranch',
      'isLeaf',
      'set',
      'get',
      // event emitter
      'emit',
      'addListener',
      'on',
      'once',
      'removeListener'
    ];

    var node = new Node({
      type: 'root',
      rootPath: 'some/path',
    });

    PROHIBITED_PROPERTIES.forEach(function (prop) {
      assert.throws(function () {
        node.set(prop, 'some-value');
      });

      assert.throws(function () {
        var d = {};
        d[prop] = 'some-value';
        node.set(d);
      });
    });
  });

  it('should set key/value onto the node', function () {
    var node = new Node({
      type: 'root',
      rootPath: 'some/path',
    });

    node.set('some-key', 'some-value');
    node['some-key'].should.equal('some-value');
    node.get('some-key').should.equal('some-value');
  });

  it('should set multiple data properties onto the node', function () {
    var node = new Node({
      type: 'root',
      rootPath: 'some/path',
    });

    node.set({
      key: 'value',
      key1: 'value1'
    });

    node.get('key').should.equal('value');
    node.get('key1').should.equal('value1');
  });
});

describe('Node#path', function () {
  it('should return the path relative to the root node', function () {

    var root = new Node({
      type: 'root',
      rootPath: 'root-path',
    });

    var branch0 = new Node({
      type: 'branch',
      name: 'branch0',
      parent: root,
    });

    var branch1 = new Node({
      type: 'branch',
      name: 'branch1',
      parent: root
    });

    var branch11 = new Node({
      type: 'branch',
      name: 'branch11',
      parent: branch1
    });

    root.path.should.equal('');
    branch0.path.should.equal('/branch0');
    branch1.path.should.equal('/branch1');
    branch11.path.should.equal('/branch1/branch11');
  });
});

describe('Node#absolutePath', function () {

  it('should return the absolutePath including the root node\'s rootPath', function () {

    var root = new Node({
      type: 'root',
      rootPath: 'root-path',
    });

    var branch0 = new Node({
      type: 'branch',
      name: 'branch0',
      parent: root,
    });

    var branch1 = new Node({
      type: 'branch',
      name: 'branch1',
      parent: root
    });

    var branch11 = new Node({
      type: 'branch',
      name: 'branch11',
      parent: branch1
    });

    root.absolutePath.should.equal('root-path');
    branch0.absolutePath.should.equal('root-path/branch0');
    branch1.absolutePath.should.equal('root-path/branch1');
    branch11.absolutePath.should.equal('root-path/branch1/branch11');
  });
});