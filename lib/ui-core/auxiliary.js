/**
 * Auxiliary function to assign values from a source to a target object
 */
exports.assign = function(target, source) {
  if (typeof Object.assign === 'function') {
    Object.assign(target, source);
  } else {
    for (var prop in source) {
      if (source.hasOwnProperty(prop)) {
        target[prop] = source[prop];
      }
    }
  }
};
