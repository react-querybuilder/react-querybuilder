import type { MixedAndXorOrList, SQLExpression } from './types';
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
const isNullExpr2: SQLExpression = {
  type: 'IsNullBooleanPrimary',
  value: { type: 'Identifier', value: 'f2' },
  hasNot: null,
};
const isNotNullExpr2: SQLExpression = {
  type: 'IsNullBooleanPrimary',
  value: { type: 'Identifier', value: 'f2' },
  hasNot: 'NOT',
};

it('simple AND operator', () => {
  const expectation: MixedAndXorOrList = {
    combinator: 'and',
    expressions: [isNullExpr, isNullExpr],
  };
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
  const expectation: MixedAndXorOrList = {
    combinator: 'xor',
    expressions: [isNullExpr, isNullExpr],
  };
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
  const expectation: MixedAndXorOrList = {
    combinator: 'or',
    expressions: [isNullExpr, isNullExpr],
  };
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
  const expectation: MixedAndXorOrList = {
    combinator: 'and',
    expressions: [isNullExpr, isNullExpr, isNullExpr, isNullExpr],
  };
  expect(
    generateMixedAndXorOrList({
      type: 'AndExpression',
      operator: 'AND',
      left: {
        type: 'AndExpression',
        operator: 'AND',
        left: {
          type: 'AndExpression',
          operator: 'AND',
          left: isNullExpr,
          right: isNullExpr,
        },
        right: isNullExpr,
      },
      right: isNullExpr,
    })
  ).toEqual(expectation);
});

it('chained XOR operators', () => {
  const expectation: MixedAndXorOrList = {
    combinator: 'xor',
    expressions: [isNullExpr, isNullExpr, isNullExpr, isNullExpr],
  };
  expect(
    generateMixedAndXorOrList({
      type: 'XorExpression',
      operator: 'XOR',
      left: {
        type: 'XorExpression',
        operator: 'XOR',
        left: {
          type: 'XorExpression',
          operator: 'XOR',
          left: isNullExpr,
          right: isNullExpr,
        },
        right: isNullExpr,
      },
      right: isNullExpr,
    })
  ).toEqual(expectation);
});

it('chained OR operators', () => {
  const expectation: MixedAndXorOrList = {
    combinator: 'or',
    expressions: [isNullExpr, isNullExpr, isNullExpr, isNullExpr],
  };
  expect(
    generateMixedAndXorOrList({
      type: 'OrExpression',
      operator: 'OR',
      left: {
        type: 'OrExpression',
        operator: 'OR',
        left: {
          type: 'OrExpression',
          operator: 'OR',
          left: isNullExpr,
          right: isNullExpr,
        },
        right: isNullExpr,
      },
      right: isNullExpr,
    })
  ).toEqual(expectation);
});

