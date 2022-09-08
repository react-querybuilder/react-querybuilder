import type {
  DefaultRuleGroupType,
  DefaultRuleGroupTypeIC,
  DefaultRuleType,
  Field,
  OptionGroup,
  ValueSources,
} from '@react-querybuilder/ts/dist/types/src/index.noReact';
import { parseSQL } from '.';
import { isWildcardsOnly } from './utils';

const wrapRule = (rule?: DefaultRuleType): DefaultRuleGroupType => ({
  combinator: 'and',
  rules: rule ? [rule] : [],
});
const wrapRuleIC = (rule?: DefaultRuleType): DefaultRuleGroupTypeIC => ({
  rules: rule ? [rule] : [],
});
const icOpts = { independentCombinators: true } as const;

describe('ignored/missing WHERE clauses', () => {
  it('SELECT statement without WHERE clause', () => {
    expect(parseSQL('SELECT * FROM t')).toEqual(wrapRule());
  });

  it('SELECT statement with semicolon', () => {
    expect(parseSQL('SELECT * FROM t;')).toEqual(wrapRule());
  });

  it('SELECT statement with multiple fields and tables', () => {
    expect(parseSQL('SELECT t1.this, t2.that FROM t1 INNER JOIN t2 ON t1.this = t2.that;')).toEqual(
      wrapRule()
    );
  });

  it('invalid/complex clauses', () => {
    expect(parseSQL(`firstName = CASE x WHEN y THEN z ELSE a END`)).toEqual(wrapRule());
    expect(parseSQL(`firstName = someFunc('Steve', 'Vai')`)).toEqual(wrapRule());
    expect(parseSQL(`firstName IN (SELECT val FROM otherTable WHERE name = 'Steve')`)).toEqual(
      wrapRule()
    );
  });

  it('UNIONs', () => {
    expect(parseSQL(`SELECT * FROM t WHERE x = 1 UNION ALL SELECT * FROM u WHERE y = 2`)).toEqual(
      wrapRule()
    );
  });
});

