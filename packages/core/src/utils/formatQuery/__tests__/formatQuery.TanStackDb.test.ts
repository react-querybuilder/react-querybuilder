/* @vitest-environment node */

import { describe, expect, it } from 'vitest';
import type { RuleGroupType, RuleGroupTypeIC, RuleType } from '../../../types';
import { convertToIC } from '../../convertQuery';
import { defaultRuleProcessorTanStackDB } from '../defaultRuleProcessorTanStackDB';
import { formatQuery } from '../formatQuery';
import {
  getValidationTestData,
  query,
  queryAllOperatorsRandomCase,
  queryForPreserveValueOrder,
  queryIC,
  queryWithValueSourceField,
} from '../formatQueryTestUtils';
import { tanStackDbFallbackExpression } from '../tanStackDbTypes.ts';

// Mock operators that record call structure for assertion
const mockOps = {
  eq: (a: unknown, b: unknown) => ({ fn: 'eq', args: [a, b] }),
  gt: (a: unknown, b: unknown) => ({ fn: 'gt', args: [a, b] }),
  gte: (a: unknown, b: unknown) => ({ fn: 'gte', args: [a, b] }),
  lt: (a: unknown, b: unknown) => ({ fn: 'lt', args: [a, b] }),
  lte: (a: unknown, b: unknown) => ({ fn: 'lte', args: [a, b] }),
  like: (a: unknown, b: unknown) => ({ fn: 'like', args: [a, b] }),
  inArray: (a: unknown, b: unknown) => ({ fn: 'inArray', args: [a, b] }),
  isNull: (a: unknown) => ({ fn: 'isNull', args: [a] }),
  not: (a: unknown) => ({ fn: 'not', args: [a] }),
  and: (...args: unknown[]) => ({ fn: 'and', args }),
  or: (...args: unknown[]) => ({ fn: 'or', args }),
};

const { eq, gt, gte, lt, lte, like, inArray, isNull, not, and, or } = mockOps;

// Proxy-based mock ref that records field access as "refName.fieldName"
const createMockRef = (name: string) =>
  new Proxy({}, { get: (_target, prop) => `${name}.${String(prop)}` });

const mockRefs = { todo: createMockRef('todo') };

const baseContext = { tanStackDbOperators: mockOps };

// Helper: call formatQuery and invoke returned WhereCallback with mockRefs
const fq = (q: Parameters<typeof formatQuery>[0], opts?: Parameters<typeof formatQuery>[1]) => {
  const where = formatQuery(
    q,
    opts ?? { format: 'tanstack_db', context: baseContext }
  ) as unknown as ((refs: unknown) => unknown) | undefined;
  return typeof where === 'function' ? where(mockRefs) : where;
};

// Shorthand for ref field access
const f = (field: string) => `todo.${field}`;

