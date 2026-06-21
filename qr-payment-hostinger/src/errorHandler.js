// simple module to install global error listener
export function installErrorHandler() {
  window.addEventListener('error', function(e) {
    if (e.message && e.message.includes('WebSocket') && e.message.includes('localhost')) {
      return;
    }
    console.error('Global error:', e.error, e.filename, e.lineno);
  });
}
