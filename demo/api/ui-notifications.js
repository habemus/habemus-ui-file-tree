/**
 * Loading
 */
exports.loading = {
  _timeout: false,
  show: function (options) {
    console.log('show loading', options);
  },
  hide: function () {
    console.log('hide loading');
  },
};

/**
 * Success
 */
exports.success = {
  _timeout: false,
  show: function (options) {
    console.log('show success', options);
  },
  hide: function () {
    console.log('hide success');
  },
};

/**
 * Error
 */
exports.error = {
  _timeout: false,
  show: function (options) {
    console.warn('show error', options);
  },
  hide: function () {
    console.log('hide error');
  },
};
