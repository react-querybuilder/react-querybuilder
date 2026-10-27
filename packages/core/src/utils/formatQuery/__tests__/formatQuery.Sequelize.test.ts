/* @vitest-environment node */

/**
 * The sole purpose of this file is to maintain 100% test coverage. It does
 * _not_ test the correctness of the format. For "correctness" tests, see
 * the `dbquery.*` test files.
 */

import { col, fn, Op } from 'sequelize';
import type { RuleType, SQLPreset } from '../../../types';
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

const contextWithAllReqs = { sequelizeOperators: Op, sequelizeCol: col, sequelizeFn: fn };

it('covers Sequelize', () => {
  const whereVSV = formatQuery(query, { format: 'sequelize', context: contextWithAllReqs });
  expect(whereVSV).toBeTruthy();

  const whereIC = formatQuery(queryIC, { format: 'sequelize', context: contextWithAllReqs });
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
      { format: 'sequelize', context: contextWithAllReqs, validator: () => ({ sub: false }) }
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
    formatQuery(queryAllOperatorsRandomCase, { format: 'sequelize', context: contextWithAllReqs })
  ).toBeTruthy();
});

it('bails on invalid operator', () => {
  expect(
    formatQuery(
      { rules: [{ field: 'f', operator: 'invalid', value: 'v' }] },
      {
        format: 'sequelize',
        context: { sequelizeOperators: Op, sequelizeCol: col, sequelizeFn: fn },
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
    'should omit invalid sequelize inner group among valid siblings': {},
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

it('handles regex operators', () => {
  const fq = (rules: RuleType[], preset?: SQLPreset) =>
    formatQuery(
      { combinator: 'and', rules },
      { format: 'sequelize', context: contextWithAllReqs, preset }
    );
  const regexRules: RuleType[] = [
    { field: 'f', operator: 'matches', value: 'a' },
    { field: 'f', operator: 'matches', value: 'b', regexFlags: 'gi' },
    { field: 'f', operator: 'doesNotMatch', value: 'c' },
    { field: 'f', operator: 'doesNotMatch', value: 'd', regexFlags: 'i' },
  ];
  expect(fq(regexRules, 'postgresql')).toEqual({
    [Op.and]: [
      { f: { [Op.regexp]: '(?p)a' } },
      { f: { [Op.iRegexp]: '(?p)b' } },
      { f: { [Op.notRegexp]: '(?p)c' } },
      { f: { [Op.notIRegexp]: '(?p)d' } },
    ],
  });
  // `iRegexp` ops are PostgreSQL-only; inline `(?i)` otherwise
  expect(fq(regexRules)).toEqual({
    [Op.and]: [
      { f: { [Op.regexp]: 'a' } },
      { f: { [Op.regexp]: '(?i)b' } },
      { f: { [Op.notRegexp]: 'c' } },
      { f: { [Op.notRegexp]: '(?i)d' } },
    ],
  });
  // `m`/`s` flags
  const msRules: RuleType[] = [
    { field: 'f', operator: 'matches', value: 'a', regexFlags: 'ims' },
    { field: 'f', operator: 'doesNotMatch', value: 'b', regexFlags: 'ms' },
  ];
  expect(fq(msRules, 'postgresql')).toEqual({
    [Op.and]: [{ f: { [Op.iRegexp]: '(?w)a' } }, { f: { [Op.notRegexp]: '(?w)b' } }],
  });
  for (const preset of [undefined, 'mysql', 'sqlite'] as const) {
    expect(fq(msRules, preset)).toEqual({
      [Op.and]: [{ f: { [Op.regexp]: '(?ims)a' } }, { f: { [Op.notRegexp]: '(?ms)b' } }],
    });
  }
  // Field value source falls back to `contains`
  expect(fq([{ field: 'f', operator: 'matches', value: 'g', valueSource: 'field' }])).toEqual(
    fq([{ field: 'f', operator: 'contains', value: 'g', valueSource: 'field' }])
  );
  // No `Op.regexp` support for these presets; fall back to `contains`
  for (const preset of ['ansi', 'mssql', 'oracle'] as const) {
    expect(fq([{ field: 'f', operator: 'doesNotMatch', value: 'g' }], preset)).toEqual(
      fq([{ field: 'f', operator: 'doesNotContain', value: 'g' }], preset)
    );
  }
});