describe('boolean operators', () => {
  it('basic comparisons of strings and numbers', () => {
    expect(parseSQL(`firstName = 'Steve'`)).toEqual(
      wrapRule({ field: 'firstName', operator: '=', value: 'Steve' })
    );
    expect(parseSQL(`firstName != 'Steve'`)).toEqual(
      wrapRule({ field: 'firstName', operator: '!=', value: 'Steve' })
    );
    expect(parseSQL(`firstName <> 'Steve'`)).toEqual(
      wrapRule({ field: 'firstName', operator: '!=', value: 'Steve' })
    );
    expect(parseSQL(`age >= 14`)).toEqual(wrapRule({ field: 'age', operator: '>=', value: 14 }));
    expect(parseSQL(`age > 14`)).toEqual(wrapRule({ field: 'age', operator: '>', value: 14 }));
    expect(parseSQL(`age <= 14`)).toEqual(wrapRule({ field: 'age', operator: '<=', value: 14 }));
    expect(parseSQL(`age < 14`)).toEqual(wrapRule({ field: 'age', operator: '<', value: 14 }));
  });

  it('reversed identifier and value, or operator needs normalizing', () => {
    expect(parseSQL(`'Steve' = firstName`)).toEqual(
      wrapRule({ field: 'firstName', operator: '=', value: 'Steve' })
    );
    expect(parseSQL(`21 <> age`)).toEqual(wrapRule({ field: 'age', operator: '!=', value: 21 }));
    expect(parseSQL(`21 < age`)).toEqual(wrapRule({ field: 'age', operator: '>', value: 21 }));
    expect(parseSQL(`21 <= age`)).toEqual(wrapRule({ field: 'age', operator: '>=', value: 21 }));
    expect(parseSQL(`21 > age`)).toEqual(wrapRule({ field: 'age', operator: '<', value: 21 }));
    expect(parseSQL(`21 >= age`)).toEqual(wrapRule({ field: 'age', operator: '<=', value: 21 }));
  });

  it('booleans', () => {
    expect(parseSQL(`isMusician = TRUE`)).toEqual(
      wrapRule({ field: 'isMusician', operator: '=', value: true })
    );
    expect(parseSQL(`isMusician = FALSE`)).toEqual(
      wrapRule({ field: 'isMusician', operator: '=', value: false })
    );
  });

  it('quoted field names', () => {
    expect(parseSQL('`isMusician` = TRUE')).toEqual(
      wrapRule({ field: 'isMusician', operator: '=', value: true })
    );
  });

  it('null/notNull', () => {
    expect(parseSQL(`firstName is null`)).toEqual(
      wrapRule({ field: 'firstName', operator: 'null', value: null })
    );
    expect(parseSQL(`firstName is not null`)).toEqual(
      wrapRule({ field: 'firstName', operator: 'notNull', value: null })
    );
  });

  it('in/notIn', () => {
    expect(parseSQL(`firstName IN ('Test', 12, true, lastName)`)).toEqual(
      wrapRule({ field: 'firstName', operator: 'in', value: 'Test, 12, true' })
    );
    expect(parseSQL(`firstName NOT IN ('Test', 12, true, lastName)`)).toEqual(
      wrapRule({
        field: 'firstName',
        operator: 'notIn',
        value: 'Test, 12, true',
      })
    );
  });

  it('like/not like', () => {
    expect(parseSQL(`firstName LIKE '%Steve%'`)).toEqual(
      wrapRule({ field: 'firstName', operator: 'contains', value: 'Steve' })
    );
    expect(parseSQL(`firstName LIKE 'Steve%'`)).toEqual(
      wrapRule({ field: 'firstName', operator: 'beginsWith', value: 'Steve' })
    );
    expect(parseSQL(`firstName LIKE '%Steve'`)).toEqual(
      wrapRule({ field: 'firstName', operator: 'endsWith', value: 'Steve' })
    );
    expect(parseSQL(`firstName NOT LIKE '%Steve%'`)).toEqual(
      wrapRule({
        field: 'firstName',
        operator: 'doesNotContain',
        value: 'Steve',
      })
    );
    expect(parseSQL(`firstName NOT LIKE 'Steve%'`)).toEqual(
      wrapRule({
        field: 'firstName',
        operator: 'doesNotBeginWith',
        value: 'Steve',
      })
    );
    expect(parseSQL(`firstName NOT LIKE '%Steve'`)).toEqual(
      wrapRule({
        field: 'firstName',
        operator: 'doesNotEndWith',
        value: 'Steve',
      })
    );
  });

  it('between/notBetween', () => {
    expect(parseSQL(`age BETWEEN 12 AND 14`)).toEqual(
      wrapRule({ field: 'age', operator: 'between', value: '12, 14' })
    );
    expect(parseSQL(`age NOT BETWEEN 12 AND 14`)).toEqual(
      wrapRule({ field: 'age', operator: 'notBetween', value: '12, 14' })
    );
  });
});

