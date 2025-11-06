import type { Equal, Expect, ExpectExtends } from '@rqb-testing';
import { defaultCombinators } from '../defaults';
import type {
  DefaultRuleGroupType,
  DefaultRuleGroupTypeAny,
  DefaultRuleGroupTypeIC,
  DefaultRuleType,
  Path,
  RuleGroupType,
  ValueSources,
} from '../types';
import { formatQuery } from './formatQuery';
import { getValueSourcesUtil } from './getValueSourcesUtil';
import { numericRegex } from './misc';
import { add, group, insert, move, remove, update } from './queryTools';
import { transformQuery } from './transformQuery';

const [and, or] = defaultCombinators.map(c => c.name);
const [value, field] = ['value', 'field'] as ValueSources;

const stripIDs = (query: DefaultRuleGroupTypeAny) =>
  JSON.parse(formatQuery(query, 'json_without_ids'));

const id = <T extends object>(x: T, id: string): T => ({ id, ...x });

const idGenerator = () => `${Math.random()}`;

const pathsAsIDs = (rg: DefaultRuleGroupTypeAny) =>
  transformQuery(rg as DefaultRuleGroupType, {
    ruleProcessor: r => ({ ...r, id: JSON.stringify(r.path) }),
    ruleGroupProcessor: r => ({ ...r, id: JSON.stringify(r.path) }),
  });

const badPath: Path = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

const [r1, r2, r3, r4, r5] = (['=', '<', '>', '<=', '>='] as const).map<DefaultRuleType>(
  (operator, i) => ({
    field: `f${i + 1}`,
    operator,
    value: `v${i + 1}`,
  })
);
const [rg1, rg2] = [and, or].map<DefaultRuleGroupType>(combinator => ({ combinator, rules: [] }));
const rg3: DefaultRuleGroupType = { combinator: and, rules: [r1, r2, r3] };
const rgic1: DefaultRuleGroupTypeIC = { rules: [] };
const rgic2: DefaultRuleGroupTypeIC = { rules: [r1, and, r2] };
const rgvsu: DefaultRuleGroupType = { combinator: 'and', rules: [r1] };
const rgvsv: DefaultRuleGroupType = {
  combinator: 'and',
  rules: [{ ...r1, valueSource: 'value' }],
};
const rgvsf: DefaultRuleGroupType = {
  combinator: 'and',
  rules: [{ ...r1, valueSource: 'field' }],
};
const rg1wID: DefaultRuleGroupType = { id: '[]', ...rg1 };
const rgic1wID: DefaultRuleGroupTypeIC = { id: '[]', ...rgic1 };
const rg3wIDs = pathsAsIDs(rg3);

const testQT = (
  title: string,
  ruleGroup: DefaultRuleGroupTypeAny,
  expectation: DefaultRuleGroupTypeAny,
  exact?: boolean,
  only?: boolean
) => {
  (only ? it.only : it)(title, () => {
    if (exact) {
      expect(ruleGroup).toBe(expectation);
    } else {
      expect(stripIDs(ruleGroup)).toEqual(expectation);
    }
  });
};

const testLoop = [
  ['path', (x: Path) => x],
  ['id', (x: Path) => JSON.stringify(x)],
] as const;

describe('add', () => {
  describe.each(testLoop)('standard rule groups by %s', (_, p) => {
    testQT('adds a rule', add(rg1wID, r1, p([])), { combinator: and, rules: [r1] });
    testQT('adds another rule', add({ id: '[]', combinator: and, rules: [r1] }, r2, p([])), {
      combinator: and,
      rules: [r1, r2],
    });
    testQT('adds a group', add(rg1wID, rg2, p([])), {
      combinator: and,
      rules: [rg2],
    });
    it('adds a rule with custom idGenerator', () => {
      expect(add(rg1wID, r1, p([]), { idGenerator }).rules[0].id).toMatch(numericRegex);
    });
  });

  describe.each(testLoop)('independent combinators by %s', (_, p) => {
    testQT('adds a rule', add(rgic1wID, r1, p([])), { rules: [r1] });
    testQT('adds a rule and the default combinator', add({ id: '[]', rules: [r1] }, r2, p([])), {
      rules: [r1, and, r2],
    });
    testQT(
      'adds a rule and a custom combinator',
      add({ id: '[]', rules: [r1] }, r2, p([]), {
        combinators: defaultCombinators.map(c => ({
          ...c,
          name: `custom-${c.name}`,
          value: `custom-${c.name}`,
        })),
      }),
      {
        // @ts-expect-error custom combinator
        rules: [r1, `custom-${and}`, r2],
      }
    );
    testQT(
      'adds a rule and copies existing combinator',
      add({ id: '[]', rules: [r1, or, r2] }, r3, p([])),
      { rules: [r1, or, r2, or, r3] }
    );
    testQT(
      'adds a rule with specified combinator, ignoring defaults',
      add({ id: '[]', rules: [r1, and, r2] }, r3, p([]), {
        combinators: defaultCombinators.map(c => ({ ...c, name: `custom-${c.name}` })),
        combinatorPreceding: or,
      }),
      { rules: [r1, and, r2, or, r3] }
    );
    testQT('adds a group', add(rgic1wID, rgic2, p([])), { rules: [rgic2] });
  });

  describe.each(testLoop)('on bad %s', (_, p) => {
    testQT('bails out', add(rg1, rg2, p(badPath)), rg1, true);
  });

  // oxlint-disable-next-line expect-expect
  it('should have the right types', () => {
    const _newQuery = add({ ...rg1 }, { ...rg2 }, []);
    const _newDefaultQuery = add(rg1, rg2, []);
    const _newICQuery = add({ ...rgic1 }, { ...rgic2 }, []);
    const _newDefaultICQuery = add(rgic1, rgic2, []);

    const _assertion1: ExpectExtends<DefaultRuleGroupTypeIC, typeof _newQuery> = false;
    const _assertion2: ExpectExtends<DefaultRuleGroupType, typeof _newQuery> = true;
    const _assertion3: ExpectExtends<DefaultRuleGroupType, typeof _newICQuery> = false;
    const _assertion4: ExpectExtends<DefaultRuleGroupTypeIC, typeof _newICQuery> = true;
    const _assertion5: Expect<Equal<DefaultRuleGroupType, typeof _newDefaultQuery>> = true;
    const _assertion6: ExpectExtends<DefaultRuleGroupTypeIC, typeof _newICQuery> = true;
    const _assertion7: Expect<Equal<DefaultRuleGroupTypeIC, typeof _newDefaultICQuery>> = true;
  });
});

