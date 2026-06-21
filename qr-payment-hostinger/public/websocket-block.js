/**
 * WebSocket Block Script
 * Prevents WebSocket connections to localhost for security
 * Must be loaded first before any other scripts
 */

(function() {
    'use strict';
    
    // Block WebSocket connections to localhost
    const originalWebSocket = window.WebSocket;
    
    window.WebSocket = function(url, protocols) {
        // Check if URL contains localhost or 127.0.0.1
        if (url && (url.includes('localhost') || url.includes('127.0.0.1') || url.includes('0.0.0.0'))) {
            console.warn('WebSocket connection to localhost blocked:', url);
            throw new Error('WebSocket connections to localhost are not allowed for security reasons.');
        }
        
        // Allow other WebSocket connections
        if (protocols) {
            return new originalWebSocket(url, protocols);
        } else {
            return new originalWebSocket(url);
        }
    };
    
    // Preserve WebSocket prototype
    window.WebSocket.prototype = originalWebSocket.prototype;
    window.WebSocket.CONNECTING = originalWebSocket.CONNECTING;
    window.WebSocket.OPEN = originalWebSocket.OPEN;
    window.WebSocket.CLOSING = originalWebSocket.CLOSING;
    window.WebSocket.CLOSED = originalWebSocket.CLOSED;
    
    console.log('WebSocket block initialized - localhost connections blocked');
})();
