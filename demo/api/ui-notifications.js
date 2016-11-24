
var uiNotifications = document.querySelector('#ui-notifications');

function _appendLog(className, options) {
  var el = document.createElement('pre');
  el.className = className;
  el.innerHTML = typeof options === 'string' ?
    options : JSON.stringify(options, null, '  ');

  uiNotifications.appendChild(el);
}

/**
 * Loading
 */
exports.loading = {
  _timeout: false,
  show: function (options) {
    _appendLog('notification-loading', options);
  },
  hide: function () {
    _appendLog('notification-loading', 'hide loading');
  },
};

/**
 * Success
 */
exports.success = {
  _timeout: false,
  show: function (options) {
    _appendLog('notification-success', options);
  },
  hide: function () {
    _appendLog('notification-success', 'hide success');
  },
};

/**
 * Error
 */
exports.error = {
  _timeout: false,
  show: function (options) {
    _appendLog('notification-error', options);
  },
  hide: function () {
    _appendLog('notification-error', 'hide error');
  },
};