describe('remove', () => {
  describe.each(testLoop)('standard rule groups by %s', (_, p) => {
    testQT(
      'removes the first of two rules',
      remove({ combinator: and, rules: [id(r1, '[0]'), r2] }, p([0])),
      { combinator: and, rules: [r2] }
    );
    testQT(
      'removes the second of three rules',
      remove({ combinator: and, rules: [r1, id(r2, '[1]'), r3] }, p([1])),
      { combinator: and, rules: [r1, r3] }
    );
    testQT('removes a group', remove({ combinator: and, rules: [r1, id(rg1, '[1]')] }, p([1])), {
      combinator: and,
      rules: [r1],
    });
    testQT('does not remove the root group', remove(rg1wID, p([])), rg1wID, true);
  });

  describe.each(testLoop)('independent combinators by %s', (_, p) => {
    testQT('removes a lonely rule', remove({ rules: [id(r1, '[0]')] }, p([0])), rgic1);
    const tempRGIC: DefaultRuleGroupTypeIC = { rules: [r1, and, id(r2, '[2]')] };
    testQT('removes the second of two rules', remove(tempRGIC, p([2])), { rules: [r1] });
    testQT(
      'removes the first of three rules',
      remove({ rules: [id(r1, '[0]'), and, r2, or, r3] }, p([0])),
      { rules: [r2, or, r3] }
    );
    testQT(
      'removes the second of three rules',
      remove({ rules: [r1, and, id(r2, '[2]'), or, r3] }, p([2])),
      { rules: [r1, or, r3] }
    );
    testQT(
      'removes the third of three rules',
      remove({ rules: [r1, and, r2, or, id(r3, '[4]')] }, p([4])),
      { rules: [r1, and, r2] }
    );
    testQT('removes a group', remove({ rules: [id(rgic1, '[0]'), and, rgic2] }, p([0])), {
      rules: [rgic2],
    });
    testQT('does not remove the root group', remove(rgic1wID, p([])), rgic1wID, true);
    testQT('does not remove independent combinators', remove(rgic2, [1]), rgic2, true);
  });

  describe.each(testLoop)('on bad %s', (_, p) => {
    testQT('bails out', remove(rg1, p(badPath)), rg1, true);
  });

  // oxlint-disable-next-line expect-expect
  it('should have the right types', () => {
    const _newQuery = remove({ ...rg1 }, [0]);
    const _newDefaultQuery = remove(rg1, [0]);
    const _newICQuery = remove({ ...rgic1 }, [0]);
    const _newDefaultICQuery = remove(rgic1, [0]);

    const _assertion1: ExpectExtends<DefaultRuleGroupTypeIC, typeof _newQuery> = false;
    const _assertion2: ExpectExtends<DefaultRuleGroupType, typeof _newQuery> = true;
    const _assertion3: ExpectExtends<DefaultRuleGroupType, typeof _newICQuery> = false;
    const _assertion4: ExpectExtends<DefaultRuleGroupTypeIC, typeof _newICQuery> = true;
    const _assertion5: Expect<Equal<DefaultRuleGroupType, typeof _newDefaultQuery>> = true;
    const _assertion6: ExpectExtends<DefaultRuleGroupTypeIC, typeof _newICQuery> = true;
    const _assertion7: Expect<Equal<DefaultRuleGroupTypeIC, typeof _newDefaultICQuery>> = true;
  });
});

