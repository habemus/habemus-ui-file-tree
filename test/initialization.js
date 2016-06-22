const should = require('should');

const Branch = require('../lib/model/branch');

describe('Branch', function () {

  it('sorting should make branches come before leaves', function () {
    var root = new Branch('root');
    // firt add leaf
    var leaf1   = root.addLeaf('leaf1');
    var branch3 = root.addBranch('branch3');
    var branch0 = root.addBranch('branch0');
    var branch1 = root.addBranch('branch1');
    var branch2 = root.addBranch('branch2');

    root.childNodes.indexOf(leaf1).should.equal(4);
    root.childNodes.indexOf(branch3).should.equal(3);
    root.childNodes.indexOf(branch0).should.equal(0);
    root.childNodes.indexOf(branch1).should.equal(1);
    root.childNodes.indexOf(branch2).should.equal(2);
  });

  it('absolutePath should return the path from the root', function () {

    var ROOT_NAME = 'root-path/to-some/root';

    var root = new Branch(ROOT_NAME);
    var branch1 = root.addBranch('branch1');
    var branch2 = root.addBranch('branch2');
    var branch11 = branch1.addBranch('branch11');

    root.absolutePath.should.equal(ROOT_NAME);
    branch1.absolutePath.should.equal(ROOT_NAME + '/branch1');
    branch2.absolutePath.should.equal(ROOT_NAME + '/branch2');
    branch11.absolutePath.should.equal(ROOT_NAME + '/branch1/branch11');
  });

  it('absolutePath should give root \'\' value if no name is given ', function () {

    var root = new Branch();
    var branch1 = root.addBranch('branch1');
    var branch2 = root.addBranch('branch2');
    var branch11 = branch1.addBranch('branch11');

    root.absolutePath.should.equal('');
    branch1.absolutePath.should.equal('/branch1');
    branch2.absolutePath.should.equal('/branch2');
    branch11.absolutePath.should.equal('/branch1/branch11');
  });

  it('should emit `node-added` events when branches are added', function (done) {

    var root = new Branch('');

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

    var branch1 = root.addBranch('branch1');
    var branch2 = root.addBranch('branch2');
  });

  it('should emit `node-added` events when branches are added to sub branches', function (done) {

    var root = new Branch('');

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

    var branch1 = root.addBranch('branch1');
    var branch11 = branch1.addBranch('branch11');
  });
});