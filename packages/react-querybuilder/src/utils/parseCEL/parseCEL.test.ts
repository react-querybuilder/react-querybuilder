import type {
  DefaultCombinatorName,
  DefaultRuleGroupType,
  DefaultRuleGroupTypeIC,
  DefaultRuleType,
} from '../../types/index.noReact';
import { parseCEL } from './parseCEL';

const wrapRule = (
  rule?: DefaultRuleType | DefaultRuleType[],
  combinator: DefaultCombinatorName = 'and'
): DefaultRuleGroupType => ({
  combinator,
  rules: rule ? (Array.isArray(rule) ? rule : [rule]) : [],
});
// const wrapRuleIC = (rule?: DefaultRuleType): DefaultRuleGroupTypeIC => ({
//   rules: rule ? [rule] : [],
// });
const icOpts = { independentCombinators: true } as const;

const testParseCEL = (parseResult: DefaultRuleGroupType, expectedResult: DefaultRuleGroupType) => {
  expect(parseResult).toEqual(expectedResult);
};
const testParseCELic = (
  parseResult: DefaultRuleGroupTypeIC,
  expectedResult: DefaultRuleGroupTypeIC
) => {
  expect(parseResult).toEqual(expectedResult);
};

it('works for basic relations', () => {
  testParseCEL(parseCEL('f1 == "Test"'), wrapRule({ field: 'f1', operator: '=', value: 'Test' }));
  testParseCEL(parseCEL('(f1 == "Test")'), wrapRule({ field: 'f1', operator: '=', value: 'Test' }));
  testParseCEL(parseCEL('f1 != "Test"'), wrapRule({ field: 'f1', operator: '!=', value: 'Test' }));
  testParseCEL(parseCEL('f1 > 1'), wrapRule({ field: 'f1', operator: '>', value: 1 }));
  testParseCEL(parseCEL('f1 >= 1'), wrapRule({ field: 'f1', operator: '>=', value: 1 }));
  testParseCEL(parseCEL('f1 < 1'), wrapRule({ field: 'f1', operator: '<', value: 1 }));
  testParseCEL(parseCEL('f1 <= 1'), wrapRule({ field: 'f1', operator: '<=', value: 1 }));
  testParseCEL(parseCEL('f1 == null'), wrapRule({ field: 'f1', operator: 'null', value: null }));
  testParseCEL(parseCEL('f1 != null'), wrapRule({ field: 'f1', operator: 'notNull', value: null }));
  testParseCEL(parseCEL('f1 == true'), wrapRule({ field: 'f1', operator: '=', value: true }));
  testParseCEL(parseCEL('f1 == false'), wrapRule({ field: 'f1', operator: '=', value: false }));
});

it('handles "like" comparisons', () => {
  testParseCEL(
    parseCEL('f1.contains("Test")'),
    wrapRule({ field: 'f1', operator: 'contains', value: 'Test' })
  );
  testParseCEL(
    parseCEL('f1.startsWith("Test")'),
    wrapRule({ field: 'f1', operator: 'beginsWith', value: 'Test' })
  );
  testParseCEL(
    parseCEL('f1.endsWith("Test")'),
    wrapRule({ field: 'f1', operator: 'endsWith', value: 'Test' })
  );
  // TODO: fix handling of negations
  // testParseCEL(
  //   parseCEL('!f1.contains("Test")'),
  //   wrapRule({ field: 'f1', operator: 'doesNotContain', value: 'Test' })
  // );
  // testParseCEL(
  //   parseCEL('!f1.startsWith("Test")'),
  //   wrapRule({ field: 'f1', operator: 'doesNotBeginWith', value: 'Test' })
  // );
  // testParseCEL(
  //   parseCEL('!f1.endsWith("Test")'),
  //   wrapRule({ field: 'f1', operator: 'doesNotEndWith', value: 'Test' })
  // );
});

it('groups only when necessary', () => {
  testParseCEL(parseCEL('(f1 == "Test" || f2 == "Test2")'), {
    combinator: 'or',
    rules: [
      { field: 'f1', operator: '=', value: 'Test' },
      { field: 'f2', operator: '=', value: 'Test2' },
    ],
  });
});

it('handles parentheses', () => {
  testParseCEL(parseCEL('(f1 == "Test" || f2 == "Test2") && f3 == "Test3"'), {
    combinator: 'and',
    rules: [
      {
        combinator: 'or',
        rules: [
          { field: 'f1', operator: '=', value: 'Test' },
          { field: 'f2', operator: '=', value: 'Test2' },
        ],
      },
      { field: 'f3', operator: '=', value: 'Test3' },
    ],
  });
});

it('works for conditional and/or', () => {
  testParseCEL(
    parseCEL('f1 == "Test" && f2 == "Test2"'),
    wrapRule([
      { field: 'f1', operator: '=', value: 'Test' },
      { field: 'f2', operator: '=', value: 'Test2' },
    ])
  );
  testParseCEL(
    parseCEL('f1 == "Test" || f2 == "Test2"'),
    wrapRule(
      [
        { field: 'f1', operator: '=', value: 'Test' },
        { field: 'f2', operator: '=', value: 'Test2' },
      ],
      'or'
    )
  );
  testParseCEL(parseCEL('f1 == "Test" && f2 == "Test2" || f3 == "Test3"'), {
    combinator: 'or',
    rules: [
      {
        combinator: 'and',
        rules: [
          { field: 'f1', operator: '=', value: 'Test' },
          { field: 'f2', operator: '=', value: 'Test2' },
        ],
      },
      { field: 'f3', operator: '=', value: 'Test3' },
    ],
  });
});

it('handles independent combinators', () => {
  testParseCELic(parseCEL('f1 == "Test" && f2 == "Test2" || f3 == "Test3"', icOpts), {
    rules: [
      { field: 'f1', operator: '=', value: 'Test' },
      'and',
      { field: 'f2', operator: '=', value: 'Test2' },
      'or',
      { field: 'f3', operator: '=', value: 'Test3' },
    ],
  });
});

it('ignores things', () => {
  // testParseCEL(parseCEL('f1 == f2 ? f3 : f4'), wrapRule());
  testParseCEL(parseCEL('f1 == f2("")'), wrapRule());
  testParseCEL(parseCEL('true'), wrapRule());
});
