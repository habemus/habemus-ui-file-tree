// third-party
const Bluebird = require('bluebird');

/**
 * Prompt
 */
var uiPromptResolve = false;
var uiPromptForm = document.querySelector('#ui-prompt');
var uiPromptMessage = uiPromptForm.querySelector('h2');
var uiPromptInput   = uiPromptForm.querySelector('[name="response"]');
uiPromptForm.addEventListener('submit', function (e) {
  e.preventDefault();
  e.stopPropagation();

  var response = uiPromptInput.value;

  if (uiPromptResolve) {
    uiPromptResolve(response);

    uiPromptResolve = false;
    uiPromptMessage.innerHTML = '';
    uiPromptInput.value = '';
  }
});
exports.prompt = function (question, options) {
  uiPromptMessage.innerHTML = question;

  uiPromptInput.value = options.defaultValue;

  return new Bluebird(function (resolve) {
    uiPromptResolve = resolve;
  });
};

/**
 * Alert
 */
var uiAlertMessage = document.querySelector('#ui-alert');
exports.alert = function (message) {
  uiAlertMessage.innerHTML = message;
};

/**
 * Confirm
 */
var uiConfirmResolve = false;
var uiConfirmReject = false;
var uiConfirmContainer = document.querySelector('#ui-confirm');
var uiConfirmMessage = uiConfirmContainer.querySelector('h2');
var uiConfirmOk     = uiConfirmContainer.querySelector('[data-action="ok"]');
var uiConfirmCancel = uiConfirmContainer.querySelector('[data-action="cancel"]');

uiConfirmOk.addEventListener('click', function (e) {
  if (uiConfirmResolve) {
    uiConfirmResolve();

    uiConfirmMessage.innerHTML = '';
    uiConfirmResolve = false;
    uiConfirmReject = false;
  }
});
uiConfirmCancel.addEventListener('click', function (e) {
  if (uiConfirmReject) {
    uiConfirmReject();

    uiConfirmMessage.innerHTML = '';
    uiConfirmResolve = false;
    uiConfirmReject = false;
  }
});

exports.confirm = function (message) {

  uiConfirmMessage.innerHTML = message;

  return new Bluebird(function (resolve, reject) {
    uiConfirmResolve = resolve;
    uiConfirmReject = reject;
  });
};