describe('formatQuery("tanstack_db")', () => {
  it('processes standard query', () => {
    expect(fq(query)).toEqual(
      and(
        isNull(f('firstName')),
        not(isNull(f('lastName'))),
        inArray(f('firstName'), ['Test', 'This']),
        not(inArray(f('lastName'), ['Test', 'This'])),
        inArray(f('firstName'), []),
        and(gte(f('firstName'), 'Test'), lte(f('firstName'), 'This')),
        and(gte(f('firstName'), 'Test'), lte(f('firstName'), 'This')),
        not(and(gte(f('lastName'), 'Test'), lte(f('lastName'), 'This'))),
        and(gte(f('age'), 12), lte(f('age'), 14)),
        eq(f('age'), '26'),
        eq(f('isMusician'), true),
        eq(f('isLucky'), false),
        not(or(eq(f('gender'), 'M'), not(eq(f('job'), 'Programmer')), like(f('email'), '%@%'))),
        or(
          not(like(f('lastName'), '%ab%')),
          like(f('job'), 'Prog%'),
          like(f('email'), '%com'),
          not(like(f('job'), 'Man%')),
          not(like(f('email'), '%fr'))
        )
      )
    );
  });

  it('processes standard query (IC)', () => {
    expect(fq(queryIC)).toEqual(
      or(and(eq(f('firstName'), 'Test'), eq(f('middleName'), 'Test')), eq(f('lastName'), 'Test'))
    );
  });

  it('processes standard query (IC via convertToIC)', () => {
    // convertToIC(query) produces the same logical structure as query but in IC format
    const result = fq(convertToIC(query));
    expect(result).toEqual(fq(query));
  });

  it('processes queryWithValueSourceField', () => {
    expect(fq(queryWithValueSourceField)).toEqual(
      and(
        isNull(f('firstName')),
        not(isNull(f('lastName'))),
        inArray(f('firstName'), [f('middleName'), f('lastName')]),
        not(inArray(f('lastName'), [f('middleName'), f('lastName')])),
        inArray(f('firstName'), []),
        and(gte(f('firstName'), f('middleName')), lte(f('firstName'), f('lastName'))),
        and(gte(f('firstName'), f('middleName')), lte(f('firstName'), f('lastName'))),
        not(and(gte(f('lastName'), f('middleName')), lte(f('lastName'), f('lastName')))),
        eq(f('age'), f('iq')),
        eq(f('isMusician'), f('isCreative')),
        not(
          or(
            eq(f('gender'), f('someLetter')),
            not(eq(f('job'), f('isBetweenJobs'))),
            like(f('email'), undefined)
          )
        ),
        or(
          not(like(f('lastName'), undefined)),
          like(f('job'), undefined),
          like(f('email'), undefined),
          not(like(f('job'), undefined)),
          not(like(f('email'), undefined))
        )
      )
    );
  });

  it('handles operator case variations (queryAllOperatorsRandomCase)', () => {
    expect(fq(queryAllOperatorsRandomCase)).toEqual(
      and(
        not(eq(f('f'), 'v')),
        lt(f('f'), 123),
        lte(f('f'), 123),
        eq(f('f'), 'v'),
        gt(f('f'), 123),
        gte(f('f'), 123),
        like(f('f'), 'v%'),
        and(gte(f('f'), 123), lte(f('f'), 456)),
        like(f('f'), '%v%'),
        not(like(f('f'), 'v%')),
        not(like(f('f'), '%v%')),
        not(like(f('f'), '%v')),
        like(f('f'), '%v'),
        inArray(f('f'), ['v', 'x']),
        not(and(gte(f('f'), 123), lte(f('f'), 456))),
        not(inArray(f('f'), ['v', 'x'])),
        not(isNull(f('f'))),
        isNull(f('f'))
      )
    );
  });

  it('preserveValueOrder: default swaps', () => {
    const result = fq(queryForPreserveValueOrder, {
      format: 'tanstack_db',
      context: baseContext,
      parseNumbers: true,
    });
    // f1 between 12,14 → and(gte(f1,12), lte(f1,14))
    // f2 between 14,12 → swapped → and(gte(f2,12), lte(f2,14))
    expect(result).toEqual(
      and(and(gte(f('f1'), 12), lte(f('f1'), 14)), and(gte(f('f2'), 12), lte(f('f2'), 14)))
    );
  });

  it('preserveValueOrder: true keeps original order', () => {
    const result = fq(queryForPreserveValueOrder, {
      format: 'tanstack_db',
      context: baseContext,
      parseNumbers: true,
      preserveValueOrder: true,
    });
    // f2 between 14,12 → NOT swapped → and(gte(f2,14), lte(f2,12))
    expect(result).toEqual(
      and(and(gte(f('f1'), 12), lte(f('f1'), 14)), and(gte(f('f2'), 14), lte(f('f2'), 12)))
    );
  });

  it('parseNumbers with between operators', () => {
    const betweenQuery: RuleGroupType = {
      combinator: 'and',
      rules: [
        { field: 'age', operator: 'between', value: '22,34' },
        { field: 'age', operator: 'notBetween', value: ['10', '20'] },
      ],
    };

    // Default: parses numbers
    expect(fq(betweenQuery)).toEqual(
      and(and(gte(f('age'), 22), lte(f('age'), 34)), not(and(gte(f('age'), 10), lte(f('age'), 20))))
    );

    // parseNumbers: false — keeps strings
    expect(
      fq(betweenQuery, { format: 'tanstack_db', context: baseContext, parseNumbers: false })
    ).toEqual(
      and(
        and(gte(f('age'), '22'), lte(f('age'), '34')),
        not(and(gte(f('age'), '10'), lte(f('age'), '20')))
      )
    );
  });

  it('parseNumbers with comparison and in/notIn operators', () => {
    const q: RuleGroupType = {
      combinator: 'and',
      rules: [
        { field: 'age', operator: '=', value: '26' },
        { field: 'age', operator: '!=', value: '30' },
        { field: 'age', operator: '>', value: '10' },
        { field: 'age', operator: '<', value: '50' },
        { field: 'age', operator: '>=', value: '18' },
        { field: 'age', operator: '<=', value: '65' },
        { field: 'age', operator: 'in', value: '1,2,3' },
        { field: 'age', operator: 'notIn', value: '4,5' },
      ],
    };

    // parseNumbers: true → numeric values
    expect(fq(q, { format: 'tanstack_db', context: baseContext, parseNumbers: true })).toEqual(
      and(
        eq(f('age'), 26),
        not(eq(f('age'), 30)),
        gt(f('age'), 10),
        lt(f('age'), 50),
        gte(f('age'), 18),
        lte(f('age'), 65),
        inArray(f('age'), [1, 2, 3]),
        not(inArray(f('age'), [4, 5]))
      )
    );

    // default (no parseNumbers) → string values
    expect(fq(q)).toEqual(
      and(
        eq(f('age'), '26'),
        not(eq(f('age'), '30')),
        gt(f('age'), '10'),
        lt(f('age'), '50'),
        gte(f('age'), '18'),
        lte(f('age'), '65'),
        inArray(f('age'), ['1', '2', '3']),
        not(inArray(f('age'), ['4', '5']))
      )
    );
  });

  it('parseNumbers does not affect non-numeric strings', () => {
    const q: RuleGroupType = {
      combinator: 'and',
      rules: [{ field: 'name', operator: '=', value: 'Alice' }],
    };
    expect(fq(q, { format: 'tanstack_db', context: baseContext, parseNumbers: true })).toEqual(
      eq(f('name'), 'Alice')
    );
  });

  it('returns fallback on invalid operator', () => {
    expect(
      fq({ combinator: 'and', rules: [{ field: 'f', operator: 'invalid', value: 'v' }] })
    ).toBe(tanStackDbFallbackExpression);
  });

  it('returns fallback when operators are missing from context', () => {
    const q: RuleGroupType = {
      combinator: 'and',
      rules: [{ field: 'x', operator: '=', value: 1 }],
    };
    expect(fq(q, { format: 'tanstack_db' })).toBe(tanStackDbFallbackExpression);
    expect(fq(q, { format: 'tanstack_db', context: {} })).toBe(tanStackDbFallbackExpression);
  });
});