describe('options', () => {
  it('params as array', () => {
    expect(parseSQL(`firstName = ?`, { params: ['Steve'] })).toEqual(
      wrapRule({ field: 'firstName', operator: '=', value: 'Steve' })
    );
    expect(parseSQL(`age = ?`, { params: [12] })).toEqual(
      wrapRule({ field: 'age', operator: '=', value: 12 })
    );
    expect(parseSQL(`isMusician = ?`, { params: [true] })).toEqual(
      wrapRule({ field: 'isMusician', operator: '=', value: true })
    );
    expect(parseSQL(`isMusician = ?`, { params: [false] })).toEqual(
      wrapRule({ field: 'isMusician', operator: '=', value: false })
    );
  });

  it('params as object', () => {
    expect(parseSQL(`firstName = :p1`, { params: { p1: 'Steve' } })).toEqual(
      wrapRule({ field: 'firstName', operator: '=', value: 'Steve' })
    );
    expect(parseSQL(`firstName = $p1`, { params: { p1: 'Steve' }, paramPrefix: '$' })).toEqual(
      wrapRule({ field: 'firstName', operator: '=', value: 'Steve' })
    );
  });

  it('lists as arrays', () => {
    expect(parseSQL(`lastName IN ('Vai', 'Vaughan')`, { listsAsArrays: true })).toEqual(
      wrapRule({ field: 'lastName', operator: 'in', value: ['Vai', 'Vaughan'] })
    );
    expect(parseSQL(`age BETWEEN 20 AND 100`, { listsAsArrays: true })).toEqual(
      wrapRule({ field: 'age', operator: 'between', value: [20, 100] })
    );
  });

  it('independent combinators', () => {
    expect(parseSQL(`firstName = 'Steve'`, icOpts)).toEqual(
      wrapRuleIC({ field: 'firstName', operator: '=', value: 'Steve' })
    );
    expect(
      parseSQL(`firstName = 'Steve' AND lastName = someFunc('Vai') OR middleName IS NULL`, icOpts)
    ).toEqual(wrapRuleIC());
    expect(parseSQL(`(firstName = 'Steve')`, icOpts)).toEqual(
      wrapRuleIC({ field: 'firstName', operator: '=', value: 'Steve' })
    );
    expect(
      parseSQL(`firstName = 'Steve' AND lastName = 'Vai' OR middleName IS NULL`, icOpts)
    ).toEqual({
      rules: [
        { field: 'firstName', operator: '=', value: 'Steve' },
        'and',
        { field: 'lastName', operator: '=', value: 'Vai' },
        'or',
        { field: 'middleName', operator: 'null', value: null },
      ],
    });
  });

  describe('fields and getValueSources', () => {
    const fields: Field[] = [
      { name: 'f1', label: 'f1' },
      { name: 'f2', label: 'f2', valueSources: ['value'] },
      { name: 'f3', label: 'f3', valueSources: ['field'] },
      { name: 'f4', label: 'f4', valueSources: () => ['value', 'field'] },
      { name: 'f5', label: 'f5', comparator: 'group', group: 'g1' },
      { name: 'f6', label: 'f6', comparator: 'group', group: 'g1' },
      { name: 'f7', label: 'f7', comparator: 'group', group: 'g2' },
      { name: 'f8', label: 'f8', comparator: 'group', group: 'g2' },
      { name: 'f9', label: 'f9', comparator: f => f.name === 'f1' },
      { name: 'f10', label: 'f10', comparator: f => f.group === 'g2' },
    ];
    const optionGroups: OptionGroup[] = [{ label: 'Option Group1', options: fields }];
    const fieldsObject: Record<string, Field> = {};
    for (const f of fields) {
      fieldsObject[f.name] = f;
    }
    const getValueSources = (): ValueSources => ['field'];

    it('sets the valueSource when fields are valid', () => {
      expect(parseSQL(`f1 = 'Steve'`, { fields })).toEqual(
        wrapRule({ field: 'f1', operator: '=', value: 'Steve' })
      );
      // fields as option groups
      expect(parseSQL(`f3 = f1`, { fields: optionGroups })).toEqual(
        wrapRule({
          field: 'f3',
          operator: '=',
          value: 'f1',
          valueSource: 'field',
        })
      );
      // fields as object
      expect(parseSQL(`f3 = f1`, { fields: fieldsObject })).toEqual(
        wrapRule({
          field: 'f3',
          operator: '=',
          value: 'f1',
          valueSource: 'field',
        })
      );
      // `f3` and `f4` allow the valueSource "field" and have no filter
      const baseFields = ['f3', 'f4'];
      for (const baseField of baseFields) {
        for (const f of fields) {
          expect(parseSQL(`${baseField} = ${f.name}`, { fields })).toEqual(
            f.name === baseField
              ? wrapRule()
              : wrapRule({
                  field: baseField,
                  operator: '=',
                  value: f.name,
                  valueSource: 'field',
                })
          );
        }
      }
    });

    it('uses the getValueSources option', () => {
      expect(parseSQL(`f5 = f6`, { fields, getValueSources })).toEqual(
        wrapRule({
          field: 'f5',
          operator: '=',
          value: 'f6',
          valueSource: 'field',
        })
      );
      expect(parseSQL(`f8 = f7`, { fields, getValueSources })).toEqual(
        wrapRule({
          field: 'f8',
          operator: '=',
          value: 'f7',
          valueSource: 'field',
        })
      );
      expect(parseSQL(`f9 = f1`, { fields, getValueSources })).toEqual(
        wrapRule({
          field: 'f9',
          operator: '=',
          value: 'f1',
          valueSource: 'field',
        })
      );
      expect(parseSQL(`f10 = f7`, { fields, getValueSources })).toEqual(
        wrapRule({
          field: 'f10',
          operator: '=',
          value: 'f7',
          valueSource: 'field',
        })
      );
      expect(parseSQL(`f10 = f8`, { fields, getValueSources })).toEqual(
        wrapRule({
          field: 'f10',
          operator: '=',
          value: 'f8',
          valueSource: 'field',
        })
      );
    });

    it('ignores invalid fields', () => {
      // `firstName` is not in the field list
      expect(parseSQL(`firstName = 'Steve'`, { fields })).toEqual(wrapRule());
      // A field cannot be compared to itself
      expect(parseSQL(`f1 = f1`, { fields })).toEqual(wrapRule());
      // `f1` implicitly forbids the valueSource "field"
      expect(parseSQL(`f1 = f2`, { fields })).toEqual(wrapRule());
      // `f2` explicitly forbids the valueSource "field"
      expect(parseSQL(`f2 = f1`, { fields })).toEqual(wrapRule());
      // `f3` explicitly forbids the valueSource "value"
      expect(parseSQL(`f3 = 'Steve'`, { fields })).toEqual(wrapRule());
      // `f5` implicitly allows the valueSource "field" through getValueSources,
      // but `f7` is not a valid subordinate field
      expect(parseSQL(`f5 = f7`, { fields, getValueSources })).toEqual(wrapRule());
      // `f8` implicitly allows the valueSource "field" through getValueSources,
      // but `f6` is not a valid subordinate field
      expect(parseSQL(`f8 = f6`, { fields, getValueSources })).toEqual(wrapRule());
      // `f9` implicitly allows the valueSource "field" through getValueSources,
      // but `f10` is not a valid subordinate field
      expect(parseSQL(`f9 = f10`, { fields, getValueSources })).toEqual(wrapRule());
      // `f10` implicitly allows the valueSource "field" through getValueSources,
      // but `f5` is not a valid subordinate field
      expect(parseSQL(`f10 = f5`, { fields, getValueSources })).toEqual(wrapRule());
    });

    it('handles all operator types', () => {
      const invalidField = 'firstName';
      const baseField = 'f3';
      const subField = 'f1';
      const subField2 = 'f2';
      const invalidSubField = 'lastName';
      // IsNullBooleanPrimary
      expect(parseSQL(`${invalidField} is null`, { fields })).toEqual(wrapRule());
      expect(parseSQL(`${baseField} is null`, { fields })).toEqual(
        wrapRule({ field: baseField, operator: 'null', value: null })
      );
      // ComparisonBooleanPrimary
      expect(parseSQL(`${invalidField} = ${subField}`, { fields })).toEqual(wrapRule());
      expect(parseSQL(`${baseField} = ${invalidSubField}`, { fields })).toEqual(wrapRule());
      expect(parseSQL(`${baseField} = ${subField}`, { fields })).toEqual(
        wrapRule({
          field: baseField,
          operator: '=',
          value: subField,
          valueSource: 'field',
        })
      );
      // InExpressionListPredicate
      expect(parseSQL(`${invalidField} in (${subField})`, { fields })).toEqual(wrapRule());
      expect(parseSQL(`${baseField} in (${invalidSubField})`, { fields })).toEqual(wrapRule());
      expect(parseSQL(`${baseField} in (${subField}, ${subField2})`, { fields })).toEqual(
        wrapRule({
          field: baseField,
          operator: 'in',
          value: `${subField}, ${subField2}`,
          valueSource: 'field',
        })
      );
      expect(
        parseSQL(`${baseField} in (${subField}, ${subField2})`, {
          fields,
          listsAsArrays: true,
        })
      ).toEqual(
        wrapRule({
          field: baseField,
          operator: 'in',
          value: [subField, subField2],
          valueSource: 'field',
        })
      );
      // BetweenPredicate
      expect(
        parseSQL(`${invalidField} between ${subField} and ${subField2}`, {
          fields,
        })
      ).toEqual(wrapRule());
      expect(
        parseSQL(`${baseField} between ${invalidSubField} and ${subField2}`, {
          fields,
        })
      ).toEqual(wrapRule());
      expect(
        parseSQL(`${baseField} between ${subField} and ${subField2}`, {
          fields,
        })
      ).toEqual(
        wrapRule({
          field: baseField,
          operator: 'between',
          value: `${subField}, ${subField2}`,
          valueSource: 'field',
        })
      );
      // LikePredicate (without wildcards)
      expect(parseSQL(`${invalidField} like ${subField}`, { fields })).toEqual(wrapRule());
      expect(parseSQL(`${baseField} like ${invalidSubField}`, { fields })).toEqual(wrapRule());
      expect(parseSQL(`${baseField} like ${subField}`, { fields })).toEqual(
        wrapRule({
          field: baseField,
          operator: '=',
          value: `${subField}`,
          valueSource: 'field',
        })
      );
    });

    it('handles LIKE clauses with wildcards', () => {
      expect(
        parseSQL(
          `f3 like '%%' || f1 || '%' and f3 like f1 || '%' and f3 like '%' || f1 and f3 not like '%' || f1 || '%' and f3 not like f1 || '%' and f3 not like '%' || f1`,
          { fields }
        )
      ).toEqual({
        combinator: 'and',
        rules: [
          {
            field: 'f3',
            operator: 'contains',
            value: 'f1',
            valueSource: 'field',
          },
          {
            field: 'f3',
            operator: 'beginsWith',
            value: 'f1',
            valueSource: 'field',
          },
          {
            field: 'f3',
            operator: 'endsWith',
            value: 'f1',
            valueSource: 'field',
          },
          {
            field: 'f3',
            operator: 'doesNotContain',
            value: 'f1',
            valueSource: 'field',
          },
          {
            field: 'f3',
            operator: 'doesNotBeginWith',
            value: 'f1',
            valueSource: 'field',
          },
          {
            field: 'f3',
            operator: 'doesNotEndWith',
            value: 'f1',
            valueSource: 'field',
          },
        ],
      });
    });

    // TODO: this can be removed when sqlParser properly handles the `||` operator
    it('identifies wildcards', () => {
      expect(isWildcardsOnly({ type: 'RegexpPredicate' })).toBe(false);
      expect(isWildcardsOnly({ type: 'String', value: '""' })).toBe(false);
      expect(isWildcardsOnly({ type: 'String', value: '"_"' })).toBe(false);
      expect(isWildcardsOnly({ type: 'String', value: '"%"' })).toBe(true);
      expect(isWildcardsOnly({ type: 'String', value: '"%%"' })).toBe(true);
    });
  });
});

