/* @jest-environment node */

/**
 * The sole purpose of this file is to maintain 100% test coverage. It does
 * _not_ test the correctness of the format. For "correctness" tests, see
 * the `dbquery.*` test files.
 */

import { col, fn, Op } from 'sequelize';
import { defaultRuleProcessorSequelize } from '../defaultRuleProcessorSequelize';
import { formatQuery } from '../formatQuery';
import {
  getValidationTestData,
  query,
  queryAllOperatorsRandomCase,
  queryForNumberParsing,
  queryForPreserveValueOrder,
  queryIC,
  queryWithValueSourceField,
} from '../formatQueryTestUtils';

const contextWithAllReqs = {
  sequelizeOperators: Op,
  sequelizeCol: col,
  sequelizeFn: fn,
};

it('covers Sequelize', () => {
  const whereVSV = formatQuery(query, {
    format: 'sequelize',
    context: contextWithAllReqs,
  });
  expect(whereVSV).toBeTruthy();

  const whereIC = formatQuery(queryIC, {
    format: 'sequelize',
    context: contextWithAllReqs,
  });
  expect(whereIC).toBeTruthy();

  const whereVSF = formatQuery(queryWithValueSourceField, {
    format: 'sequelize',
    context: contextWithAllReqs,
  });
  expect(whereVSF).toBeTruthy();

  expect(
    formatQuery(
      {
        not: true,
        rules: [
          { field: 'f', operator: '=', value: 'v' },
          'and',
          { id: 'sub', rules: [{ field: 'f', operator: '=', value: 'v' }] },
        ],
      },
      {
        format: 'sequelize',
        context: contextWithAllReqs,
        validator: () => ({ sub: false }),
      }
    )
  ).toBeTruthy();

  expect(
    formatQuery(
      { rules: [{ field: 'f', operator: '=', value: { rules: [] }, match: { mode: 'all' } }] },
      { format: 'sequelize', context: contextWithAllReqs }
    )
  ).toBeUndefined();
});

it('handles operator case variations', () => {
  expect(
    formatQuery(queryAllOperatorsRandomCase, {
      format: 'sequelize',
      context: contextWithAllReqs,
    })
  ).toBeTruthy();
});

it('bails on invalid operator', () => {
  expect(
    formatQuery(
      { rules: [{ field: 'f', operator: 'invalid', value: 'v' }] },
      {
        format: 'sequelize',
        context: {
          sequelizeOperators: Op,
          sequelizeCol: col,
          sequelizeFn: fn,
        },
      }
    )
  ).toBeUndefined();
});

it('bails when any required context properties are not found', () => {
  expect(
    formatQuery(query, {
      format: 'sequelize',
      context: {
        // sequelizeOperators: Op,
        sequelizeCol: col,
        sequelizeFn: fn,
      },
    })
  ).toBeUndefined();
  expect(
    defaultRuleProcessorSequelize(
      { field: 'f', operator: '=', value: 'v' },
      {
        context: {
          // sequelizeOperators: Op,
          sequelizeCol: col,
          sequelizeFn: fn,
        },
      }
    )
  ).toBeUndefined();
  expect(
    defaultRuleProcessorSequelize(
      { field: 'f', operator: '=', value: 'v', valueSource: 'field' },
      {
        context: {
          sequelizeOperators: Op,
          // sequelizeCol: col,
          sequelizeFn: fn,
        },
      }
    )
  ).toBeUndefined();
  expect(
    defaultRuleProcessorSequelize(
      { field: 'f', operator: 'doesNotContain', value: 'v', valueSource: 'field' },
      {
        context: {
          sequelizeOperators: Op,
          sequelizeCol: col,
          // sequelizeFn: fn,
        },
      }
    )
  ).toBeUndefined();
});

describe('validation', () => {
  const validationResults: Record<string, unknown> = {
    'should invalidate sequelize': undefined,
    'should invalidate sequelize even if fields are valid': undefined,
    'should invalidate sequelize rule by validator function': {},
    'should invalidate sequelize rule specified by validationMap': {},
    'should invalidate sequelize outermost group': undefined,
    'should invalidate sequelize inner group': undefined,
    'should convert sequelize inner group with no rules to fallbackExpression': {},
    'should invalidate sequelize following combinator of first rule': {},
    'should invalidate sequelize preceding combinator of non-first rule': {},
  };

  for (const vtd of getValidationTestData('sequelize')) {
    it(vtd.title, () => {
      const where = formatQuery(vtd.query, {
        ...vtd.options,
        format: 'sequelize',
        context: contextWithAllReqs,
      });
      // oxlint-disable no-conditional-expect
      if (validationResults[vtd.title]) {
        expect(where).toBeTruthy();
      } else {
        expect(where).toBeUndefined();
      }
      // oxlint-enable no-conditional-expect
    });
  }
});

it('preserveValueOrder', () => {
  expect(
    formatQuery(queryForPreserveValueOrder, {
      format: 'sequelize',
      parseNumbers: true,
      context: contextWithAllReqs,
    })
  ).toBeTruthy();
});

it('parseNumbers', () => {
  expect(
    formatQuery(queryForNumberParsing, {
      format: 'sequelize',
      parseNumbers: true,
      context: contextWithAllReqs,
    })
  ).toBeTruthy();
});