describe('complex AND/XOR/OR chains', () => {
  it('a AND b OR c', () => {
    const expectation: MixedAndXorOrList = {
      combinator: 'or',
      expressions: [{ combinator: 'and', expressions: [isNullExpr, isNullExpr] }, isNotNullExpr],
    };
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
    const expectation: MixedAndXorOrList = {
      combinator: 'or',
      expressions: [isNotNullExpr, { combinator: 'and', expressions: [isNullExpr, isNotNullExpr] }],
    };
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

  it('a AND b XOR c OR d', () => {
    const expectation: MixedAndXorOrList = {
      combinator: 'or',
      expressions: [
        {
          combinator: 'xor',
          expressions: [
            { combinator: 'and', expressions: [isNullExpr, isNotNullExpr] },
            isNullExpr,
          ],
        },
        isNotNullExpr,
      ],
    };
    expect(
      generateMixedAndXorOrList({
        type: 'OrExpression',
        operator: 'OR',
        left: {
          type: 'XorExpression',
          operator: 'XOR',
          left: {
            type: 'AndExpression',
            operator: 'AND',
            left: isNullExpr,
            right: isNotNullExpr,
          },
          right: isNullExpr,
        },
        right: isNotNullExpr,
      })
    ).toEqual(expectation);
  });

  it('a OR b XOR c AND d', () => {
    const expectation: MixedAndXorOrList = {
      combinator: 'or',
      expressions: [
        isNotNullExpr,
        {
          combinator: 'xor',
          expressions: [
            isNullExpr,
            { combinator: 'and', expressions: [isNotNullExpr, isNullExpr] },
          ],
        },
      ],
    };
    expect(
      generateMixedAndXorOrList({
        type: 'AndExpression',
        operator: 'AND',
        left: {
          type: 'XorExpression',
          operator: 'XOR',
          left: {
            type: 'OrExpression',
            operator: 'OR',
            left: isNotNullExpr,
            right: isNullExpr,
          },
          right: isNotNullExpr,
        },
        right: isNullExpr,
      })
    ).toEqual(expectation);
  });

  it('a AND b OR c XOR d', () => {
    const expectation: MixedAndXorOrList = {
      combinator: 'or',
      expressions: [
        { combinator: 'and', expressions: [isNullExpr, isNotNullExpr] },
        {
          combinator: 'xor',
          expressions: [isNullExpr2, isNotNullExpr2],
        },
      ],
    };
    const testResult = generateMixedAndXorOrList({
      type: 'XorExpression',
      operator: 'XOR',
      left: {
        type: 'OrExpression',
        operator: 'OR',
        left: {
          type: 'AndExpression',
          operator: 'AND',
          left: isNullExpr,
          right: isNotNullExpr,
        },
        right: isNullExpr2,
      },
      right: isNotNullExpr2,
    });
    expect(testResult).toEqual(expectation);
  });

  it('a AND b OR c OR d', () => {
    const expectation: MixedAndXorOrList = {
      combinator: 'or',
      expressions: [
        { combinator: 'and', expressions: [isNullExpr, isNotNullExpr] },
        isNullExpr2,
        isNotNullExpr2,
      ],
    };
    const testResult = generateMixedAndXorOrList({
      type: 'OrExpression',
      operator: 'OR',
      left: {
        type: 'OrExpression',
        operator: 'OR',
        left: {
          type: 'AndExpression',
          operator: 'AND',
          left: isNullExpr,
          right: isNotNullExpr,
        },
        right: isNullExpr2,
      },
      right: isNotNullExpr2,
    });
    expect(testResult).toEqual(expectation);
  });

  it('a AND b XOR c XOR d', () => {
    const expectation: MixedAndXorOrList = {
      combinator: 'xor',
      expressions: [
        { combinator: 'and', expressions: [isNullExpr, isNotNullExpr] },
        isNullExpr2,
        isNotNullExpr2,
      ],
    };
    const testResult = generateMixedAndXorOrList({
      type: 'XorExpression',
      operator: 'XOR',
      left: {
        type: 'XorExpression',
        operator: 'XOR',
        left: {
          type: 'AndExpression',
          operator: 'AND',
          left: isNullExpr,
          right: isNotNullExpr,
        },
        right: isNullExpr2,
      },
      right: isNotNullExpr2,
    });
    expect(testResult).toEqual(expectation);
  });

  it('a AND b OR c AND d', () => {
    const expectation: MixedAndXorOrList = {
      combinator: 'or',
      expressions: [
        { combinator: 'and', expressions: [isNullExpr, isNotNullExpr] },
        { combinator: 'and', expressions: [isNullExpr2, isNotNullExpr2] },
      ],
    };
    const testResult = generateMixedAndXorOrList({
      type: 'AndExpression',
      operator: 'AND',
      left: {
        type: 'OrExpression',
        operator: 'OR',
        left: {
          type: 'AndExpression',
          operator: 'AND',
          left: isNullExpr,
          right: isNotNullExpr,
        },
        right: isNullExpr2,
      },
      right: isNotNullExpr2,
    });
    expect(testResult).toEqual(expectation);
  });
});
