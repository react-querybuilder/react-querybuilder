let cryptoModule = globalThis.crypto;

// istanbul ignore next
if (!cryptoModule && typeof require === 'function') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  cryptoModule = require('crypto').webcrypto;
}

/**
 * Using `randomUUID` would be much simpler, but it's only guaranteed to be
 * available in secure contexts (https, etc.). We don't need `generateID` to
 * be cryptographically secure, it only needs a very low chance of collisions,
 * so we use the always-available `getRandomValues` to build a v4 UUID.
 */
// export const old_generateID = () => cryptoModule.randomUUID();

// xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
const template = [
  `${''.padEnd(8, 'x')}`,
  `${''.padEnd(4, 'x')}`,
  // third section starts with the UUID version
  `${'4'.padEnd(4, 'x')}`,
  // First character of fourth section is limited to four specific characters
  `${'y'.padEnd(4, 'x')}`,
  `${''.padEnd(12, 'x')}`,
].join('-');
const position19vals = ['8', '9', 'a', 'b'];
const re = /[xy]/g;
const container = new Uint32Array(32);

/**
 * Generates a valid v4 UUID, i.e. matching this regex:
 *
 *     /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
 *
 * @returns Valid v4 UUID
 */
export const generateID = () => {
  cryptoModule.getRandomValues(container);
  let i = -1;
  return template.replaceAll(re, char => {
    i++;
    return char === 'y' ? position19vals[container[i] % 4] : (container[i] % 16).toString(16);
  });
};
