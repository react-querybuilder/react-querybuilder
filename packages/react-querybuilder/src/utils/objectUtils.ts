// All code in this file is adapted from:
// npm: https://www.npmjs.com/package/ts-extras
// src: https://github.com/sindresorhus/ts-extras

/**
 * Original looked like this (not sure why template string is used):
 * ```
 * type ObjectKeys<T extends object> = `${Exclude<keyof T, symbol>}`;
 * ```
 */
type ObjectKeys<T extends object> = Exclude<keyof T, symbol>;

/**
 * A strongly-typed version of `Object.keys()`.
 *
 * [Original source](https://github.com/sindresorhus/ts-extras/blob/44f57392c5f027268330771996c4fdf9260b22d6/source/object-keys.ts)
 */
export const objectKeys = Object.keys as <Type extends object>(
  value: Type
) => Array<ObjectKeys<Type>>;

/**
 * A strongly-typed version of `Object.entries()`.
 *
 * [Original source](https://github.com/sindresorhus/ts-extras/blob/44f57392c5f027268330771996c4fdf9260b22d6/source/object-entries.ts)
 */
export const objectEntries = Object.entries as <Type extends Record<PropertyKey, unknown>>(
  value: Type
) => Array<[ObjectKeys<Type>, Type[ObjectKeys<Type>]]>;