// oxlint-disable jest/expect-expect
describe('operator mapping', () => {
  const testOp = (operator: string, value: unknown, expected: unknown) => {
    const q: RuleGroupType = { combinator: 'and', rules: [{ field: 'age', operator, value }] };
    expect(fq(q)).toEqual(expected);
  };

  it('=', () => testOp('=', 25, eq(f('age'), 25)));
  it('!=', () => testOp('!=', 25, not(eq(f('age'), 25))));
  it('<', () => testOp('<', 10, lt(f('age'), 10)));
  it('<=', () => testOp('<=', 10, lte(f('age'), 10)));
  it('>', () => testOp('>', 10, gt(f('age'), 10)));
  it('>=', () => testOp('>=', 10, gte(f('age'), 10)));

  it('null', () => testOp('null', null, isNull(f('age'))));
  it('notNull', () => testOp('notNull', null, not(isNull(f('age')))));

  it('contains', () => testOp('contains', 'foo', like(f('age'), '%foo%')));
  it('doesNotContain', () => testOp('doesNotContain', 'foo', not(like(f('age'), '%foo%'))));
  it('beginsWith', () => testOp('beginsWith', 'foo', like(f('age'), 'foo%')));
  it('doesNotBeginWith', () => testOp('doesNotBeginWith', 'foo', not(like(f('age'), 'foo%'))));
  it('endsWith', () => testOp('endsWith', 'foo', like(f('age'), '%foo')));
  it('doesNotEndWith', () => testOp('doesNotEndWith', 'foo', not(like(f('age'), '%foo'))));

  it('in', () => testOp('in', 'a,b,c', inArray(f('age'), ['a', 'b', 'c'])));
  it('notIn', () => testOp('notIn', 'a,b,c', not(inArray(f('age'), ['a', 'b', 'c']))));

  it('between', () => testOp('between', '1,10', and(gte(f('age'), 1), lte(f('age'), 10))));
  it('notBetween', () =>
    testOp('notBetween', '1,10', not(and(gte(f('age'), 1), lte(f('age'), 10)))));

  it('between swaps when second < first', () =>
    testOp('between', '10,1', and(gte(f('age'), 1), lte(f('age'), 10))));

  it('between with insufficient values returns fallback', () => {
    expect(
      fq({ combinator: 'and', rules: [{ field: 'age', operator: 'between', value: '1' }] })
    ).toBe(tanStackDbFallbackExpression);
  });
});
// oxlint-enable jest/expect-expect