describe('AND/OR expressions', () => {
  it('AND', () => {
    expect(parseSQL(`firstName = 'Steve' AND lastName = 'Vai' AND middleName IS NULL`)).toEqual({
      combinator: 'and',
      rules: [
        { field: 'firstName', operator: '=', value: 'Steve' },
        { field: 'lastName', operator: '=', value: 'Vai' },
        { field: 'middleName', operator: 'null', value: null },
      ],
    });
  });

  it('OR', () => {
    expect(parseSQL(`firstName = 'Steve' OR lastName = 'Vai' OR middleName IS NULL`)).toEqual({
      combinator: 'or',
      rules: [
        { field: 'firstName', operator: '=', value: 'Steve' },
        { field: 'lastName', operator: '=', value: 'Vai' },
        { field: 'middleName', operator: 'null', value: null },
      ],
    });
  });

  it('mixed AND/OR', () => {
    expect(parseSQL(`firstName = 'Steve' AND lastName = 'Vai' OR middleName IS NULL`)).toEqual({
      combinator: 'or',
      rules: [
        {
          combinator: 'and',
          rules: [
            { field: 'firstName', operator: '=', value: 'Steve' },
            { field: 'lastName', operator: '=', value: 'Vai' },
          ],
        },
        { field: 'middleName', operator: 'null', value: null },
      ],
    });
    expect(
      parseSQL(
        `firstName = 'Steve' AND lastName = 'Vai' OR middleName IS NULL OR isMusician = TRUE`
      )
    ).toEqual({
      combinator: 'or',
      rules: [
        {
          combinator: 'and',
          rules: [
            { field: 'firstName', operator: '=', value: 'Steve' },
            { field: 'lastName', operator: '=', value: 'Vai' },
          ],
        },
        { field: 'middleName', operator: 'null', value: null },
        { field: 'isMusician', operator: '=', value: true },
      ],
    });
    expect(
      parseSQL(
        `firstName = 'Steve' AND lastName = 'Vai' OR middleName IS NULL OR isMusician = TRUE OR fieldName = 'Test'`
      )
    ).toEqual({
      combinator: 'or',
      rules: [
        {
          combinator: 'and',
          rules: [
            { field: 'firstName', operator: '=', value: 'Steve' },
            { field: 'lastName', operator: '=', value: 'Vai' },
          ],
        },
        { field: 'middleName', operator: 'null', value: null },
        { field: 'isMusician', operator: '=', value: true },
        { field: 'fieldName', operator: '=', value: 'Test' },
      ],
    });
    expect(parseSQL(`firstName = 'Steve' OR lastName = 'Vai' AND middleName IS NULL`)).toEqual({
      combinator: 'or',
      rules: [
        { field: 'firstName', operator: '=', value: 'Steve' },
        {
          combinator: 'and',
          rules: [
            { field: 'lastName', operator: '=', value: 'Vai' },
            { field: 'middleName', operator: 'null', value: null },
          ],
        },
      ],
    });
  });
});

