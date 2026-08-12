import * as derivations from '../derivations';
import * as core from '../index';
import * as formatQueryModule from '../utils/formatQuery';
import * as queryManagerModule from '../utils/QueryManager';

/**
 * Locks the `@react-querybuilder/core/derivations` subpath.
 *
 * The subpath is the pure, framework-agnostic subset of the root surface: everything except
 * `QueryManager` and the query formatter (the parsers already have subpaths of their own and are
 * not exported from the root). Framework adapters that own their own state import from here, so
 * the boundary is a semver-covered promise, not an implementation detail.
 *
 * The expected set is derived rather than hand-listed, which makes this a two-way gate: a new pure
 * export added to the root fails here until it is added to `derivations.ts`, and a new export that
 * belongs to `QueryManager` or `formatQuery` fails if it leaks in.
 *
 * `bun check-derivations-purity` gates the same boundary in the built output, where it can also
 * catch a module that is imported but not re-exported.
 */
const excluded = new Set([...Object.keys(formatQueryModule), ...Object.keys(queryManagerModule)]);

describe('derivations subpath', () => {
  it('exports the root surface minus QueryManager and formatQuery', () => {
    const expected = Object.keys(core)
      .filter(name => !excluded.has(name))
      .toSorted();

    expect(Object.keys(derivations).toSorted()).toEqual(expected);
  });

  it('exports the same bindings as the root entry point', () => {
    for (const name of Object.keys(derivations)) {
      expect(derivations[name as keyof typeof derivations]).toBe(core[name as keyof typeof core]);
    }
  });

  it('excludes QueryManager and formatQuery', () => {
    expect(derivations).not.toHaveProperty('QueryManager');
    expect(derivations).not.toHaveProperty('QueryManagerError');
    expect(derivations).not.toHaveProperty('formatQuery');
  });

  it('includes the pieces the framework ports depend on', () => {
    // Sanity check on the derived list above: these are the specific symbols the Solid, Svelte,
    // and Vue ports import directly. A `derivations.ts` that dropped a module would still satisfy
    // the two-way gate if the same module were dropped from the root.
    for (const name of [
      'add',
      'addInPlace',
      'createQueryActions',
      'createRule',
      'createRuleGroup',
      'derivePathInfo',
      'deriveRuleContext',
      'deriveRuleGroupContext',
      'getFieldData',
      'group',
      'groupInPlace',
      'insert',
      'insertInPlace',
      'move',
      'moveInPlace',
      'optionsEqual',
      'remove',
      'removeInPlace',
      'setAutoFreeze',
      'shouldCoalesce',
      'signatureOf',
      'strictAbortReasons',
      'update',
      'updateInPlace',
    ]) {
      expect(derivations).toHaveProperty(name);
    }
  });
});
