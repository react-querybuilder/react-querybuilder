let cryptoModule = globalThis.crypto;

// istanbul ignore next
if (!cryptoModule && typeof require === 'function') {
  cryptoModule = require('node:crypto');
}

export const generateID = () => cryptoModule.randomUUID();
