import { Database } from 'bun:sqlite';
import { BasicFuncs, CoreConfig, Utils } from '@react-awesome-query-builder/core';
import type { Field, RuleGroupType } from '../../../types';
import { formatRAQBFields } from '../../parseRAQB/formatRAQBFields';
import { parseRAQB } from '../../parseRAQB/parseRAQB';
import type { RAQBJsonTree } from '../../parseRAQB/types';
import type { TestSQLParams } from '../dbqueryTestUtils';
import { dbSetup, dbTests, fields, getSqlOrderBy, sqlBase, superUsers } from '../dbqueryTestUtils';
import { formatQuery } from '../formatQuery';

const db = new Database();

const superUsersRAQB = superUsers('raqb');

// RQB infers nothing about `enhanced` from the shared `fields` array, so RAQB would type it as
// `text` and reject boolean values. Everything else maps cleanly.
const raqbFields: Field[] = fields.map(f =>
  f.name === 'enhanced' ? Object.assign({}, f, { valueEditorType: 'checkbox' as const }) : f
);

// oxlint-disable-next-line typescript/no-explicit-any
type RAQBConfig = any;

const config: RAQBConfig = {
  ...CoreConfig,
  funcs: BasicFuncs,
  fields: formatRAQBFields(raqbFields),
};

/** RAQB assigns ids to every node it loads; they are irrelevant to round-trip fidelity. */
const stripIDs = <T>(value: T): T =>
  JSON.parse(JSON.stringify(value, (key, v) => (key === 'id' ? undefined : v)));

const load = (json: RAQBJsonTree, cfg: RAQBConfig = config) =>
  Utils.checkTree(Utils.loadTree(json as RAQBConfig), cfg);

const raqbErrors = (json: RAQBJsonTree, cfg: RAQBConfig = config): string[] =>
  Utils.validateTree(load(json, cfg), cfg).flatMap((e: RAQBConfig) =>
    (e.errors as RAQBConfig[]).map(err => err.str as string)
  );

/**
 * Constructs the RAQB tree that would result from a query, mirroring real usage:
 * `formatQuery` -> `loadTree` -> `checkTree`.
 */
const toRAQB = ({ query, fqOptions }: Pick<TestSQLParams, 'query' | 'fqOptions'>): RAQBJsonTree =>
  formatQuery(query, { ...fqOptions, fields: raqbFields, format: 'raqb' });

/**
 * Queries RQB has no faithful RAQB representation for. Each entry documents *why*; if RAQB ever
 * gains support, these tests fail loudly instead of silently drifting.
 */
const unsupported = {
  // No `not_starts_with`/`not_ends_with` operators exist in RAQB, so the rules are dropped.
  doesNotBeginWith: 'dropped',
  doesNotEndWith: 'dropped',
  // RAQB models `in` only for select/multiselect fields (`select_any_in`), not free text.
  'in/notIn': 'invalid',
  // RAQB's `text` type has no `less` operator.
  'f2f <': 'invalid',
  // RAQB's `field` widget for `text` supports only equal/not_equal/proximity.
  'f2f contains': 'invalid',
  'f2f beginsWith': 'invalid',
} as const;

