const cryptoModule = globalThis.crypto;

/**
 * Default `id` generator. Generates a valid v4 UUID using `crypto.randomUUID()`
 * when available. Result guaranteed to match this regex:
 * ```
 * /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
 * ```
 * @returns Valid v4 UUID.
 */
// Default implementation adapted from https://stackoverflow.com/a/68141099/217579
// istanbul ignore next
export let generateID = () =>
  '00-0-4-2-000'.replace(/[^-]/g, (s: string) =>
    (((Math.random() + ~~s) * 0x10000) >> parseInt(s)).toString(16).padStart(4, '0')
  );

// Improve on the default implementation by using the crypto package if it's available
// istanbul ignore else
if (cryptoModule) {
  // istanbul ignore else
  if (typeof cryptoModule.randomUUID === 'function') {
    generateID = () => cryptoModule.randomUUID();
  } else if (typeof cryptoModule.getRandomValues === 'function') {
    // `randomUUID` is much simpler and [faster](https://jsbench.me/krlcjfxscp/1),
    // but it's only guaranteed to be available in secure contexts (https, etc.).
    // `generateID` doesn't need to be cryptographically secure, it only needs a
    // very low chance of collisions. We can fall back to the always-available
    // `getRandomValues` to build a v4 UUID when `randomUUID` is not available.
    /** `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx` */
    const template = [
      ''.padEnd(8, 'x'),
      ''.padEnd(4, 'x'),
      // third section starts with the UUID version
      '4'.padEnd(4, 'x'),
      // First character of fourth section is limited to four specific characters
      'y'.padEnd(4, 'x'),
      ''.padEnd(12, 'x'),
    ].join('-');
    const position19vals = ['8', '9', 'a', 'b'];
    const re = /[xy]/g;
    const container = new Uint32Array(32);

    generateID = () => {
      cryptoModule.getRandomValues(container);
      let i = -1;
      return template.replaceAll(re, char => {
        i++;
        return char === 'y' ? position19vals[container[i] % 4] : (container[i] % 16).toString(16);
      });
    };
  }
}