describe('combinators', () => {
  it('single rule: no wrapper', () => {
    expect(fq({ combinator: 'and', rules: [{ field: 'x', operator: '=', value: 1 }] })).toEqual(
      eq(f('x'), 1)
    );
  });

  it('and combinator', () => {
    expect(
      fq({
        combinator: 'and',
        rules: [
          { field: 'x', operator: '=', value: 1 },
          { field: 'y', operator: '=', value: 2 },
        ],
      })
    ).toEqual(and(eq(f('x'), 1), eq(f('y'), 2)));
  });

  it('or combinator', () => {
    expect(
      fq({
        combinator: 'or',
        rules: [
          { field: 'x', operator: '=', value: 1 },
          { field: 'y', operator: '=', value: 2 },
        ],
      })
    ).toEqual(or(eq(f('x'), 1), eq(f('y'), 2)));
  });

  it('3+ rules uses variadic and', () => {
    expect(
      fq({
        combinator: 'and',
        rules: [
          { field: 'a', operator: '=', value: 1 },
          { field: 'b', operator: '=', value: 2 },
          { field: 'c', operator: '=', value: 3 },
        ],
      })
    ).toEqual(and(eq(f('a'), 1), eq(f('b'), 2), eq(f('c'), 3)));
  });
});

describe('negation (not)', () => {
  it('negated group', () => {
    expect(
      fq({ combinator: 'and', not: true, rules: [{ field: 'x', operator: '=', value: 1 }] })
    ).toEqual(not(eq(f('x'), 1)));
  });

  it('negated group with multiple rules', () => {
    expect(
      fq({
        combinator: 'or',
        not: true,
        rules: [
          { field: 'x', operator: '=', value: 1 },
          { field: 'y', operator: '=', value: 2 },
        ],
      })
    ).toEqual(not(or(eq(f('x'), 1), eq(f('y'), 2))));
  });
});

describe('nested groups', () => {
  it('nested subgroup', () => {
    expect(
      fq({
        combinator: 'and',
        rules: [
          { field: 'x', operator: '=', value: 1 },
          {
            combinator: 'or',
            rules: [
              { field: 'y', operator: '=', value: 2 },
              { field: 'z', operator: '=', value: 3 },
            ],
          },
        ],
      })
    ).toEqual(and(eq(f('x'), 1), or(eq(f('y'), 2), eq(f('z'), 3))));
  });
});

