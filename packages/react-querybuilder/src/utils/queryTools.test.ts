import type { Equal, Expect, ExpectExtends } from '@rqb-test';
import { defaultCombinators } from '../defaults';
import type {
  DefaultRuleGroupType,
  DefaultRuleGroupTypeAny,
  DefaultRuleGroupTypeIC,
  DefaultRuleType,
  Path,
  ValueSources,
} from '../types/index.noReact';
import { formatQuery } from './formatQuery';
import { getValueSourcesUtil } from './getValueSourcesUtil';
import { numericRegex } from './misc';
import { add, insert, move, remove, update } from './queryTools';

const [and, or] = defaultCombinators.map(c => c.name);
const [value, field] = ['value', 'field'] as ValueSources;

const stripIDs = (query: DefaultRuleGroupTypeAny) =>
  JSON.parse(formatQuery(query, 'json_without_ids'));

const idGenerator = () => `${Math.random()}`;

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

describe('add', () => {
  describe('standard rule groups', () => {
    testQT('adds a rule', add(rg1, r1, []), { combinator: and, rules: [r1] });
    testQT('adds another rule', add({ combinator: and, rules: [r1] }, r2, []), {
      combinator: and,
      rules: [r1, r2],
    });
    testQT('adds a group', add(rg1, rg2, []), {
      combinator: and,
      rules: [rg2],
    });
    it('adds a rule with custom idGenerator', () => {
      expect(add(rg1, r1, [], { idGenerator }).rules[0].id).toMatch(numericRegex);
    });
  });

  describe('independent combinators', () => {
    testQT('adds a rule', add(rgic1, r1, []), { rules: [r1] });
    testQT('adds a rule and the default combinator', add({ rules: [r1] }, r2, []), {
      rules: [r1, and, r2],
    });
    testQT(
      'adds a rule and a custom combinator',
      add({ rules: [r1] }, r2, [], {
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
    testQT('adds a rule and copies existing combinator', add({ rules: [r1, or, r2] }, r3, []), {
      rules: [r1, or, r2, or, r3],
    });
    testQT(
      'adds a rule with specified combinator, ignoring defaults',
      add({ rules: [r1, and, r2] }, r3, [], {
        combinators: defaultCombinators.map(c => ({ ...c, name: `custom-${c.name}` })),
        combinatorPreceding: or,
      }),
      { rules: [r1, and, r2, or, r3] }
    );
    testQT('adds a group', add(rgic1, rgic2, []), { rules: [rgic2] });
  });

  testQT('bails out on bad path', add(rg1, rg2, badPath), rg1);

  it('should have the right types', () => {
    const newQuery = add({ ...rg1 }, { ...rg2 }, []);
    const newDefaultQuery = add(rg1, rg2, []);
    const newICQuery = add({ ...rgic1 }, { ...rgic2 }, []);
    const newDefaultICQuery = add(rgic1, rgic2, []);

    type _Assertions = [
      // TODO: RuleGroup/IC should be strict enough that this first line should error
      ExpectExtends<DefaultRuleGroupTypeIC, typeof newQuery>,
      ExpectExtends<DefaultRuleGroupType, typeof newQuery>,
      Expect<Equal<DefaultRuleGroupType, typeof newDefaultQuery>>,
      ExpectExtends<DefaultRuleGroupTypeIC, typeof newICQuery>,
      Expect<Equal<DefaultRuleGroupTypeIC, typeof newDefaultICQuery>>,
    ];
  });
});

describe('remove', () => {
  describe('standard rule groups', () => {
    testQT('removes the first of two rules', remove({ combinator: and, rules: [r1, r2] }, [0]), {
      combinator: and,
      rules: [r2],
    });
    testQT(
      'removes the second of three rules',
      remove({ combinator: and, rules: [r1, r2, r3] }, [1]),
      {
        combinator: and,
        rules: [r1, r3],
      }
    );
    testQT('removes a group', remove({ combinator: and, rules: [r1, rg1] }, [1]), {
      combinator: and,
      rules: [r1],
    });
    testQT('does not remove the root group', remove(rg1, []), rg1, true);
  });

  describe('independent combinators', () => {
    testQT('removes a lonely rule', remove({ rules: [r1] }, [0]), rgic1);
    testQT('removes the second of two rules', remove(rgic2, [2]), {
      rules: [r1],
    });
    testQT('removes the first of three rules', remove({ rules: [r1, and, r2, or, r3] }, [0]), {
      rules: [r2, or, r3],
    });
    testQT('removes the second of three rules', remove({ rules: [r1, and, r2, or, r3] }, [2]), {
      rules: [r1, or, r3],
    });
    testQT('removes the third of three rules', remove({ rules: [r1, and, r2, or, r3] }, [4]), {
      rules: [r1, and, r2],
    });
    testQT('removes a group', remove({ rules: [rgic1, and, rgic2] }, [0]), {
      rules: [rgic2],
    });
    testQT('does not remove the root group', remove(rgic1, []), rgic1, true);
    testQT('does not remove independent combinators', remove(rgic2, [1]), rgic2, true);
  });

  testQT('bails out on bad path', remove(rg1, badPath), rg1);

  it('should have the right types', () => {
    const newQuery = remove({ ...rg1 }, [0]);
    const newDefaultQuery = remove(rg1, [0]);
    const newICQuery = remove({ ...rgic1 }, [0]);
    const newDefaultICQuery = remove(rgic1, [0]);

    type _Assertions = [
      // TODO: RuleGroup/IC should be strict enough that this first line should error
      ExpectExtends<DefaultRuleGroupTypeIC, typeof newQuery>,
      ExpectExtends<DefaultRuleGroupType, typeof newQuery>,
      Expect<Equal<DefaultRuleGroupType, typeof newDefaultQuery>>,
      ExpectExtends<DefaultRuleGroupTypeIC, typeof newICQuery>,
      Expect<Equal<DefaultRuleGroupTypeIC, typeof newDefaultICQuery>>,
    ];
  });
});

describe('update', () => {
  describe('standard rule groups', () => {
    testQT('updates a rule', update(rg3, 'field', 'fu', [0]), {
      combinator: and,
      rules: [{ ...r1, field: 'fu', value: '' }, r2, r3],
    });
    testQT(
      'updates a rule and resets the value by default',
      update(
        {
          combinator: and,
          rules: [{ field: 'f1', operator: '<', value: 'v1' }],
        },
        'field',
        'fu',
        [0]
      ),
      {
        combinator: and,
        rules: [{ ...r1, field: 'fu', value: '' }],
      }
    );
    testQT(
      'updates a rule and does not reset the value',
      update(rg3, 'field', 'fu', [0], { resetOnFieldChange: false }),
      {
        combinator: and,
        rules: [{ ...r1, field: 'fu' }, r2, r3],
      }
    );
    testQT(
      'updates a rule operator and does not reset the value',
      update(rg3, 'operator', 'between', [1]),
      {
        combinator: and,
        rules: [r1, { ...r2, operator: 'between' }, r3],
      }
    );
    testQT(
      'updates a rule operator and resets the value',
      update(rg3, 'operator', 'between', [1], { resetOnOperatorChange: true }),
      {
        combinator: and,
        rules: [r1, { ...r2, operator: 'between', value: '' }, r3],
      }
    );
    testQT('updates a rule value', update(rg3, 'value', 'vu', [2]), {
      combinator: and,
      rules: [r1, r2, { ...r3, value: 'vu' }],
    });
    testQT('updates a group combinator', update(rg1, 'combinator', or, []), rg2);
    testQT('updates a group "not" value', update(rg1, 'not', true, []), {
      ...rg1,
      not: true,
    });
    testQT(
      'updates a child group combinator',
      update({ combinator: and, rules: [rg1] }, 'combinator', or, [0]),
      {
        combinator: and,
        rules: [rg2],
      }
    );
    testQT(
      'updates a child group "not" value',
      update({ combinator: and, rules: [rg1] }, 'not', true, [0]),
      {
        combinator: and,
        rules: [{ ...rg1, not: true }],
      }
    );
    testQT(
      'does not reset operator or value when the field is the same',
      update(rg3, 'field', 'f1', [0], { resetOnFieldChange: true }),
      rg3,
      true
    );
    testQT(
      'does not reset value when the operator is the same',
      update(rg3, 'operator', '=', [0], { resetOnOperatorChange: true }),
      rg3,
      true
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

  describe('value sources', () => {
    testQT(
      'updates value source from undefined to field',
      update(rgvsu, 'valueSource', field, [0]),
      { combinator: 'and', rules: [{ ...r1, value: '', valueSource: 'field' }] }
    );
    testQT('updates value source from field to value', update(rgvsf, 'valueSource', value, [0]), {
      combinator: 'and',
      rules: [{ ...r1, value: '', valueSource: 'value' }],
    });
    testQT('resets value source to default on field change', update(rgvsf, 'field', 'fu', [0]), {
      combinator: 'and',
      rules: [{ ...r1, field: 'fu', value: '', valueSource: 'value' }],
    });
    testQT(
      'resets value source to default of "field" on field change',
      update(rgvsv, 'field', 'fu', [0], {
        getValueSources: () => ['field', 'value'],
      }),
      {
        combinator: 'and',
        rules: [{ ...r1, field: 'fu', value: '', valueSource: 'field' }],
      }
    );
    testQT(
      'resets value source to default of "field" on field change when Field specifies value sources',
      update(rgvsv, 'field', 'fu', [0], {
        getValueSources: (fld, op) =>
          getValueSourcesUtil(
            { name: fld, value: fld, label: 'Fld', valueSources: ['field', 'value'] },
            op
          ),
      }),
      {
        combinator: 'and',
        rules: [{ ...r1, field: 'fu', value: '', valueSource: 'field' }],
      }
    );
    testQT(
      'resets value source to default on operator change',
      update(rgvsf, 'operator', 'between', [0], {
        resetOnOperatorChange: true,
      }),
      {
        combinator: 'and',
        rules: [{ ...r1, operator: 'between', value: '', valueSource: 'value' }],
      }
    );
    testQT(
      'updates undefined value source to default when set explicitly',
      update(rgvsu, 'valueSource', value, [0]),
      rgvsv
    );
  });

  testQT('bails out on bad path', update(rg1, 'value', 'test', badPath), rg1);
});

describe('move', () => {
  describe('standard rule groups', () => {
    testQT(
      'moves a rule down within the same group',
      move(
        {
          combinator: and,
          rules: [r1, r2],
        },
        [0],
        [2]
      ),
      { combinator: and, rules: [r2, r1] }
    );
    testQT(
      'moves a rule to a different group with a common ancestor',
      move({ combinator: and, rules: [r1, r2, rg1] }, [1], [2, 0]),
      {
        combinator: and,
        rules: [r1, { ...rg1, rules: [r2] }],
      }
    );
    testQT(
      "moves a rule up to its parent group's parent group",
      move({ combinator: and, rules: [rg3] }, [0, 1], [0]),
      {
        combinator: and,
        rules: [r2, { combinator: and, rules: [r1, r3] }],
      }
    );
    testQT(
      'moves a rule up to a sibling group',
      move(
        {
          combinator: and,
          rules: [
            { combinator: and, rules: [r1] },
            { combinator: and, rules: [r2, r3] },
          ],
        },
        [1, 1],
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
        {
          combinator: and,
          rules: [
            { combinator: and, rules: [r1, r2] },
            { combinator: and, rules: [r3, r4] },
          ],
        },
        [0, 1],
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
    testQT('clones a rule', move(rg3, [1], [0], { clone: true }), {
      combinator: and,
      rules: [r2, r1, r2, r3],
    });
    testQT(
      'clones a group',
      move({ combinator: and, rules: [r1, rg3, r2] }, [1], [0], {
        clone: true,
      }),
      {
        combinator: and,
        rules: [rg3, r1, rg3, r2],
      }
    );
    testQT(
      'does not alter the query if the old and new paths are the same',
      move(rg3, [1], [1]),
      rg3,
      true
    );
    it('adds a rule with custom idGenerator', () => {
      expect(move(rg3, [1], [0], { clone: true, idGenerator }).rules[0].id).toMatch(numericRegex);
    });
  });

  describe('independent combinators', () => {
    testQT('swaps the first rule with the last within the same group', move(rgic2, [0], [3]), {
      rules: [r2, and, r1],
    });
    testQT('swaps the last rule with the first within the same group', move(rgic2, [2], [0]), {
      rules: [r2, and, r1],
    });
    testQT(
      'moves a rule from first to last within the same group',
      move({ rules: [r1, and, r2, or, r3] }, [0], [5]),
      { rules: [r2, or, r3, or, r1] }
    );
    testQT(
      'moves a rule from last to first within the same group',
      move({ rules: [r1, and, r2, or, r3] }, [4], [0]),
      { rules: [r3, and, r1, and, r2] }
    );
    testQT(
      'moves a rule from last to middle by dropping on inline combinator',
      move({ rules: [r1, and, r2, or, r3] }, [4], [1]),
      { rules: [r1, or, r3, and, r2] }
    );
    testQT(
      'moves a first-child rule to a different group as the first child',
      move({ rules: [r1, and, { rules: [r2, and, r3] }] }, [0], [2, 0]),
      { rules: [{ rules: [r1, and, r2, and, r3] }] }
    );
    testQT(
      'moves a middle-child rule to a different group as a middle child',
      move({ rules: [r1, and, r2, and, r3, and, { rules: [r4, and, r5] }] }, [2], [6, 1]),
      { rules: [r1, and, r3, and, { rules: [r4, and, r2, and, r5] }] }
    );
    testQT(
      'moves an only-child rule up to a different group with only one existing child',
      move({ rules: [{ rules: [r1] }, and, { rules: [r2] }] }, [2, 0], [0, 1]),
      { rules: [{ rules: [r1, and, r2] }, and, { rules: [] }] }
    );
    testQT('', move({ rules: [{ rules: [r1] }, and, { rules: [r2] }] }, [2, 0], [0, 0]), {
      rules: [{ rules: [r2, and, r1] }, and, { rules: [] }],
    });
    testQT(
      'moves a middle-child rule up to a different group with only one existing child',
      move({ rules: [{ rules: [r1] }, and, { rules: [r2, and, r3, and, r4] }] }, [2, 2], [0, 1]),
      { rules: [{ rules: [r1, and, r3] }, and, { rules: [r2, and, r4] }] }
    );
    testQT(
      'does not alter the query if the old path is to a combinator',
      move(rgic2, [1], [0]),
      rgic2,
      true
    );
  });

  testQT('bails out on bad path', move(rg1, [1], badPath), rg1);
});

describe('shift', () => {
  describe('standard rule groups', () => {
    testQT('shifts a rule down within the same group', move(rg3, [0], 'down'), {
      combinator: and,
      rules: [r2, r1, r3],
    });
    testQT('clones a rule down within the same group', move(rg3, [0], 'down', { clone: true }), {
      combinator: and,
      rules: [r1, r2, r1, r3],
    });
    testQT(
      'shifts a rule down into a subgroup',
      move({ combinator: and, rules: [r1, { combinator: and, rules: [r2, r3] }] }, [0], 'down'),
      { combinator: and, rules: [{ combinator: and, rules: [r1, r2, r3] }] }
    );
    testQT(
      'shifts a rule down out of a subgroup',
      move({ combinator: and, rules: [rg3] }, [0, 2], 'down'),
      { combinator: and, rules: [{ combinator: and, rules: [r1, r2] }, r3] }
    );
    testQT('shifts a rule up within the same group', move(rg3, [1], 'up'), {
      combinator: and,
      rules: [r2, r1, r3],
    });
    testQT(
      'shifts a rule up out of a sub group',
      move({ combinator: and, rules: [rg3] }, [0, 0], 'up'),
      { combinator: and, rules: [r1, { combinator: and, rules: [r2, r3] }] }
    );
    testQT(
      'shifts a rule up into a subgroup',
      move({ combinator: and, rules: [{ combinator: and, rules: [r1, r2] }, r3] }, [1], 'up'),
      { combinator: and, rules: [rg3] }
    );
    testQT('does not shift first rule up', move(rg3, [0], 'up'), rg3, true);
    testQT('does not shift last rule down', move(rg3, [2], 'down'), rg3, true);
  });

  describe('independent combinators', () => {
    testQT(
      'shifts a rule down within the same group',
      move({ rules: [r1, and, r2, or, r3] }, [0], 'down'),
      { rules: [r2, and, r1, or, r3] }
    );
    testQT(
      'clones a rule down within the same group',
      move({ rules: [r1, and, r2, or, r3] }, [0], 'down', { clone: true }),
      { rules: [r1, and, r2, and, r1, or, r3] }
    );
    testQT(
      'shifts a rule down into a subgroup',
      move({ rules: [r1, or, { rules: [r2, and, r3] }] }, [0], 'down'),
      { rules: [{ rules: [r1, or, r2, and, r3] }] }
    );
    testQT('shifts a rule down out of a subgroup', move({ rules: [rgic2] }, [0, 2], 'down'), {
      rules: [{ rules: [r1] }, and, r2],
    });
    testQT('shifts a rule up within the same group', move(rgic2, [2], 'up'), {
      rules: [r2, and, r1],
    });
    testQT('shifts a rule up out of a sub group', move({ rules: [rgic2] }, [0, 0], 'up'), {
      rules: [r1, and, { rules: [r2] }],
    });
    testQT('shifts a rule up into a subgroup', move({ rules: [rgic2, or, r3] }, [2], 'up'), {
      rules: [{ rules: [r1, and, r2, or, r3] }],
    });
  });

  // @ts-expect-error 'x' is not assignable to 'up' | 'down'
  testQT('does not alter query for invalid direction', move(rg3, [0], 'x'), rg3, true);
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

  it('should have the right types', () => {
    const newQuery = insert({ ...rg1 }, { ...rg2 }, []);
    const newDefaultQuery = insert(rg1, rg2, []);
    const newICQuery = insert({ ...rgic1 }, { ...rgic2 }, []);
    const newDefaultICQuery = insert(rgic1, rgic2, []);

    type _Assertions = [
      // TODO: RuleGroup/IC should be strict enough that this first line should error
      ExpectExtends<DefaultRuleGroupTypeIC, typeof newQuery>,
      ExpectExtends<DefaultRuleGroupType, typeof newQuery>,
      Expect<Equal<DefaultRuleGroupType, typeof newDefaultQuery>>,
      ExpectExtends<DefaultRuleGroupTypeIC, typeof newICQuery>,
      Expect<Equal<DefaultRuleGroupTypeIC, typeof newDefaultICQuery>>,
    ];
  });
});