describe('NOT expressions', () => {
  it('standard rule groups', () => {
    const expectedRuleGroup: DefaultRuleGroupType = {
      combinator: 'and',
      rules: [{ field: 'firstName', operator: '=', value: 'Steve' }],
      not: true,
    };
    expect(parseSQL(`NOT firstName = 'Steve'`)).toEqual(expectedRuleGroup);
    expect(parseSQL(`NOT (firstName = 'Steve')`)).toEqual(expectedRuleGroup);
    expect(parseSQL(`NOT (firstName = someFunc('Steve'))`)).toEqual(wrapRule());
    expect(parseSQL(`NOT (firstName = 'Steve' OR lastName = 'Vai')`)).toEqual({
      combinator: 'or',
      rules: [
        { field: 'firstName', operator: '=', value: 'Steve' },
        { field: 'lastName', operator: '=', value: 'Vai' },
      ],
      not: true,
    });
  });

  it('independent combinators', () => {
    const expectedRuleGroupIC: DefaultRuleGroupTypeIC = {
      rules: [{ field: 'firstName', operator: '=', value: 'Steve' }],
      not: true,
    };
    expect(parseSQL(`NOT firstName = 'Steve'`, icOpts)).toEqual(expectedRuleGroupIC);
    expect(parseSQL(`NOT (firstName = 'Steve')`, icOpts)).toEqual(expectedRuleGroupIC);
    expect(parseSQL(`NOT (firstName = someFunc('Steve'))`, icOpts)).toEqual(wrapRuleIC());
    expect(parseSQL(`NOT (firstName = 'Steve' OR lastName = 'Vai')`, icOpts)).toEqual({
      rules: [
        { field: 'firstName', operator: '=', value: 'Steve' },
        'or',
        { field: 'lastName', operator: '=', value: 'Vai' },
      ],
      not: true,
    });
    expect(parseSQL(`firstName = 'Steve' OR NOT lastName = 'Vai'`, icOpts)).toEqual({
      rules: [
        { field: 'firstName', operator: '=', value: 'Steve' },
        'or',
        {
          rules: [{ field: 'lastName', operator: '=', value: 'Vai' }],
          not: true,
        },
      ],
    });
  });
});