describe('valueSource: field', () => {
  it('resolves value as field ref', () => {
    expect(
      fq({
        combinator: 'and',
        rules: [{ field: 'startDate', operator: '>', value: 'endDate', valueSource: 'field' }],
      })
    ).toEqual(gt(f('startDate'), f('endDate')));
  });

  it('in with field values', () => {
    expect(
      fq({
        combinator: 'and',
        rules: [{ field: 'status', operator: 'in', value: 'a,b', valueSource: 'field' }],
      })
    ).toEqual(inArray(f('status'), [f('a'), f('b')]));
  });

  it('between with field values', () => {
    expect(
      fq({
        combinator: 'and',
        rules: [
          { field: 'score', operator: 'between', value: 'minScore,maxScore', valueSource: 'field' },
        ],
      })
    ).toEqual(and(gte(f('score'), f('minScore')), lte(f('score'), f('maxScore'))));
  });
});

describe('validation', () => {
  it('skips rules with placeholder field', () => {
    expect(
      fq({
        combinator: 'and',
        rules: [
          { field: '~', operator: '=', value: 'x' },
          { field: 'name', operator: '=', value: 'y' },
        ],
      })
    ).toEqual(eq(f('name'), 'y'));
  });

  it('skips rules with placeholder operator', () => {
    expect(
      fq({
        combinator: 'and',
        rules: [
          { field: 'name', operator: '~', value: 'x' },
          { field: 'name', operator: '=', value: 'y' },
        ],
      })
    ).toEqual(eq(f('name'), 'y'));
  });

  it('invalidated subgroups are excluded', () => {
    expect(
      fq(
        {
          id: 'outer',
          combinator: 'and',
          rules: [
            { field: 'x', operator: '=', value: 1 },
            { id: 'bad', combinator: 'or', rules: [{ field: 'y', operator: '=', value: 2 }] },
          ],
        },
        {
          format: 'tanstack_db',
          context: baseContext,
          validator: () => ({ bad: { valid: false } }),
        }
      )
    ).toEqual(eq(f('x'), 1));
  });

  describe('shared validation test data', () => {
    for (const vtd of getValidationTestData('tanstack_db')) {
      it(vtd.title, () => {
        const where = formatQuery(vtd.query, {
          ...(vtd.options as { format: 'tanstack_db' }),
          context: baseContext,
        }) as unknown as ((refs: unknown) => unknown) | undefined;
        // oxlint-disable jest/no-conditional-expect
        if (typeof where === 'function') {
          const result = where(mockRefs);
          // When validator returns false at top level, formatQuery returns undefined
          // (not a function), so if we're here, we have a function that was called.
          // Invalid rules/groups are filtered; result is either fallback or partial output.
          expect(result).toBeDefined();
        } else {
          // Top-level validation failure: formatQuery returns undefined
          expect(where).toBeUndefined();
        }
        // oxlint-enable jest/no-conditional-expect
      });
    }
  });
});

describe('independent combinators', () => {
  it('handles IC format', () => {
    const q: RuleGroupTypeIC = {
      rules: [
        { field: 'x', operator: '=', value: 1 },
        'and',
        { field: 'y', operator: '=', value: 2 },
      ],
    };
    expect(fq(q)).toEqual(and(eq(f('x'), 1), eq(f('y'), 2)));
  });

  it('handles mixed IC combinators', () => {
    // IC with mixed combinators converts to nested structure
    const q: RuleGroupTypeIC = {
      rules: [
        { field: 'a', operator: '=', value: 1 },
        'and',
        { field: 'b', operator: '=', value: 2 },
        'or',
        { field: 'c', operator: '=', value: 3 },
      ],
    };
    const result = fq(q);
    // convertFromIC groups by combinator changes: (a AND b) OR c
    expect(result).toEqual(or(and(eq(f('a'), 1), eq(f('b'), 2)), eq(f('c'), 3)));
  });
});

