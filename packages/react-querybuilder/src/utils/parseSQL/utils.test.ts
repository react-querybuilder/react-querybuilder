import type { AndList, GenerateMixedAndXorOrListReturn, SQLExpression } from './types';
import { generateMixedAndXorOrList } from './utils';

const isNullExpr: SQLExpression = {
  type: 'IsNullBooleanPrimary',
  value: { type: 'Identifier', value: 'f1' },
  hasNot: null,
};
const isNotNullExpr: SQLExpression = {
  type: 'IsNullBooleanPrimary',
  value: { type: 'Identifier', value: 'f1' },
  hasNot: 'NOT',
};

it('simple AND operator', () => {
  const expectation: GenerateMixedAndXorOrListReturn = [isNullExpr, isNullExpr];
  expectation.combinator = 'and';
  expect(
    generateMixedAndXorOrList({
      type: 'AndExpression',
      operator: 'AND',
      left: isNullExpr,
      right: isNullExpr,
    })
  ).toEqual(expectation);
});

it('simple XOR operator', () => {
  const expectation: GenerateMixedAndXorOrListReturn = [isNullExpr, isNullExpr];
  expectation.combinator = 'xor';
  expect(
    generateMixedAndXorOrList({
      type: 'XorExpression',
      operator: 'XOR',
      left: isNullExpr,
      right: isNullExpr,
    })
  ).toEqual(expectation);
});

it('simple OR operator', () => {
  const expectation: GenerateMixedAndXorOrListReturn = [isNullExpr, isNullExpr];
  expectation.combinator = 'or';
  expect(
    generateMixedAndXorOrList({
      type: 'OrExpression',
      operator: 'OR',
      left: isNullExpr,
      right: isNullExpr,
    })
  ).toEqual(expectation);
});

it('chained AND operators', () => {
  const expectation: GenerateMixedAndXorOrListReturn = [isNullExpr, isNullExpr, isNullExpr];
  expectation.combinator = 'and';
  expect(
    generateMixedAndXorOrList({
      type: 'AndExpression',
      operator: 'AND',
      left: {
        type: 'AndExpression',
        operator: 'AND',
        left: isNullExpr,
        right: isNullExpr,
      },
      right: isNullExpr,
    })
  ).toEqual(expectation);
});

it('chained XOR operators', () => {
  const expectation: GenerateMixedAndXorOrListReturn = [isNullExpr, isNullExpr, isNullExpr];
  expectation.combinator = 'xor';
  expect(
    generateMixedAndXorOrList({
      type: 'XorExpression',
      operator: 'XOR',
      left: {
        type: 'XorExpression',
        operator: 'XOR',
        left: isNullExpr,
        right: isNullExpr,
      },
      right: isNullExpr,
    })
  ).toEqual(expectation);
});

it('chained OR operators', () => {
  const expectation: GenerateMixedAndXorOrListReturn = [isNullExpr, isNullExpr, isNullExpr];
  expectation.combinator = 'or';
  expect(
    generateMixedAndXorOrList({
      type: 'OrExpression',
      operator: 'OR',
      left: {
        type: 'OrExpression',
        operator: 'OR',
        left: isNullExpr,
        right: isNullExpr,
      },
      right: isNullExpr,
    })
  ).toEqual(expectation);
});

describe('complex AND/XOR/OR chains', () => {
  it('a AND b OR c', () => {
    const expectation: GenerateMixedAndXorOrListReturn = [[isNullExpr, isNullExpr], isNotNullExpr];
    (expectation[0] as AndList).combinator = 'and';
    expectation.combinator = 'or';
    const testResult = generateMixedAndXorOrList({
      type: 'OrExpression',
      operator: 'OR',
      left: {
        type: 'AndExpression',
        operator: 'AND',
        left: isNullExpr,
        right: isNullExpr,
      },
      right: isNotNullExpr,
    });
    expect(testResult).toEqual(expectation);
  });

  it('a OR b AND c', () => {
    const expectation: GenerateMixedAndXorOrListReturn = [
      isNotNullExpr,
      [isNullExpr, isNotNullExpr],
    ];
    (expectation[1] as AndList).combinator = 'and';
    expectation.combinator = 'or';
    const testResult = generateMixedAndXorOrList({
      type: 'AndExpression',
      operator: 'AND',
      left: {
        type: 'OrExpression',
        operator: 'OR',
        left: isNotNullExpr,
        right: isNullExpr,
      },
      right: isNotNullExpr,
    });
    expect(testResult).toEqual(expectation);
  });
});
