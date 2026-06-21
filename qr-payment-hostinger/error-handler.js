// Global error handling - only log to console, don't show in UI
window.addEventListener('error', function(e) {
  // Ignore WebSocket errors from refresh.js
  if (e.message && e.message.includes('WebSocket') && e.message.includes('localhost')) {
    return;
  }
  // Only log to console, don't display in UI
  console.error('Global error:', e.error, e.filename, e.lineno);
});

// Simple check if main.js loaded - only log to console
var _startTime = Date.now();
setTimeout(function() {
  var elapsed = Date.now() - _startTime;
  if (typeof showError === 'undefined') {
    console.error('main.js did not load! Check that main.js exists in the same directory.');
    console.error('Current path:', window.location.pathname);
    console.error('elapsed since page start:', elapsed + 'ms');
    // Don't show error in UI - just log to console
  } else {
    console.log('main.js loaded successfully (after ' + elapsed + 'ms)');
  }
}, 2000);