describe('parenthetical groups', () => {
  it('opening parentheses', () => {
    expect(parseSQL(`(firstName = 'Steve')`)).toEqual(
      wrapRule({ field: 'firstName', operator: '=', value: 'Steve' })
    );
  });

  it('non-opening parentheses', () => {
    expect(parseSQL(`firstName = 'Steve' AND (lastName = 'Vai' AND middleName IS NULL)`)).toEqual({
      combinator: 'and',
      rules: [
        { field: 'firstName', operator: '=', value: 'Steve' },
        {
          combinator: 'and',
          rules: [
            { field: 'lastName', operator: '=', value: 'Vai' },
            { field: 'middleName', operator: 'null', value: null },
          ],
        },
      ],
    });
  });

  it('nested parentheses', () => {
    expect(
      parseSQL(
        `firstName = 'Steve' AND ((testField = 'TestValue' AND (lastName = 'Vai')) AND middleName IS NULL)`
      )
    ).toEqual({
      combinator: 'and',
      rules: [
        { field: 'firstName', operator: '=', value: 'Steve' },
        {
          combinator: 'and',
          rules: [
            {
              combinator: 'and',
              rules: [
                { field: 'testField', operator: '=', value: 'TestValue' },
                {
                  combinator: 'and',
                  rules: [{ field: 'lastName', operator: '=', value: 'Vai' }],
                },
              ],
            },
            { field: 'middleName', operator: 'null', value: null },
          ],
        },
      ],
    });
  });

  it('parentheses with AND', () => {
    expect(parseSQL(`(firstName = 'Steve' AND lastName = 'Vai')`)).toEqual({
      combinator: 'and',
      rules: [
        { field: 'firstName', operator: '=', value: 'Steve' },
        { field: 'lastName', operator: '=', value: 'Vai' },
      ],
    });
  });

  it('nested parentheses with ignored expressions', () => {
    expect(parseSQL(`((((firstName = CASE x WHEN y THEN z END))))`)).toEqual(wrapRule());
  });
});

describe('errors', () => {
  it('throws on bad SQL', () => {
    expect(() => parseSQL(`SELECT blah blah blah`)).toThrow();
  });
});
