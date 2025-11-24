/**
 * The sole purpose of this file is to maintain 100% test coverage. It does
 * _not_ test the correctness of the format. For "correctness" tests, see
 * the `dbquery.*` test files.
 */

import type { Column } from 'drizzle-orm';
import type { RuleGroupType } from '../../../types';
import { defaultRuleProcessorDrizzle } from '../defaultRuleProcessorDrizzle';
import { formatQuery } from '../formatQuery';
import {
  getValidationTestData,
  query,
  queryAllOperatorsRandomCase,
  queryForPreserveValueOrder,
  queryIC,
  queryWithMatchModes,
  queryWithValueSourceField,
} from '../formatQueryTestUtils';

const operatorStub = (...x: unknown[]) => x;
function sqlStub(...x: unknown[]) {
  return x;
}
sqlStub.raw = () => 'raw sql';

// oxlint-disable-next-line typescript/no-explicit-any
const drizzleOperators: any = {
  and: operatorStub,
  between: operatorStub,
  eq: operatorStub,
  exists: operatorStub,
  gt: operatorStub,
  gte: operatorStub,
  ilike: operatorStub,
  inArray: operatorStub,
  isNull: operatorStub,
  isNotNull: operatorStub,
  like: operatorStub,
  lt: operatorStub,
  lte: operatorStub,
  ne: operatorStub,
  not: operatorStub,
  notBetween: operatorStub,
  notExists: operatorStub,
  notLike: operatorStub,
  notIlike: operatorStub,
  notInArray: operatorStub,
  or: operatorStub,
  sql: sqlStub,
};

const fields = {
  f: { name: 'f', label: 'F' },
  f1: { name: 'f1', label: 'F1' },
  f2: { name: 'f2', label: 'F2' },
  f3: { name: 'f3', label: 'F3' },
  firstName: { name: 'firstName', label: 'First Name' },
  lastName: { name: 'lastName', label: 'Last Name' },
  age: { name: 'age', label: 'Age' },
  email: { name: 'email', label: 'Email' },
  gender: { name: 'gender', label: 'Gender' },
  job: { name: 'job', label: 'Job' },
  isLucky: { name: 'isLucky', label: 'Is Lucky' },
  isMusician: { name: 'isMusician', label: 'Is Musician' },
  fs: { name: 'fs', label: 'FS' },
} as unknown as Record<string, Column>;

it('covers Drizzle', () => {
  const whereVSV = formatQuery(query, 'drizzle');
  expect(typeof whereVSV).toBe('function');
  expect(whereVSV(fields, drizzleOperators)).toBeTruthy();

  const whereIC = formatQuery(queryIC, 'drizzle');
  expect(typeof whereIC).toBe('function');
  expect(whereIC(fields, drizzleOperators)).toBeTruthy();

  const whereVSF = formatQuery(queryWithValueSourceField, 'drizzle');
  expect(typeof whereVSF).toBe('function');
  expect(whereVSF(fields, drizzleOperators)).toBeTruthy();
});

it('handles operator case variations', () => {
  expect(
    formatQuery(queryAllOperatorsRandomCase, 'drizzle')(fields, drizzleOperators)
  ).toBeTruthy();
});

it('handles nested arrays', () => {
  expect(
    formatQuery(queryWithMatchModes, { format: 'drizzle', preset: 'postgresql' })(
      fields,
      drizzleOperators
    )
  ).toBeTruthy();
  expect(
    formatQuery(queryWithMatchModes, { format: 'drizzle' })(fields, drizzleOperators)
  ).not.toBeTruthy();
});

it('bails on invalid operator', () => {
  expect(
    formatQuery({ rules: [{ field: 'f', operator: 'invalid', value: 'v' }] }, 'drizzle')(
      fields,
      drizzleOperators
    )
  ).toBeUndefined();
});

it('bails when either columns or drizzle operators are not found', () => {
  expect(formatQuery(query, 'drizzle')({}, drizzleOperators)).toBeUndefined();
  // oxlint-disable-next-line typescript/no-explicit-any
  expect(formatQuery(query, 'drizzle')(fields, null as any)).toBeUndefined();
  expect(
    defaultRuleProcessorDrizzle(
      { field: 'f', operator: 'invalid', value: 'v' },
      { context: { columns: {}, drizzleOperators } }
    )
  ).toBeUndefined();
  expect(
    defaultRuleProcessorDrizzle(
      { field: 'f', operator: 'invalid', value: 'v' },
      { context: { columns: fields } }
    )
  ).toBeUndefined();
});

describe('validation', () => {
  // Commented out because we don't need to track them individually. They're all `undefined`.
  // const validationResults: Record<string, unknown> = {
  //   'should invalidate drizzle': undefined,
  //   'should invalidate drizzle even if fields are valid': undefined,
  //   'should invalidate drizzle rule by validator function': undefined,
  //   'should invalidate drizzle rule specified by validationMap': undefined,
  //   'should invalidate drizzle outermost group': undefined,
  //   'should invalidate drizzle inner group': undefined,
  //   'should convert drizzle inner group with no rules to fallbackExpression': undefined,
  //   'should invalidate drizzle following combinator of first rule': undefined,
  //   'should invalidate drizzle preceding combinator of non-first rule': undefined,
  // };

  for (const vtd of getValidationTestData('drizzle')) {
    it(vtd.title, () => {
      const where = formatQuery(vtd.query, vtd.options as { format: 'drizzle' });
      // oxlint-disable no-conditional-expect
      if (typeof where === 'function') {
        // if (validationResults[vtd.title]) {
        //   expect(where(fields, drizzleOperators)).toBeTruthy();
        // } else {
        expect(where(fields, drizzleOperators)).toBeUndefined();
        // }
      } else {
        expect(where).toBeUndefined();
      }
      // oxlint-enable no-conditional-expect
    });
  }
});

it('preserveValueOrder', () => {
  expect(
    formatQuery(queryForPreserveValueOrder, { format: 'drizzle', parseNumbers: true })(
      fields,
      drizzleOperators
    )
  ).toBeTruthy();
  expect(
    formatQuery(queryForPreserveValueOrder, {
      format: 'drizzle',
      parseNumbers: true,
      preserveValueOrder: true,
    })(fields, drizzleOperators)
  ).toBeTruthy();
});

it('parseNumbers with between operators', () => {
  const betweenQuery: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 'age', operator: 'between', value: '22,34' },
      { field: 'age', operator: 'notBetween', value: ['10', '20'] },
    ],
  };

  // Default behavior (backwards compatibility) - should parse numbers
  expect(formatQuery(betweenQuery, { format: 'drizzle' })(fields, drizzleOperators)).toBeTruthy();

  // Explicit parseNumbers: true - should parse numbers
  expect(
    formatQuery(betweenQuery, { format: 'drizzle', parseNumbers: true })(fields, drizzleOperators)
  ).toBeTruthy();

  // parseNumbers: false - should NOT parse numbers (keep as strings)
  expect(
    formatQuery(betweenQuery, { format: 'drizzle', parseNumbers: false })(fields, drizzleOperators)
  ).toBeTruthy();
});