describe('RAQB', () => {
  // `checkTree` warns for every tree it sanitizes, which the "unsupported" cases do deliberately.
  const consoleWarn = console.warn;

  beforeAll(() => {
    db.run(dbSetup('raqb'));
    console.warn = () => {};
  });

  afterAll(() => {
    db.close();
    console.warn = consoleWarn;
  });

  describe('common tests', () => {
    for (const [name, t] of Object.entries(dbTests(superUsersRAQB))) {
      const known = unsupported[name as keyof typeof unsupported];

      if (known === 'dropped') {
        test(`${name} (unsupported: rules dropped)`, () => {
          expect(toRAQB(t).children1).toEqual([]);
        });
        continue;
      }

      if (known === 'invalid') {
        test(`${name} (unsupported: RAQB reports errors)`, () => {
          expect(raqbErrors(toRAQB(t)).length).toBeGreaterThan(0);
        });
        continue;
      }

      describe(name, () => {
        test('validates', () => {
          expect(raqbErrors(toRAQB(t))).toEqual([]);
        });

        test('sql', () => {
          const sql = Utils.sqlFormat(load(toRAQB(t)), config);
          expect(sql).toBeDefined();
          const select = db.prepare(`${sqlBase()} ${sql} ${getSqlOrderBy()}`);
          expect(select.all()).toEqual(t.expectedResult);
        });
      });
    }
  });

  describe('unsupported value sources', () => {
    // RAQB has no equivalent of RQB's "parameter" value source, so the rule is dropped.
    test('parameter', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [{ field: 'firstName', operator: '=', value: 'p0', valueSource: 'parameter' }],
      };
      expect(formatQuery(query, { format: 'raqb', fields: raqbFields }).children1).toEqual([]);
    });
  });

  describe('match modes', () => {
    // Match modes require a RAQB `!group` field, which the flat `superusers` table cannot model,
    // so these are validated structurally. This guards the `mode: "array"` requirement that RAQB
    // enforces for threshold/count operators.
    const matchFields: Field[] = [
      {
        name: 'nicknames',
        label: 'Nicknames',
        matchModes: true,
        subproperties: [{ name: 'name', label: 'Name' }],
      },
    ];
    const matchConfig: RAQBConfig = {
      ...CoreConfig,
      funcs: BasicFuncs,
      fields: formatRAQBFields(matchFields),
    };

    for (const [label, match] of [
      ['all', { mode: 'all' }],
      ['some', { mode: 'some' }],
      ['none', { mode: 'none' }],
      ['atLeast', { mode: 'atLeast', threshold: 2 }],
      ['atMost', { mode: 'atMost', threshold: 2 }],
      ['exactly', { mode: 'exactly', threshold: 2 }],
    ] as const) {
      test(label, () => {
        const query: RuleGroupType = {
          combinator: 'and',
          rules: [
            {
              field: 'nicknames',
              operator: '=',
              match,
              value: {
                combinator: 'and',
                rules: [{ field: 'name', operator: 'beginsWith', value: 'S' }],
              },
            } as RuleGroupType['rules'][number],
          ],
        };
        const json = formatQuery(query, { format: 'raqb', fields: matchFields });
        // Guards against silently regressing to a dropped rule, which would make this vacuous.
        expect(json.children1).toMatchObject([
          { type: 'rule_group', properties: { mode: 'array' } },
        ]);
        expect(raqbErrors(json, matchConfig)).toEqual([]);
      });
    }
  });

  describe('round trip', () => {
    // `parseRAQB` normalizes list/range values to comma-delimited strings, so compare against a
    // query that has already been through that normalization rather than the original.
    for (const [name, t] of Object.entries(dbTests(superUsersRAQB))) {
      if (unsupported[name as keyof typeof unsupported]) continue;

      // RAQB's `checkTree` clamps inverted ranges, rewriting `[100, 0]` to `[100, 100]`, so this
      // query cannot survive a round trip through RAQB unchanged.
      if (name === 'preserveValueOrder') {
        test(`${name} (RAQB clamps the inverted range)`, () => {
          const viaRAQB = parseRAQB(Utils.getTree(load(toRAQB(t))));
          expect(stripIDs(viaRAQB).rules[0]).toMatchObject({ value: '100,100' });
        });
        continue;
      }

      test(name, () => {
        const direct = parseRAQB(toRAQB(t));
        // Surviving RAQB's own `checkTree`/`getTree` normalization is the real assertion here.
        // RAQB generates ids for every node, so strip them before comparing.
        const viaRAQB = parseRAQB(Utils.getTree(load(toRAQB(t))));
        expect(stripIDs(viaRAQB)).toEqual(stripIDs(direct));
      });
    }
  });
});
