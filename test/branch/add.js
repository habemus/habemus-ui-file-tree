// native dependencies
const assert = require('assert');

const should = require('should');

const Branch = require('../../lib/model/tree/branch');

describe('Branch#addChild(node)', function () {

  it('should not be possible to add root nodes to a branch', function () {
    var root1 = new Branch({
      rootPath: 'some-path'
    });

    var root2 = new Branch({
      rootPath: 'some-other-path'
    });

    assert.throws(function () {
      root1.addChild(root2);
    });
  });

  it('should require the node to be an instanceof Node', function () {
    var root = new Branch({
      rootPath: 'some-path'
    });

    assert.throws(function () {
      root.addChild({
        name: 'fake-leaf',
        isLeaf: true
      });
    });
  });

  it('should throw an error when adding a node that already exists', function () {
    var root = new Branch({
      rootPath: 'some-path'
    });

    var b1 = new Branch({
      name: 'b1',
      parent: root,
    })

    var b1twin = new Branch({
      name: 'b1',
      parent: root,
    })

    root.addChild(b1);
    root.childNodes.length.should.equal(1);

    assert.throws(function () {
      root.addChild(b1twin);
    });

    root.childNodes.length.should.equal(1);
  });
});

describe('Branch#createChild(type, name, data)', function () {
  it('should require type', function () {
    var root = new Branch({
      rootPath: 'some-path'
    });

    assert.throws(function () {
      root.createChild(undefined, 'name');
    });
  });

  it('should require name', function () {
    var root = new Branch({
      rootPath: 'some-path'
    });

    assert.throws(function () {
      root.createChild('branch', undefined);
    });
  });

  it('sorting should make branches come before leaves', function () {
    var root = new Branch({
      rootPath: '/some-path'
    });
    // firt add leaf
    var leaf1   = root.createChild('leaf', 'leaf1');
    var branch3 = root.createChild('branch', 'branch3');
    var branch0 = root.createChild('branch', 'branch0');
    var branch1 = root.createChild('branch', 'branch1');
    var branch2 = root.createChild('branch', 'branch2');

    root.childNodes.indexOf(leaf1).should.equal(4);
    root.childNodes.indexOf(branch3).should.equal(3);
    root.childNodes.indexOf(branch0).should.equal(0);
    root.childNodes.indexOf(branch1).should.equal(1);
    root.childNodes.indexOf(branch2).should.equal(2);
  });

  it('path should return the path from the root', function () {
    var root = new Branch({
      rootPath: '/some-path'
    });
    var branch1 = root.createChild('branch', 'branch1');
    var branch2 = root.createChild('branch', 'branch2');
    var branch11 = branch1.createChild('branch', 'branch11');

    root.path.should.equal('');
    branch1.path.should.equal('/branch1');
    branch2.path.should.equal('/branch2');
    branch11.path.should.equal('/branch1/branch11');
  });

  it('path should give root \'\' value if no name is given ', function () {

    var root = new Branch({
      rootPath: '/some-path',
    });
    var branch1 = root.createChild('branch', 'branch1');
    var branch2 = root.createChild('branch', 'branch2');
    var branch11 = branch1.createChild('branch', 'branch11');

    root.path.should.equal('');
    branch1.path.should.equal('/branch1');
    branch2.path.should.equal('/branch2');
    branch11.path.should.equal('/branch1/branch11');
  });

  it('path should give root \'\' value if no name is given ', function () {

    var root = new Branch({
      rootPath: '/some-path'
    });
    var branch1 = root.createChild('branch', 'branch1');
    var branch2 = root.createChild('branch', 'branch2');
    var branch11 = branch1.createChild('branch', 'branch11');

    root.path.should.equal('');
    branch1.path.should.equal('/branch1');
    branch2.path.should.equal('/branch2');
    branch11.path.should.equal('/branch1/branch11');
  });
});

describe('Branch `node-added` event', function () {

  it('should emit `node-added` events when branches are added', function (done) {

    var root = new Branch({
      rootPath: '/some-path',
    });

    var rootNodeAddedEventCount = 0;

    root.on('node-added', function (parentNode, node, index) {
      parentNode.should.be.instanceof(Branch.prototype.BranchConstructor);
      node.should.be.instanceof(Branch.prototype.BranchConstructor);
      index.should.be.instanceof(Number);

      rootNodeAddedEventCount += 1;

      if (rootNodeAddedEventCount === 2) {
        done();
      }
    });

    var branch1 = root.createChild('branch', 'branch1');
    var branch2 = root.createChild('branch', 'branch2');
  });

  it('should emit `node-added` events when branches are added to sub branches', function (done) {

    var root = new Branch({
      rootPath: '/some-path'
    });

    var rootNodeAddedEventCount = 0;

    root.on('node-added', function (parentNode, node, index) {
      parentNode.should.be.instanceof(Branch.prototype.BranchConstructor);
      node.should.be.instanceof(Branch.prototype.BranchConstructor);
      index.should.be.instanceof(Number);

      rootNodeAddedEventCount += 1;

      if (rootNodeAddedEventCount === 2) {
        // wait for nextTick 
        process.nextTick(function () {
          if (rootNodeAddedEventCount === 2) {
            done();
          } else {
            done(new Error('too many node-added events fired: ' + rootNodeAddedEventCount));
          }
        });
      }
    });

    var branch1 = root.createChild('branch', 'branch1');
    var branch11 = branch1.createChild('branch', 'branch11');
  });

  it('should not emit `node-added` events when branches are added using the silent option', function (done) {

    var root = new Branch({
      rootPath: '/some-path'
    });

    var b1 = new Branch({
      name: 'banana',
      parent: root
    });

    root.on('node-added', function (parentNode, node, index) {
      done(new Error('event should not have been emitted'));
    });

    root.addChild(b1, { silent: true });

    // wait some time
    setTimeout(done, 300);
  });
})