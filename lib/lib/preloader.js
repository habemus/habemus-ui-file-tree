function Preloader(options) {

  if (!options.maxConcurrent) {
    throw new Error('maxConcurrent must be a number')
  }

  if (!options.maxEnqueued) {
    throw new Error('maxEnqueued must be a number');
  }

  this.maxConcurrent = options.maxConcurrent;
  this.maxEnqueued   = options.maxEnqueued;

  this.queue   = [];
  this.current = [];

  this._dequeueInterval = false;
}

Preloader.prototype.preload = function (id, loadFn) {

  // check if the preload request does not already exist
  var request = this.queue.find(function (preloadRequest) {
    return preloadRequest.id === id;
  }) || this.current.find(function (preloadRequest) {
    return preloadRequest.id === id;
  });

  if (request) {
    return;
  }

  if (this.queue.length >= this.maxEnqueued) {
    this.queue.shift();
  }

  this.queue.push({
    id: id,
    load: loadFn
  });

  this.dequeue();
};

Preloader.prototype.dequeue = function () {
  if (this.queue.length === 0) {
    return;
  }

  if (this.current.length >= this.maxConcurrent) {
    return false;
  }

  var self = this;

  var next = this.queue.shift();

  // execute the load function and store
  // reference to the promise
  next.promise = next.load();

  this.current.push(next);

  next.promise.then(function () {
    var idx = self.current.findIndex(function (preloadRequest) {
      return preloadRequest.id === next.id;
    });
    
    if (idx >= 0) {
      self.current.splice(idx, 1);
      self.dequeue();
    }
  });
};

module.exports = Preloader;
