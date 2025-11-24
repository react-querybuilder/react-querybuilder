// import type { UUID } from 'node:crypto';
type UUID = `${string}-${string}-${string}-${string}-${string}`;

const cryptoModule = globalThis.crypto;

/**
 * Default `id` generator. Generates a valid v4 UUID. Uses `crypto.randomUUID()`
 * when available, otherwise uses an alternate method based on `getRandomValues`.
 * The returned string is guaranteed to match this regex:
 * ```
 * /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
 * ```
 * @returns Valid v4 UUID
 */
// Default implementation adapted from https://stackoverflow.com/a/68141099/217579
// istanbul ignore next -- @preserve
export let generateID = (): UUID =>
  '00-0-4-2-000'.replaceAll(/[^-]/g, s =>
    (((Math.random() + Math.trunc(s as unknown as number)) * 0x1_00_00) >> Number.parseInt(s))
      .toString(16)
      .padStart(4, '0')
  ) as UUID;

// Improve on the default implementation by using the crypto package if it's available
// istanbul ignore else -- @preserve
if (cryptoModule) {
  // istanbul ignore else -- @preserve
  if (typeof cryptoModule.randomUUID === 'function') {
    generateID = () => cryptoModule.randomUUID();
  } else if (typeof cryptoModule.getRandomValues === 'function') {
    // `randomUUID` is much simpler and faster, but it's only guaranteed to be
    // available in secure contexts (server-side, https, etc.). `generateID`
    // doesn't really need to be cryptographically secure, it only needs a
    // fairly low chance of collisions. We fall back to the always-available
    // `getRandomValues` here (while still generating a valid v4 UUID) when
    // `randomUUID` is not available.
    const position19vals = '89ab';
    const container = new Uint32Array(32);

    generateID = () => {
      cryptoModule.getRandomValues(container);
      let id = (container[0] % 16).toString(16);
      for (let i = 1; i < 32; i++) {
        if (i === 12) {
          id = `${id}${'4'}`;
        } else if (i === 16) {
          id = `${id}${position19vals[container[17] % 4]}`;
        } else {
          id = `${id}${(container[i] % 16).toString(16)}`;
        }

        if (i === 7 || i === 11 || i === 15 || i === 19) {
          id = `${id}${'-'}`;
        }
      }
      return id as UUID;
    };
  }
}
