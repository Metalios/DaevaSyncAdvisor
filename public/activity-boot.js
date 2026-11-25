/* Independent, local-only startup diagnostics. No network reporting. */
(function () {
  'use strict';
  var banner = document.getElementById('startup-diagnostic');
  if (!banner) return;
  var state = { app: 'pending', sdk: 'pending', error: false };
  function draw() {
    banner.textContent = 'Advisor diagnostic 1 · HTML and startup script loaded · Calculator: ' + state.app + ' · Discord: ' + state.sdk;
    banner.hidden = state.app === 'ready' && (state.sdk === 'ready' || state.sdk === 'browser') && !state.error;
  }
  window.addEventListener('error', function (event) {
    if (event.target && event.target !== window) {
      var name = event.target.tagName;
      if (name !== 'SCRIPT' && name !== 'LINK') return;
      state.error = true;
      state.app = name.toLowerCase() + ' resource failed';
    } else {
      state.error = true;
      state.app = 'JavaScript error: ' + String(event.error && event.error.name || 'Error');
    }
    draw();
  }, true);
  window.addEventListener('unhandledrejection', function (event) {
    state.error = true;
    state.app = 'Unhandled promise rejection: ' + String(event.reason && event.reason.name || 'Error');
    draw();
  });
  window.addEventListener('advisor-startup', function (event) {
    if (!event.detail) return;
    if (typeof event.detail.app === 'string') state.app = event.detail.app;
    if (typeof event.detail.sdk === 'string') state.sdk = event.detail.sdk;
    draw();
  });
  if (window.parent === window) state.sdk = 'browser';
  draw();
  setTimeout(function () {
    if (state.app === 'pending') { state.app = 'startup timed out'; draw(); }
  }, 15000);
}());
