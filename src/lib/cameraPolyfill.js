'use client';

// Polyfill for older browsers that don't support navigator.mediaDevices
export function setupCameraPolyfill() {
  if (typeof window !== 'undefined') {
    // Older browsers might not have mediaDevices at all
    if (navigator.mediaDevices === undefined) {
      navigator.mediaDevices = {};
    }

    // Some browsers partially implement mediaDevices
    if (navigator.mediaDevices.getUserMedia === undefined) {
      // Older versions of Chrome, Firefox, and Safari
      navigator.mediaDevices.getUserMedia = function(constraints) {
        // First get ahold of the legacy getUserMedia, if present
        const getUserMedia = 
          navigator.webkitGetUserMedia || 
          navigator.mozGetUserMedia ||
          navigator.msGetUserMedia;

        // Some browsers just don't implement it - return a rejected promise with an error
        if (!getUserMedia) {
          return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }

        // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
        return new Promise(function(resolve, reject) {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      };
    }
  }
}
