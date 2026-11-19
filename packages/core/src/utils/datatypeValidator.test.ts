import type {
  Field,
  RuleGroupType,
  RuleGroupTypeIC,
  ValidationMap,
  ValidationResult,
} from '../types';
import { datatypeOperatorValidator, datatypeRuleValidator } from './datatypeValidator';
import { formatQuery } from './formatQuery';
import { toFullOption } from './optGroupUtils';

const fields: Field[] = [
  { name: 'age', label: 'Age', datatype: 'int' },
  { name: 'big', label: 'Big', datatype: 'bigint' },
  { name: 'name', label: 'Name', datatype: 'varchar' },
  { name: 'active', label: 'Active', datatype: 'boolean' },
  { name: 'born', label: 'Born', datatype: 'date' },
  { name: 't', label: 'T', datatype: 'time' },
  { name: 'mixed', label: 'Mixed', datatype: 'bool|int' },
  { name: 'nohint', label: 'No hint' },
];

const mismatch = (datatype: string, operator: string) => ({
  valid: false,
  reasons: [{ code: 'datatype-operator-mismatch', datatype, operator }],
});

describe('datatypeOperatorValidator', () => {
  it('validates operators, incl. nested and IC groups', () => {
    const query: RuleGroupTypeIC = {
      id: 'root',
      rules: [
        { id: 'r1', field: 'age', operator: 'contains', value: '1' },
        'and',
        { id: 'r2', field: 'name', operator: 'contains', value: 'x' },
        'or',
        {
          id: 'g1',
          rules: [
            { id: 'r3', field: 'active', operator: '<', value: true },
            'and',
            { id: 'r4', field: 'unknownField', operator: '<', value: 1 },
            'and',
            { id: 'r5', field: 'nohint', operator: '<', value: 1 },
            'and',
            { id: 'r6', field: 'age', operator: 'custom', value: 1 },
            'and',
            { field: 'age', operator: 'contains', value: 1 },
          ],
        },
      ],
    };
    expect(datatypeOperatorValidator({ fields })(query)).toEqual({
      r1: mismatch('int', 'contains'),
      r2: true,
      r3: mismatch('boolean', '<'),
      r5: true,
      r6: true,
    });
    expect(
      (datatypeOperatorValidator({ fields, dropUnknownOperators: true })(query) as ValidationMap).r6
    ).toEqual(mismatch('int', 'custom'));
  });

  it('stores `__proto__` rule ids as own entries', () => {
    const v = datatypeOperatorValidator({ fields });
    const rule = (operator: string) => ({ id: '__proto__', field: 'age', operator, value: 1 });
    const valid = v({ combinator: 'and', rules: [rule('=')] }) as ValidationMap;
    expect(Object.hasOwn(valid, '__proto__')).toBe(true);
    expect(valid['__proto__']).toBe(true);
    const invalid = v({ combinator: 'and', rules: [rule('contains')] }) as ValidationMap;
    expect(Object.hasOwn(invalid, '__proto__')).toBe(true);
    expect(invalid['__proto__']).toEqual(mismatch('int', 'contains'));
  });

  it('works with formatQuery', () => {
    const query: RuleGroupType = {
      combinator: 'and',
      rules: [
        { id: 'r1', field: 'age', operator: 'contains', value: '1' },
        { id: 'r2', field: 'age', operator: '>', value: 1 },
      ],
    };
    expect(
      formatQuery(query, {
        format: 'sql',
        parseNumbers: true,
        validator: datatypeOperatorValidator({ fields }),
      })
    ).toBe('(age > 1)');
  });
});

describe('datatypeRuleValidator checkValues', () => {
  const v = (field: string, operator: string, value: unknown, valueSource?: 'field') =>
    datatypeRuleValidator(toFullOption(fields.find(f => f.name === field)!) as never, {
      checkValues: true,
    })({ field, operator, value, valueSource });

  it.each([
    ['age', '=', 1, true],
    ['age', '=', '1.5', true],
    ['age', '=', 1n, true],
    ['age', '=', 'abc', false],
    ['age', '=', '', false],
    ['age', '=', Infinity, false],
    ['age', 'between', '1,2', true],
    ['age', 'between', [1, 'x'], false],
    ['age', 'in', [], false],
    ['big', '=', 1n, true],
    ['big', '=', 3, true],
    ['big', '=', 3.5, false],
    ['big', '=', ' 12345678901234567890 ', true],
    ['big', '=', '1e3', false],
    ['big', '=', null, false],
    ['active', '=', true, true],
    ['active', '=', 'FALSE', true],
    ['active', '=', 'yes', false],
    ['born', '=', '2020-01-01', true],
    ['born', '=', new Date(), true],
    ['born', '=', new Date('x'), false],
    ['born', '=', 0, true],
    ['born', '=', 'nope', false],
    ['born', '=', '', false],
    ['t', '=', '12:30', true],
    ['t', '=', '12:30:15.5', true],
    ['t', '=', new Date(), true],
    ['t', '=', 'noon', false],
    ['t', '=', '99:99:99', false],
    ['t', '=', '24:00', false],
    ['t', '=', '23:59:59', true],
    ['t', '=', '12:60', false],
    ['name', '=', 'anything', true],
    ['mixed', 'in', 'true,5', true],
    ['mixed', '=', 'x', false],
    ['age', '=', 'abc', true, 'field'],
    ['age', 'null', null, true],
  ] as const)('%s %s %p → %p', (...row) => {
    // rest param: keeps fn.length 0 so bun doesn't treat 5th arg as `done`
    const [field, op, value, expected, vs] = row as unknown as [
      string,
      string,
      unknown,
      boolean,
      'field'?,
    ];
    const result = v(field, op, value, vs);
    expect(result === true || (result as ValidationResult).reasons?.[0].code).toBe(
      expected || 'datatype-value-mismatch'
    );
  });

  it('does not check values by default', () => {
    expect(
      datatypeRuleValidator(toFullOption(fields[0]) as never)({
        field: 'age',
        operator: '=',
        value: 'abc',
      })
    ).toBe(true);
  });

  it('skips parameter values and fields without category', () => {
    expect(
      datatypeRuleValidator(toFullOption(fields[0]) as never, { checkValues: true })({
        field: 'age',
        operator: '=',
        value: 'abc',
        valueSource: 'parameter',
      })
    ).toBe(true);
    expect(
      datatypeRuleValidator(toFullOption(fields[7]) as never, { checkValues: true })({
        field: 'nohint',
        operator: 'contains',
        value: 'abc',
      })
    ).toBe(true);
  });

  it('reports category when datatype absent', () => {
    expect(
      datatypeRuleValidator(
        toFullOption({ name: 'b', label: 'B', valueEditorType: 'checkbox' }) as never
      )({ field: 'b', operator: '<', value: true })
    ).toEqual(mismatch('boolean', '<'));
  });
});