describe('defaultRuleProcessorTanStackDB', () => {
  it('returns undefined without context', () => {
    const rule: RuleType = { field: 'x', operator: '=', value: 1 };
    expect(defaultRuleProcessorTanStackDB(rule, undefined)).toBeUndefined();
    expect(defaultRuleProcessorTanStackDB(rule, {})).toBeUndefined();
    expect(defaultRuleProcessorTanStackDB(rule, { context: {} })).toBeUndefined();
  });

  it('returns undefined without ref', () => {
    const rule: RuleType = { field: 'x', operator: '=', value: 1 };
    expect(
      defaultRuleProcessorTanStackDB(rule, { context: { tanStackDbOperators: mockOps } })
    ).toBeUndefined();
  });
});

describe('multi-collection (Phase 2)', () => {
  const createMockRef2 = (name: string) =>
    new Proxy({}, { get: (_target, prop) => `${name}.${String(prop)}` });

  const multiRefs = { todo: createMockRef2('todo'), lists: createMockRef2('lists') };

  const fqMulti = (q: Parameters<typeof formatQuery>[0], ctx?: Record<string, unknown>) => {
    const where = formatQuery(q, {
      format: 'tanstack_db',
      context: { tanStackDbOperators: mockOps, ...ctx },
    }) as unknown as ((refs: unknown) => unknown) | undefined;
    return typeof where === 'function' ? where(multiRefs) : where;
  };

  describe('dotted field resolution', () => {
    it('resolves dotted field to correct ref', () => {
      expect(
        fqMulti({ combinator: 'and', rules: [{ field: 'todo.name', operator: '=', value: 'x' }] })
      ).toEqual(eq('todo.name', 'x'));
    });

    it('resolves dotted field from second ref', () => {
      expect(
        fqMulti({
          combinator: 'and',
          rules: [{ field: 'lists.title', operator: '=', value: 'Work' }],
        })
      ).toEqual(eq('lists.title', 'Work'));
    });

    it('mixes dotted fields from different refs', () => {
      expect(
        fqMulti({
          combinator: 'and',
          rules: [
            { field: 'todo.completed', operator: '=', value: true },
            { field: 'lists.title', operator: '=', value: 'Home' },
          ],
        })
      ).toEqual(and(eq('todo.completed', true), eq('lists.title', 'Home')));
    });

    it('dotted valueSource: field resolves from correct ref', () => {
      expect(
        fqMulti({
          combinator: 'and',
          rules: [
            {
              field: 'todo.dueDate',
              operator: '>',
              value: 'lists.createdAt',
              valueSource: 'field',
            },
          ],
        })
      ).toEqual(gt('todo.dueDate', 'lists.createdAt'));
    });
  });

  describe('bare field resolution with sourcePriority', () => {
    it('bare field resolves to first ref (default priority)', () => {
      // Default priority is Object.keys(refs) order: todo, lists
      expect(
        fqMulti({ combinator: 'and', rules: [{ field: 'name', operator: '=', value: 'x' }] })
      ).toEqual(eq('todo.name', 'x'));
    });

    it('sourcePriority changes bare field resolution', () => {
      // With sourcePriority: ['lists', 'todo'], bare field resolves to lists ref
      expect(
        fqMulti(
          { combinator: 'and', rules: [{ field: 'name', operator: '=', value: 'x' }] },
          { sourcePriority: ['lists', 'todo'] }
        )
      ).toEqual(eq('lists.name', 'x'));
    });

    it('mixes bare and dotted fields', () => {
      expect(
        fqMulti(
          {
            combinator: 'and',
            rules: [
              { field: 'name', operator: '=', value: 'x' },
              { field: 'lists.title', operator: '=', value: 'y' },
            ],
          },
          { sourcePriority: ['todo', 'lists'] }
        )
      ).toEqual(and(eq('todo.name', 'x'), eq('lists.title', 'y')));
    });

    it('bare valueSource: field resolves via sourcePriority', () => {
      expect(
        fqMulti(
          {
            combinator: 'and',
            rules: [{ field: 'startDate', operator: '>', value: 'endDate', valueSource: 'field' }],
          },
          { sourcePriority: ['lists', 'todo'] }
        )
      ).toEqual(gt('lists.startDate', 'lists.endDate'));
    });
  });
});