describe('update', () => {
  describe.each(testLoop)('standard rule groups by %s', (_, p) => {
    testQT('updates a rule', update(rg3wIDs, 'field', 'fu', p([0])), {
      combinator: and,
      rules: [{ ...r1, field: 'fu', value: '' }, r2, r3],
    });
    testQT(
      'updates a rule and resets the value by default',
      update(
        { combinator: and, rules: [{ id: '[0]', field: 'f1', operator: '<', value: 'v1' }] },
        'field',
        'fu',
        p([0])
      ),
      { combinator: and, rules: [{ ...r1, field: 'fu', value: '' }] }
    );
    testQT(
      'updates a rule and does not reset the value',
      update(rg3wIDs, 'field', 'fu', p([0]), { resetOnFieldChange: false }),
      { combinator: and, rules: [{ ...r1, field: 'fu' }, r2, r3] }
    );
    testQT(
      'updates a rule operator and does not reset the value',
      update(rg3wIDs, 'operator', 'between', p([1])),
      { combinator: and, rules: [r1, { ...r2, operator: 'between' }, r3] }
    );
    testQT(
      'updates a rule operator and resets the value',
      update(rg3wIDs, 'operator', 'between', p([1]), { resetOnOperatorChange: true }),
      {
        combinator: and,
        rules: [r1, { ...r2, operator: 'between', value: '' }, r3],
      }
    );
    testQT('updates a rule value', update(rg3wIDs, 'value', 'vu', p([2])), {
      combinator: and,
      rules: [r1, r2, { ...r3, value: 'vu' }],
    });
    testQT('updates a group combinator', update(rg1wID, 'combinator', or, p([])), rg2);
    testQT('updates a group "not" value', update(rg1wID, 'not', true, p([])), {
      ...rg1,
      not: true,
    });
    testQT(
      'updates a child group combinator',
      update(pathsAsIDs({ combinator: and, rules: [rg1] }), 'combinator', or, p([0])),
      { combinator: and, rules: [rg2] }
    );
    testQT(
      'updates a child group "not" value',
      update(pathsAsIDs({ combinator: and, rules: [rg1] }), 'not', true, p([0])),
      { combinator: and, rules: [{ ...rg1, not: true }] }
    );
    testQT(
      'does not reset operator or value when the field is the same',
      update(rg3wIDs, 'field', 'f1', p([0]), { resetOnFieldChange: true }),
      rg3wIDs,
      true
    );
    testQT(
      'does not reset value when the operator is the same',
      update(rg3wIDs, 'operator', '=', p([0]), { resetOnOperatorChange: true }),
      rg3wIDs,
      true
    );
    testQT('updates a rule match', update(rg3wIDs, 'match', { mode: 'all' }, p([0])), {
      combinator: and,
      rules: [{ ...r1, match: { mode: 'all' } }, r2, r3],
    });
    testQT(
      'updates a rule match when field has match modes',
      update(rg3wIDs, 'field', 'fmm', p([0]), {
        getMatchModes: () => [{ name: 'some', value: 'some', label: 'some' }],
        getRuleDefaultValue: () => ({ combinator: and, rules: [] }),
      }),
      {
        combinator: and,
        rules: [
          {
            ...r1,
            field: 'fmm',
            value: { combinator: and, rules: [] },
            match: { mode: 'some', threshold: 1 },
          },
          r2,
          r3,
        ],
      }
    );
    testQT(
      'does not update a match mode when it is valid for new field',
      update(
        pathsAsIDs({
          combinator: and,
          rules: [{ field: 'fmm1', operator: '=', value: '', match: { mode: 'none' } }],
        }),
        'field',
        'fmm2',
        p([0]),
        {
          getMatchModes: f =>
            f === 'fmm2'
              ? [
                  { name: 'some', value: 'some', label: 'some' },
                  { name: 'none', value: 'none', label: 'none' },
                ]
              : [],
          getRuleDefaultValue: () => ({ combinator: and, rules: [] }),
        }
      ),
      {
        combinator: and,
        rules: [
          {
            field: 'fmm2',
            operator: '=',
            value: { combinator: and, rules: [] },
            match: { mode: 'none' },
          },
        ],
      }
    );
  });

  describe('independent combinators', () => {
    testQT('updates a combinator', update(rgic2, 'combinator', or, [1]), {
      rules: [r1, or, r2],
    });
    testQT(
      'does not alter the query if the path ends in an even number',
      update(rgic2, 'combinator', or, [2]),
      rgic2,
      true
    );
  });

  describe.each(testLoop)('value sources by %s', (_, p) => {
    testQT(
      'updates value source from undefined to field',
      update(pathsAsIDs(rgvsu), 'valueSource', field, p([0])),
      { combinator: 'and', rules: [{ ...r1, value: '', valueSource: 'field' }] }
    );
    testQT(
      'updates value source from field to value',
      update(pathsAsIDs(rgvsf), 'valueSource', value, p([0])),
      { combinator: 'and', rules: [{ ...r1, value: '', valueSource: 'value' }] }
    );
    testQT(
      'resets value source to default on field change',
      update(pathsAsIDs(rgvsf), 'field', 'fu', p([0])),
      { combinator: 'and', rules: [{ ...r1, field: 'fu', value: '', valueSource: 'value' }] }
    );
    testQT(
      'resets value source to default of "field" on field change',
      update(pathsAsIDs(rgvsv), 'field', 'fu', p([0]), {
        getValueSources: () => ['field', 'value'],
      }),
      { combinator: 'and', rules: [{ ...r1, field: 'fu', value: '', valueSource: 'field' }] }
    );
    testQT(
      'resets value source to default of "field" on field change when Field specifies value sources',
      update(pathsAsIDs(rgvsv), 'field', 'fu', p([0]), {
        getValueSources: (fld, op) =>
          getValueSourcesUtil(
            { name: fld, value: fld, label: 'Fld', valueSources: ['field', 'value'] },
            op
          ),
      }),
      { combinator: 'and', rules: [{ ...r1, field: 'fu', value: '', valueSource: 'field' }] }
    );
    testQT(
      'resets value source to default on operator change',
      update(pathsAsIDs(rgvsf), 'operator', 'between', p([0]), { resetOnOperatorChange: true }),
      {
        combinator: 'and',
        rules: [{ ...r1, operator: 'between', value: '', valueSource: 'value' }],
      }
    );
    testQT(
      'updates undefined value source to default when set explicitly',
      update(pathsAsIDs(rgvsu), 'valueSource', value, p([0])),
      rgvsv
    );
  });

  describe('mutes with IC', () => {
    it('mutes IC group with string combinators', () => {
      const icQuery: DefaultRuleGroupTypeIC = {
        rules: [
          { field: 'f1', operator: '=', value: 'v1' },
          'and',
          { field: 'f2', operator: '=', value: 'v2' },
        ],
      };
      const mutedQuery = update(icQuery, 'muted', true, []);
      expect(mutedQuery.muted).toBe(true);
      // Children should not be affected
      expect(mutedQuery.rules[0]).not.toHaveProperty('muted');
      expect(mutedQuery.rules[1]).toBe('and');
      expect(mutedQuery.rules[2]).not.toHaveProperty('muted');
    });

    it('unmutes IC group', () => {
      const icQuery: DefaultRuleGroupTypeIC = {
        muted: true,
        rules: [
          { field: 'f1', operator: '=', value: 'v1' },
          'and',
          { field: 'f2', operator: '=', value: 'v2' },
        ],
      };
      const unmutedQuery = update(icQuery, 'muted', false, []);
      expect(unmutedQuery.muted).toBe(false);
      // Children should not be affected
      expect(unmutedQuery.rules[0]).not.toHaveProperty('muted');
      expect(unmutedQuery.rules[1]).toBe('and');
      expect(unmutedQuery.rules[2]).not.toHaveProperty('muted');
    });
  });

  describe('mutes', () => {
    it('handles unmuting with broken parent path', () => {
      // Tests the scenario where parent path traversal encounters an invalid path
      // Mock a scenario where the parent lookup might fail
      // by using a deeply nested structure where we unmute at a depth
      // that could have missing parents
      const deepQuery = {
        combinator: 'and',
        rules: [
          {
            combinator: 'or',
            rules: [
              {
                combinator: 'and',
                rules: [{ field: 'f1', operator: '=', value: 'v1', muted: true }],
              },
            ],
          },
        ],
      };

      // Unmute with a path that will cause parent traversal
      const result = update(deepQuery, 'muted', false, [0, 0, 0]);
      expect(result.rules[0].rules[0].rules[0].muted).toBe(false);
    });

    it('mutes only the specified group', () => {
      // Tests that muting a parent group doesn't recursively set muted on children
      const deepQuery: DefaultRuleGroupType = {
        combinator: 'and',
        rules: [
          {
            combinator: 'or',
            rules: [
              {
                combinator: 'and',
                rules: [
                  { field: 'f1', operator: '=', value: 'v1' },
                  { combinator: 'or', rules: [{ field: 'f2', operator: '=', value: 'v2' }] },
                ],
              },
            ],
          },
        ],
      };

      const result = update(deepQuery, 'muted', true, []);
      expect(result.muted).toBe(true);
      // Children should not have muted property set
      expect(result.rules[0]).not.toHaveProperty('muted');
      expect((result.rules[0] as DefaultRuleGroupType).rules[0]).not.toHaveProperty('muted');
      expect((result.rules[0] as DefaultRuleGroupType).rules[0]).not.toHaveProperty('muted');
      expect(
        ((result.rules[0] as DefaultRuleGroupType).rules[0] as DefaultRuleGroupType).rules[0]
      ).not.toHaveProperty('muted');
      expect(
        ((result.rules[0] as DefaultRuleGroupType).rules[0] as DefaultRuleGroupType).rules[1]
      ).not.toHaveProperty('muted');
      expect(
        (
          ((result.rules[0] as DefaultRuleGroupType).rules[0] as DefaultRuleGroupType)
            .rules[1] as DefaultRuleGroupType
        ).rules[0]
      ).not.toHaveProperty('muted');
    });

    it('unmutes only the specified group', () => {
      // Tests that unmuting a parent group doesn't recursively unset muted on children
      const deepQuery: DefaultRuleGroupType = {
        combinator: 'and',
        muted: true,
        rules: [
          {
            combinator: 'or',
            muted: true,
            rules: [
              {
                combinator: 'and',
                muted: true,
                rules: [
                  { field: 'f1', operator: '=', value: 'v1', muted: true },
                  {
                    combinator: 'or',
                    muted: true,
                    rules: [{ field: 'f2', operator: '=', value: 'v2', muted: true }],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = update(deepQuery, 'muted', false, []);
      expect(result.muted).toBe(false);
      // Children should retain their muted state
      expect(result.rules[0]).toHaveProperty('muted', true);
      expect((result.rules[0] as DefaultRuleGroupType).rules[0]).toHaveProperty('muted', true);
      expect(
        ((result.rules[0] as DefaultRuleGroupType).rules[0] as DefaultRuleGroupType).rules[0]
      ).toHaveProperty('muted', true);
      expect(
        ((result.rules[0] as DefaultRuleGroupType).rules[0] as DefaultRuleGroupType).rules[1]
      ).toHaveProperty('muted', true);
      expect(
        (
          ((result.rules[0] as DefaultRuleGroupType).rules[0] as DefaultRuleGroupType)
            .rules[1] as DefaultRuleGroupType
        ).rules[0]
      ).toHaveProperty('muted', true);
    });

    it('unmutes only the specific nested item', () => {
      // Tests that unmuting a nested rule doesn't affect parent groups
      const deepQuery: DefaultRuleGroupType = {
        combinator: 'and',
        rules: [
          {
            combinator: 'or',
            rules: [{ field: 'f1', operator: '=', value: 'v1', muted: true }],
          },
        ],
      };

      const result = update(deepQuery, 'muted', false, [0, 0]);
      expect((result.rules[0] as DefaultRuleGroupType).rules[0].muted).toBe(false);
      // Parents should not be affected
      expect((result.rules[0] as DefaultRuleGroupType).muted).toBeUndefined();
      expect(result.muted).toBeUndefined();
    });

    it('handles unmuting a single rule', () => {
      // Tests unmuting a rule without affecting the parent group
      const query: DefaultRuleGroupType = {
        combinator: 'and',
        rules: [{ field: 'f1', operator: '=', value: 'v1', muted: true }],
      };

      const result = update(query, 'muted', false, [0]);
      expect(result.rules[0].muted).toBe(false);
      // Parent should not be affected
      expect(result.muted).toBeUndefined();
    });

    it('handles muted property with non-boolean values', () => {
      // Tests handling of non-boolean values for the muted property
      const query: DefaultRuleGroupType = {
        combinator: 'and',
        rules: [{ field: 'f1', operator: '=', value: 'v1' }],
      };

      // Try to set muted to a non-boolean value
      const result = update(query, 'muted', 'invalid' as unknown, [0]);
      // The rule gets the value as-is (typescript would prevent this in practice)
      expect(result.rules[0].muted).toBe('invalid');
    });
  });

  describe.each(testLoop)('on bad %s', (_, p) => {
    testQT('bails out', update(rg1wID, 'value', 'test', p(badPath)), rg1wID, true);
  });

  // oxlint-disable-next-line expect-expect
  it('should have the right types', () => {
    const _newQuery = update({ ...rg1 }, 'combinator', 'and', []);
    const _newDefaultQuery = update(rg1, 'combinator', 'and', []);
    const _newICQuery = update({ ...rgic1 }, 'disabled', false, []);
    const _newDefaultICQuery = update(rgic1, 'disabled', false, []);

    const _assertion1: ExpectExtends<DefaultRuleGroupTypeIC, typeof _newQuery> = false;
    const _assertion2: ExpectExtends<DefaultRuleGroupType, typeof _newQuery> = true;
    const _assertion3: ExpectExtends<DefaultRuleGroupType, typeof _newICQuery> = false;
    const _assertion4: ExpectExtends<DefaultRuleGroupTypeIC, typeof _newICQuery> = true;
    const _assertion5: Expect<Equal<DefaultRuleGroupType, typeof _newDefaultQuery>> = true;
    const _assertion6: ExpectExtends<DefaultRuleGroupTypeIC, typeof _newICQuery> = true;
    const _assertion7: Expect<Equal<DefaultRuleGroupTypeIC, typeof _newDefaultICQuery>> = true;
  });
});

describe('move', () => {
  describe.each(testLoop)('standard rule groups by %s', (_, p) => {
    testQT(
      'moves a rule down within the same group',
      move(pathsAsIDs({ combinator: and, rules: [r1, r2] }), p([0]), [2]),
      { combinator: and, rules: [r2, r1] }
    );
    testQT(
      'moves a rule to a different group with a common ancestor',
      move(pathsAsIDs({ combinator: and, rules: [r1, r2, rg1] }), p([1]), [2, 0]),
      { combinator: and, rules: [r1, { ...rg1, rules: [r2] }] }
    );
    testQT(
      'moves a rule up to its grandparent group',
      move(pathsAsIDs({ combinator: and, rules: [rg3] }), p([0, 1]), [0]),
      { combinator: and, rules: [r2, { combinator: and, rules: [r1, r3] }] }
    );
    testQT(
      'moves a rule up to a sibling group',
      move(
        pathsAsIDs({
          combinator: and,
          rules: [
            { combinator: and, rules: [r1] },
            { combinator: and, rules: [r2, r3] },
          ],
        }),
        p([1, 1]),
        [0, 1]
      ),
      {
        combinator: and,
        rules: [
          { combinator: and, rules: [r1, r3] },
          { combinator: and, rules: [r2] },
        ],
      }
    );
    testQT(
      'moves a rule down to a sibling group',
      move(
        pathsAsIDs({
          combinator: and,
          rules: [
            { combinator: and, rules: [r1, r2] },
            { combinator: and, rules: [r3, r4] },
          ],
        }),
        p([0, 1]),
        [1, 1]
      ),
      {
        combinator: and,
        rules: [
          { combinator: and, rules: [r1] },
          { combinator: and, rules: [r3, r2, r4] },
        ],
      }
    );
    testQT('clones a rule', move(rg3wIDs, [1], [0], { clone: true }), {
      combinator: and,
      rules: [r2, r1, r2, r3],
    });
    testQT(
      'clones a group',
      move(pathsAsIDs({ combinator: and, rules: [r1, rg3, r2] }), p([1]), [0], { clone: true }),
      { combinator: and, rules: [rg3, r1, rg3, r2] }
    );
    testQT(
      'does not alter the query if the old and new paths are the same',
      move(rg3wIDs, p([1]), [1]),
      rg3wIDs,
      true
    );
    it('adds a rule with custom idGenerator', () => {
      expect(move(rg3wIDs, p([1]), [0], { clone: true, idGenerator }).rules[0].id).toMatch(
        numericRegex
      );
    });
  });

  describe.each(testLoop)('independent combinators by %s', (_, p) => {
    testQT(
      'swaps the first rule with the last within the same group',
      move(pathsAsIDs(rgic2), p([0]), [3]),
      { rules: [r2, and, r1] }
    );
    testQT(
      'swaps the last rule with the first within the same group',
      move(pathsAsIDs(rgic2), p([2]), [0]),
      { rules: [r2, and, r1] }
    );
    testQT(
      'moves a rule from first to last within the same group',
      move(pathsAsIDs({ rules: [r1, and, r2, or, r3] }), p([0]), [5]),
      { rules: [r2, or, r3, or, r1] }
    );
    testQT(
      'moves a rule from last to first within the same group',
      move(pathsAsIDs({ rules: [r1, and, r2, or, r3] }), p([4]), [0]),
      { rules: [r3, and, r1, and, r2] }
    );
    testQT(
      'moves a rule from last to middle by dropping on inline combinator',
      move(pathsAsIDs({ rules: [r1, and, r2, or, r3] }), p([4]), [1]),
      { rules: [r1, or, r3, and, r2] }
    );
    testQT(
      'moves a first-child rule to a different group as the first child',
      move(pathsAsIDs({ rules: [r1, and, { rules: [r2, and, r3] }] }), p([0]), [2, 0]),
      { rules: [{ rules: [r1, and, r2, and, r3] }] }
    );
    testQT(
      'moves a middle-child rule to a different group as a middle child',
      move(
        pathsAsIDs({ rules: [r1, and, r2, and, r3, and, { rules: [r4, and, r5] }] }),
        p([2]),
        [6, 1]
      ),
      { rules: [r1, and, r3, and, { rules: [r4, and, r2, and, r5] }] }
    );
    testQT(
      'moves an only-child rule up to a different group with only one existing child',
      move(pathsAsIDs({ rules: [{ rules: [r1] }, and, { rules: [r2] }] }), p([2, 0]), [0, 1]),
      { rules: [{ rules: [r1, and, r2] }, and, { rules: [] }] }
    );
    testQT(
      '',
      move(pathsAsIDs({ rules: [{ rules: [r1] }, and, { rules: [r2] }] }), p([2, 0]), [0, 0]),
      { rules: [{ rules: [r2, and, r1] }, and, { rules: [] }] }
    );
    testQT(
      'moves a middle-child rule up to a different group with only one existing child',
      move(
        pathsAsIDs({ rules: [{ rules: [r1] }, and, { rules: [r2, and, r3, and, r4] }] }),
        p([2, 2]),
        [0, 1]
      ),
      { rules: [{ rules: [r1, and, r3] }, and, { rules: [r2, and, r4] }] }
    );
    const tempRGIC: DefaultRuleGroupTypeIC = pathsAsIDs(rgic2);
    testQT(
      'does not alter the query if the old path is to a combinator',
      move(tempRGIC, p([1]), [0]),
      tempRGIC,
      true
    );
  });

  describe.each(testLoop)('on bad %s', (_, p) => {
    testQT('bails out', move(rg1wID, p([1]), badPath), rg1wID, true);
  });

  // oxlint-disable-next-line expect-expect
  it('should have the right types', () => {
    const _newQuery = move({ ...rg1 }, [1], [0]);
    const _newDefaultQuery = move(rg1, [1], [0]);
    const _newICQuery = move({ ...rgic1 }, [1], [0]);
    const _newDefaultICQuery = move(rgic1, [1], [0]);

    const _assertion1: ExpectExtends<DefaultRuleGroupTypeIC, typeof _newQuery> = false;
    const _assertion2: ExpectExtends<DefaultRuleGroupType, typeof _newQuery> = true;
    const _assertion3: ExpectExtends<DefaultRuleGroupType, typeof _newICQuery> = false;
    const _assertion4: ExpectExtends<DefaultRuleGroupTypeIC, typeof _newICQuery> = true;
    const _assertion5: Expect<Equal<DefaultRuleGroupType, typeof _newDefaultQuery>> = true;
    const _assertion6: ExpectExtends<DefaultRuleGroupTypeIC, typeof _newICQuery> = true;
    const _assertion7: Expect<Equal<DefaultRuleGroupTypeIC, typeof _newDefaultICQuery>> = true;
  });
});

describe('shift', () => {
  describe.each(testLoop)('standard rule groups by %s', (_, p) => {
    testQT('shifts a rule down within the same group', move(rg3wIDs, p([0]), 'down'), {
      combinator: and,
      rules: [r2, r1, r3],
    });
    testQT(
      'clones a rule down within the same group',
      move(rg3wIDs, p([0]), 'down', { clone: true }),
      { combinator: and, rules: [r1, r2, r1, r3] }
    );
    testQT(
      'shifts a rule down into a subgroup',
      move(
        pathsAsIDs({ combinator: and, rules: [r1, { combinator: and, rules: [r2, r3] }] }),
        p([0]),
        'down'
      ),
      { combinator: and, rules: [{ combinator: and, rules: [r1, r2, r3] }] }
    );
    testQT(
      'shifts a rule down out of a subgroup',
      move(pathsAsIDs({ combinator: and, rules: [rg3] }), p([0, 2]), 'down'),
      { combinator: and, rules: [{ combinator: and, rules: [r1, r2] }, r3] }
    );
    testQT('shifts a rule up within the same group', move(rg3wIDs, p([1]), 'up'), {
      combinator: and,
      rules: [r2, r1, r3],
    });
    testQT(
      'shifts a rule up out of a sub group',
      move(pathsAsIDs({ combinator: and, rules: [rg3] }), p([0, 0]), 'up'),
      { combinator: and, rules: [r1, { combinator: and, rules: [r2, r3] }] }
    );
    testQT(
      'shifts a rule up into a subgroup',
      move(
        pathsAsIDs({ combinator: and, rules: [{ combinator: and, rules: [r1, r2] }, r3] }),
        p([1]),
        'up'
      ),
      { combinator: and, rules: [rg3] }
    );
    testQT('does not shift first rule up', move(rg3wIDs, p([0]), 'up'), rg3wIDs, true);
    testQT('does not shift last rule down', move(rg3wIDs, p([2]), 'down'), rg3wIDs, true);
  });

  describe.each(testLoop)('independent combinators by %s', (_, p) => {
    testQT(
      'shifts a rule down within the same group',
      move(pathsAsIDs({ rules: [r1, and, r2, or, r3] }), p([0]), 'down'),
      { rules: [r2, and, r1, or, r3] }
    );
    testQT(
      'clones a rule down within the same group',
      move(pathsAsIDs({ rules: [r1, and, r2, or, r3] }), p([0]), 'down', { clone: true }),
      { rules: [r1, and, r2, and, r1, or, r3] }
    );
    testQT(
      'shifts a rule down into a subgroup',
      move(pathsAsIDs({ rules: [r1, or, { rules: [r2, and, r3] }] }), p([0]), 'down'),
      { rules: [{ rules: [r1, or, r2, and, r3] }] }
    );
    testQT(
      'shifts a rule down out of a subgroup',
      move(pathsAsIDs({ rules: [rgic2] }), p([0, 2]), 'down'),
      { rules: [{ rules: [r1] }, and, r2] }
    );
    testQT('shifts a rule up within the same group', move(pathsAsIDs(rgic2), p([2]), 'up'), {
      rules: [r2, and, r1],
    });
    testQT(
      'shifts a rule up out of a sub group',
      move(pathsAsIDs({ rules: [rgic2] }), p([0, 0]), 'up'),
      { rules: [r1, and, { rules: [r2] }] }
    );
    testQT(
      'shifts a rule up into a subgroup',
      move(pathsAsIDs({ rules: [rgic2, or, r3] }), p([2]), 'up'),
      { rules: [{ rules: [r1, and, r2, or, r3] }] }
    );
  });

  describe.each(testLoop)('on bad %s', (_, p) => {
    // @ts-expect-error 'x' is not assignable to 'up' | 'down'
    testQT('does not alter query for invalid direction', move(rg3, p([0]), 'x'), rg3, true);
  });

  // oxlint-disable-next-line expect-expect
  it('should have the right types', () => {
    const _newQuery = move({ ...rg1 }, [1], 'up');
    const _newDefaultQuery = move(rg1, [1], 'up');
    const _newICQuery = move({ ...rgic1 }, [1], 'up');
    const _newDefaultICQuery = move(rgic1, [1], 'up');

    const _assertion1: ExpectExtends<DefaultRuleGroupTypeIC, typeof _newQuery> = false;
    const _assertion2: ExpectExtends<DefaultRuleGroupType, typeof _newQuery> = true;
    const _assertion3: ExpectExtends<DefaultRuleGroupType, typeof _newICQuery> = false;
    const _assertion4: ExpectExtends<DefaultRuleGroupTypeIC, typeof _newICQuery> = true;
    const _assertion5: Expect<Equal<DefaultRuleGroupType, typeof _newDefaultQuery>> = true;
    const _assertion6: ExpectExtends<DefaultRuleGroupTypeIC, typeof _newICQuery> = true;
    const _assertion7: Expect<Equal<DefaultRuleGroupTypeIC, typeof _newDefaultICQuery>> = true;
  });
});

describe('insert', () => {
  describe('standard rule groups', () => {
    testQT('inserts a rule', insert(rg1, r1, [0]), { combinator: and, rules: [r1] });
    testQT('inserts another rule', insert({ combinator: and, rules: [r1] }, r2, [0]), {
      combinator: and,
      rules: [r2, r1],
    });
    testQT('inserts between two rules', insert({ combinator: and, rules: [r1, r2] }, r3, [1]), {
      combinator: and,
      rules: [r1, r3, r2],
    });
    testQT('inserts a group', insert(rg1, rg2, [0]), {
      combinator: and,
      rules: [rg2],
    });
    it('inserts a rule with custom idGenerator', () => {
      expect(insert(rg1, r1, [0], { idGenerator }).rules[0].id).toMatch(numericRegex);
    });
    testQT(
      'replaces a rule',
      insert({ combinator: and, rules: [r1, r2, r3] }, r2, [0], { replace: true }),
      { combinator: and, rules: [r2, r2, r3] }
    );
    testQT(
      'replaces a group',
      insert({ combinator: and, rules: [rg1, rg2, rg3] }, rg1, [2], { replace: true }),
      { combinator: and, rules: [rg1, rg2, rg1] }
    );
  });

  describe('independent combinators', () => {
    testQT('inserts a rule', insert(rgic1, r1, [0]), { rules: [r1] });
    testQT('inserts a rule and the default combinator', insert({ rules: [r1] }, r2, [1]), {
      rules: [r1, and, r2],
    });
    testQT(
      'inserts a rule and the default combinator between two rules (rule index)',
      insert({ rules: [r1, and, r2] }, r3, [2]),
      { rules: [r1, and, r3, and, r2] }
    );
    testQT(
      'inserts a rule and the default combinator between two rules (preceding combinator index)',
      insert({ rules: [r1, and, r2] }, r3, [1]),
      { rules: [r1, and, r3, and, r2] }
    );
    testQT(
      'inserts a rule and a custom combinator',
      insert({ rules: [r1] }, r2, [1], {
        combinators: defaultCombinators.map(c => ({
          ...c,
          name: `custom-${c.name}`,
          value: `custom-${c.name}`,
        })),
      }),
      {
        // @ts-expect-error custom combinator
        rules: [r1, `custom-${and}`, r2],
      }
    );
    testQT(
      'inserts a rule with the default combinator at first position',
      insert({ rules: [r1] } as DefaultRuleGroupTypeIC, { ...r2, path: [0] }, [0]),
      { rules: [r2, and, r1] }
    );
    testQT(
      'inserts a rule with the succeeding combinator',
      insert({ rules: [r1] } as DefaultRuleGroupTypeIC, { ...r2, path: [0] }, [0], {
        combinatorSucceeding: or,
      }),
      { rules: [r2, or, r1] }
    );
    testQT(
      'inserts a rule and copies existing combinator',
      insert({ rules: [r1, or, r2] }, r3, [3]),
      { rules: [r1, or, r2, or, r3] }
    );
    testQT(
      'inserts a rule with specified preceding combinator, ignoring defaults (combinator index)',
      insert({ rules: [r1, and, r2] }, r3, [3], {
        combinators: defaultCombinators.map(c => ({ ...c, name: `custom-${c.name}` })),
        combinatorPreceding: or,
      }),
      { rules: [r1, and, r2, or, r3] }
    );
    testQT(
      'inserts a rule with specified preceding combinator, ignoring defaults (rule index)',
      insert({ rules: [r1, and, r2] }, r3, [2], {
        combinators: defaultCombinators.map(c => ({ ...c, name: `custom-${c.name}` })),
        combinatorPreceding: or,
      }),
      { rules: [r1, or, r3, and, r2] }
    );
    testQT(
      'inserts a rule and ignores specified combinators when new index is zero',
      insert({ rules: [r1, and, r2] }, r3, [0], {
        combinatorPreceding: or,
        combinatorSucceeding: or,
      }),
      { rules: [r3, and, r1, and, r2] }
    );
    testQT('inserts a group', insert(rgic1, rgic2, []), {
      rules: [rgic2],
    });
    testQT(
      'replaces a rule in middle position',
      insert({ rules: [r1, and, r2, or, r3] }, r3, [2], { replace: true }),
      { rules: [r1, and, r3, or, r3] }
    );
    testQT(
      'replaces a group in last position',
      insert({ rules: [rgic1, and, rgic2, or, rgic2] }, rgic1, [4], { replace: true }),
      { rules: [rgic1, and, rgic2, or, rgic1] }
    );
    testQT(
      'replaces a group after independent combinator',
      insert({ rules: [rgic1, and, rgic2, or, rgic2] }, rgic1, [3], { replace: true }),
      { rules: [rgic1, and, rgic2, or, rgic1] }
    );
  });

  testQT('bails out on bad path', insert(rg1, rg2, badPath), rg1);

  // oxlint-disable-next-line expect-expect
  it('should have the right types', () => {
    const _newQuery = insert({ ...rg1 }, { ...rg2 }, []);
    const _newDefaultQuery = insert(rg1, rg2, []);
    const _newICQuery = insert({ ...rgic1 }, { ...rgic2 }, []);
    const _newDefaultICQuery = insert(rgic1, rgic2, []);

    const _assertion1: ExpectExtends<DefaultRuleGroupTypeIC, typeof _newQuery> = false;
    const _assertion2: ExpectExtends<DefaultRuleGroupType, typeof _newQuery> = true;
    const _assertion3: ExpectExtends<DefaultRuleGroupType, typeof _newICQuery> = false;
    const _assertion4: ExpectExtends<DefaultRuleGroupTypeIC, typeof _newICQuery> = true;
    const _assertion5: Expect<Equal<DefaultRuleGroupType, typeof _newDefaultQuery>> = true;
    const _assertion6: ExpectExtends<DefaultRuleGroupTypeIC, typeof _newICQuery> = true;
    const _assertion7: Expect<Equal<DefaultRuleGroupTypeIC, typeof _newDefaultICQuery>> = true;
  });
});

describe('group', () => {
  describe.each(testLoop)('standard rule groups by %s', (_, p) => {
    testQT(
      'groups a rule down within the same group',
      group(pathsAsIDs({ combinator: and, rules: [r1, r2] }), p([0]), p([1])),
      { combinator: and, rules: [{ combinator: and, rules: [r2, r1] }] }
    );
    // Shouldn't target an ancestor group?
    // testQT(
    //   'groups a rule to a different group with a common ancestor',
    //   group({ combinator: and, rules: [r1, r2, rg1] }, [1], [2, 0]),
    //   {
    //     combinator: and,
    //     rules: [r1, { ...rg1, rules: [r2] }],
    //   }
    // );
    // Can't target an ancestor group?
    // testQT(
    //   "groups a rule up to its parent group's parent group",
    //   group({ combinator: and, rules: [rg3] }, [0, 1], [0]),
    //   {
    //     combinator: and,
    //     rules: [r2, rg3],
    //   }
    // );
    testQT(
      'groups a rule up to a sibling group',
      group(
        pathsAsIDs({
          combinator: and,
          rules: [
            { combinator: and, rules: [r1] },
            { combinator: and, rules: [r2, r3] },
          ],
        }),
        p([1, 1]),
        p([0, 0])
      ),
      {
        combinator: and,
        rules: [
          { combinator: and, rules: [{ combinator: and, rules: [r1, r3] }] },
          { combinator: and, rules: [r2] },
        ],
      }
    );
    testQT(
      'groups a rule down to a sibling group',
      group(
        pathsAsIDs({
          combinator: and,
          rules: [
            { combinator: and, rules: [r1, r2] },
            { combinator: and, rules: [r3, r4] },
          ],
        }),
        p([0, 1]),
        p([1, 1])
      ),
      {
        combinator: and,
        rules: [
          { combinator: and, rules: [r1] },
          { combinator: and, rules: [r3, { combinator: and, rules: [r4, r2] }] },
        ],
      }
    );
    testQT('clones a rule', group(rg3wIDs, p([1]), p([0]), { clone: true }), {
      combinator: and,
      rules: [{ combinator: and, rules: [r1, r2] }, r2, r3],
    });
    testQT(
      'clones a group',
      group(pathsAsIDs({ combinator: and, rules: [r1, rg3, r2] }), p([1]), p([0]), { clone: true }),
      {
        combinator: and,
        rules: [{ combinator: and, rules: [r1, rg3] }, rg3, r2],
      }
    );
    testQT(
      'does not alter the query if the old and new paths are the same',
      group(rg3wIDs, p([1]), p([1])),
      rg3wIDs,
      true
    );
    it('adds a rule with custom idGenerator', () => {
      expect(
        (group(rg3wIDs, p([1]), p([0]), { clone: true, idGenerator }).rules[0] as RuleGroupType)
          .rules[1].id
      ).toMatch(numericRegex);
    });
  });

  describe.each(testLoop)('independent combinators by %s', (_, p) => {
    testQT(
      'groups the only two rules in a group, last as target',
      group(pathsAsIDs(rgic2), p([0]), p([2])),
      { rules: [{ rules: [r2, and, r1] }] }
    );
    testQT(
      'groups the only two rules in a group, first as target',
      group(pathsAsIDs(rgic2), p([2]), p([0])),
      { rules: [{ rules: [r1, and, r2] }] }
    );
    testQT(
      'groups a rule from first to last within the same group',
      group(pathsAsIDs({ rules: [r1, and, r2, or, r3] }), p([0]), p([4])),
      { rules: [r2, or, { rules: [r3, and, r1] }] }
    );
    testQT(
      'groups a rule from last to first within the same group',
      group(pathsAsIDs({ rules: [r1, and, r2, or, r3] }), p([4]), p([0])),
      { rules: [{ rules: [r1, and, r3] }, and, r2] }
    );
    testQT(
      'groups a rule from last to middle',
      group(pathsAsIDs({ rules: [r1, and, r2, or, r3] }), p([4]), p([2])),
      {
        rules: [r1, and, { rules: [r2, and, r3] }],
      }
    );
    testQT(
      'groups a first-child rule to a different group with one rule',
      group(pathsAsIDs({ rules: [r1, and, { rules: [r2, and, r3] }] }), p([0]), p([2, 0])),
      { rules: [{ rules: [{ rules: [r2, and, r1] }, and, r3] }] }
    );
    testQT(
      'groups a middle-child rule to a different group with multiple rules',
      group(
        pathsAsIDs({ rules: [r1, and, r2, and, r3, and, { rules: [r4, and, r5] }] }),
        p([2]),
        p([6, 0])
      ),
      { rules: [r1, and, r3, and, { rules: [{ rules: [r4, and, r2] }, and, r5] }] }
    );
    testQT(
      'groups an only-child rule up to a different group with only one existing child',
      group(pathsAsIDs({ rules: [{ rules: [r1] }, and, { rules: [r2] }] }), p([2, 0]), p([0, 0])),
      { rules: [{ rules: [{ rules: [r1, and, r2] }] }, and, { rules: [] }] }
    );
    testQT(
      'groups an only-child rule up to a different group with only one existing child group',
      group(pathsAsIDs({ rules: [{ rules: [r1] }, and, { rules: [r2] }] }), p([2, 0]), p([0, 0])),
      { rules: [{ rules: [{ rules: [r1, and, r2] }] }, and, { rules: [] }] }
    );
    testQT(
      'groups a middle-child rule up to a different group with only one existing child',
      group(
        pathsAsIDs({ rules: [{ rules: [r1] }, and, { rules: [r2, and, r3, and, r4] }] }),
        p([2, 2]),
        p([0, 0])
      ),
      { rules: [{ rules: [{ rules: [r1, and, r3] }] }, and, { rules: [r2, and, r4] }] }
    );
    const tempRGIC: DefaultRuleGroupTypeIC = pathsAsIDs({ rules: [r1, and, r2] });
    testQT(
      'does not alter the query if the old path is to a combinator',
      group(tempRGIC, p([1]), p([0])),
      tempRGIC,
      true
    );
  });

  describe.each(testLoop)('on bad %s', (_, p) => {
    testQT('bails out', group(rg1wID, p([1]), badPath), rg1wID, true);
  });

  // oxlint-disable-next-line expect-expect
  it('should have the right types', () => {
    const _newQuery = group({ ...rg1 }, [1], [0]);
    const _newDefaultQuery = group(rg1, [1], [0]);
    const _newICQuery = group({ ...rgic1 }, [1], [0]);
    const _newDefaultICQuery = group(rgic1, [1], [0]);

    const _assertion1: ExpectExtends<DefaultRuleGroupTypeIC, typeof _newQuery> = false;
    const _assertion2: ExpectExtends<DefaultRuleGroupType, typeof _newQuery> = true;
    const _assertion3: ExpectExtends<DefaultRuleGroupType, typeof _newICQuery> = false;
    const _assertion4: ExpectExtends<DefaultRuleGroupTypeIC, typeof _newICQuery> = true;
    const _assertion5: Expect<Equal<DefaultRuleGroupType, typeof _newDefaultQuery>> = true;
    const _assertion6: ExpectExtends<DefaultRuleGroupTypeIC, typeof _newICQuery> = true;
    const _assertion7: Expect<Equal<DefaultRuleGroupTypeIC, typeof _newDefaultICQuery>> = true;
  });
});
