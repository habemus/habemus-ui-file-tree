const assert = require('assert');

const should = require('should');

const Branch = require('../../lib/model/tree/branch');

describe('Branch', function () {
  it('attempting to manually set `childNodes` property should throw an error', function () {
    var root = new Branch({
      rootPath: 'some-path'
    });

    assert.throws(function () {
      root.childNodes = [];
    });
  });
});