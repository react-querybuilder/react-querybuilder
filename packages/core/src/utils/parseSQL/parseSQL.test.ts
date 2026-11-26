import type {
  DefaultRuleGroupType,
  DefaultRuleGroupTypeIC,
  DefaultRuleType,
  Field,
  FullField,
  OptionGroup,
  ValueSources,
} from '../../types';
import { formatQuery } from '../formatQuery';
import { toFullOption } from '../optGroupUtils';
import { parseSQL } from './parseSQL';
import { isWildcardsOnly } from './utils';

const wrapRule = (rule?: DefaultRuleType): DefaultRuleGroupType => ({
  combinator: 'and',
  rules: rule ? [rule] : [],
});
const wrapRuleIC = (rule?: DefaultRuleType): DefaultRuleGroupTypeIC => ({
  rules: rule ? [rule] : [],
});
const icOpts = { independentCombinators: true } as const;
const getValueSources = (): ValueSources => ['field'];

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

describe('leading keywords/whitespace', () => {
  const expected = wrapRule({ field: 'firstName', operator: '=', value: 'Steve' });

  it('handles SQL strings beginning with WHERE keyword only', () => {
    expect(parseSQL(`WHERE firstName = 'Steve'`)).toEqual(expected);
  });

  it('handles SQL strings beginning with WHERE keyword and leading whitespace', () => {
    expect(parseSQL(` \t \r\n  WHERE firstName = 'Steve'`)).toEqual(expected);
  });

  it('handles SQL strings beginning with SELECT keyword', () => {
    expect(parseSQL(`SELECT * FROM t WHERE firstName = 'Steve'`)).toEqual(expected);
  });

  it('handles dots and asterisks in SELECT list', () => {
    expect(parseSQL(`SELECT t.col.sub, s.t.* FROM t WHERE firstName = 'Steve'`)).toEqual(expected);
  });

  it('handles SQL strings beginning with SELECT keyword and leading whitespace', () => {
    expect(parseSQL(` \t \r\n  SELECT * FROM t WHERE firstName = 'Steve'`)).toEqual(expected);
  });
});

describe('boolean operators', () => {
  it('basic comparisons of strings and numbers', () => {
    expect(parseSQL(`firstName = 'Steve'`)).toEqual(
      wrapRule({ field: 'firstName', operator: '=', value: 'Steve' })
    );
    // Empty strings
    expect(parseSQL(`middleName = ''`)).toEqual(
      wrapRule({ field: 'middleName', operator: '=', value: '' })
    );
    // Strings with Unicode characters
    expect(parseSQL(`unicode = '🚀🌕'`)).toEqual(
      wrapRule({ field: 'unicode', operator: '=', value: '🚀🌕' })
    );
    // Only escaped single quotes
    expect(parseSQL(`singleQuotes = ''''''`)).toEqual(
      wrapRule({ field: 'singleQuotes', operator: '=', value: `''` })
    );
    // Multi-line strings with escaped single quotes
    expect(
      parseSQL(`firstName = 'Batman thinks
Ra''s al Ghul
is a ''''bad'''' guy!'`)
    ).toEqual(
      wrapRule({
        field: 'firstName',
        operator: '=',
        value: `Batman thinks
Ra's al Ghul
is a ''bad'' guy!`,
      })
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
    expect(parseSQL(`age > -14`)).toEqual(wrapRule({ field: 'age', operator: '>', value: -14 }));
  });

  it('reversed identifier and value and/or operator needs normalizing', () => {
    expect(parseSQL(`'Steve' = firstName`)).toEqual(
      wrapRule({ field: 'firstName', operator: '=', value: 'Steve' })
    );
    expect(parseSQL(`21 <> age`)).toEqual(wrapRule({ field: 'age', operator: '!=', value: 21 }));
    expect(parseSQL(`21 < age`)).toEqual(wrapRule({ field: 'age', operator: '>', value: 21 }));
    expect(parseSQL(`21 <= age`)).toEqual(wrapRule({ field: 'age', operator: '>=', value: 21 }));
    expect(parseSQL(`21 > age`)).toEqual(wrapRule({ field: 'age', operator: '<', value: 21 }));
    expect(parseSQL(`21 >= age`)).toEqual(wrapRule({ field: 'age', operator: '<=', value: 21 }));
    expect(parseSQL(`-21 > age`)).toEqual(wrapRule({ field: 'age', operator: '<', value: -21 }));
  });

  it('booleans', () => {
    expect(parseSQL(`isMusician = TRUE`)).toEqual(
      wrapRule({ field: 'isMusician', operator: '=', value: true })
    );
    expect(parseSQL(`isMusician = FALSE`)).toEqual(
      wrapRule({ field: 'isMusician', operator: '=', value: false })
    );
  });

  it('wrapped/quoted field names', () => {
    expect(parseSQL('`Is a Musician` = TRUE AND `Is a Pianist` = FALSE')).toEqual({
      combinator: 'and',
      rules: [
        { field: 'Is a Musician', operator: '=', value: true },
        { field: 'Is a Pianist', operator: '=', value: false },
      ],
    });
    expect(parseSQL('"Is a Musician" = TRUE AND "Is a Pianist" = FALSE')).toEqual({
      combinator: 'and',
      rules: [
        { field: 'Is a Musician', operator: '=', value: true },
        { field: 'Is a Pianist', operator: '=', value: false },
      ],
    });
    expect(parseSQL('[Is a Musician] = TRUE AND [Is a Pianist] = FALSE')).toEqual({
      combinator: 'and',
      rules: [
        { field: 'Is a Musician', operator: '=', value: true },
        { field: 'Is a Pianist', operator: '=', value: false },
      ],
    });
    expect(parseSQL('[🚀 - ]] - 🌕] = TRUE')).toEqual(
      wrapRule({ field: '🚀 - ] - 🌕', operator: '=', value: true })
    );
    expect(parseSQL('`🚀 - `` - 🌕` = TRUE')).toEqual(
      wrapRule({ field: '🚀 - ` - 🌕', operator: '=', value: true })
    );
    expect(parseSQL('"🚀 - "" - 🌕" = TRUE')).toEqual(
      wrapRule({ field: '🚀 - " - 🌕', operator: '=', value: true })
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
    expect(parseSQL(`firstName IN ('Te,st', 12, true, lastName)`)).toEqual(
      wrapRule({ field: 'firstName', operator: 'in', value: String.raw`Te\,st, 12, true` })
    );
    expect(parseSQL(`firstName NOT IN ('Test', 12, true, lastName)`)).toEqual(
      wrapRule({ field: 'firstName', operator: 'notIn', value: 'Test, 12, true' })
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
      wrapRule({ field: 'firstName', operator: 'doesNotContain', value: 'Steve' })
    );
    expect(parseSQL(`firstName NOT LIKE 'Steve%'`)).toEqual(
      wrapRule({ field: 'firstName', operator: 'doesNotBeginWith', value: 'Steve' })
    );
    expect(parseSQL(`firstName NOT LIKE '%Steve'`)).toEqual(
      wrapRule({ field: 'firstName', operator: 'doesNotEndWith', value: 'Steve' })
    );
    expect(parseSQL(`firstName LIKE 'Steve'`)).toEqual(
      wrapRule({ field: 'firstName', operator: '=', value: 'Steve' })
    );
    expect(parseSQL(`firstName NOT LIKE 'Steve'`)).toEqual(
      wrapRule({ field: 'firstName', operator: '!=', value: 'Steve' })
    );
  });

  it('between/notBetween', () => {
    expect(parseSQL(`age BETWEEN 12 AND 14`)).toEqual(
      wrapRule({ field: 'age', operator: 'between', value: '12, 14' })
    );
    expect(parseSQL(`age NOT BETWEEN 12 AND 14`)).toEqual(
      wrapRule({ field: 'age', operator: 'notBetween', value: '12, 14' })
    );
    expect(parseSQL(`age BETWEEN 'this, that' AND 'the other'`)).toEqual(
      wrapRule({ field: 'age', operator: 'between', value: String.raw`this\, that, the other` })
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

  it('generates IDs', () => {
    expect(parseSQL(`firstName = 'Steve'`, { generateIDs: true })).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        ...wrapRule({ id: expect.any(String), field: 'firstName', operator: '=', value: 'Steve' }),
      })
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
    expect(
      parseSQL(
        `firstName = 'Steve' AND lastName = 'Vai' XOR age = 26 OR middleName IS NULL`,
        icOpts
      )
    ).toEqual({
      rules: [
        { field: 'firstName', operator: '=', value: 'Steve' },
        'and',
        { field: 'lastName', operator: '=', value: 'Vai' },
        'xor',
        { field: 'age', operator: '=', value: 26 },
        'or',
        { field: 'middleName', operator: 'null', value: null },
      ],
    });
  });

  describe('fields and getValueSources', () => {
    const fields = (
      [
        { name: 'f1', label: 'f1' },
        { name: 'f2', label: 'f2', valueSources: ['value'] },
        { name: 'f3', label: 'f3', valueSources: ['field'] },
        { name: 'f4', label: 'f4', valueSources: () => ['value', 'field'] },
        { name: 'f5', label: 'f5', comparator: 'group', group: 'g1' },
        { name: 'f6', label: 'f6', comparator: 'group', group: 'g1' },
        { name: 'f7', label: 'f7', comparator: 'group', group: 'g2' },
        { name: 'f8', label: 'f8', comparator: 'group', group: 'g2' },
        { name: 'f9', label: 'f9', comparator: (f: FullField) => f.name === 'f1' },
        { name: 'f10', label: 'f10', comparator: (f: FullField) => f.group === 'g2' },
      ] satisfies Field[]
    ).map(o => toFullOption(o));
    const optionGroups: OptionGroup<FullField>[] = [{ label: 'Option Group1', options: fields }];

    it('sets the valueSource when fields are valid', () => {
      expect(parseSQL(`f1 = 'Steve'`, { fields })).toEqual(
        wrapRule({ field: 'f1', operator: '=', value: 'Steve' })
      );
      // fields as option groups
      expect(parseSQL(`f3 = f1`, { fields: optionGroups })).toEqual(
        wrapRule({ field: 'f3', operator: '=', value: 'f1', valueSource: 'field' })
      );
      // fields as object
      expect(
        parseSQL(`f3 = f1`, { fields: Object.fromEntries(fields.map(f => [f.name, f])) })
      ).toEqual(wrapRule({ field: 'f3', operator: '=', value: 'f1', valueSource: 'field' }));
      // `f3` and `f4` allow the valueSource "field" and have no filter
      const baseFields = ['f3', 'f4'];
      for (const baseField of baseFields) {
        for (const f of fields) {
          expect(parseSQL(`${baseField} = ${f.name}`, { fields })).toEqual(
            f.name === baseField
              ? wrapRule()
              : wrapRule({ field: baseField, operator: '=', value: f.name, valueSource: 'field' })
          );
        }
      }
    });

    it('uses the getValueSources option', () => {
      expect(parseSQL(`f5 = f6`, { fields, getValueSources })).toEqual(
        wrapRule({ field: 'f5', operator: '=', value: 'f6', valueSource: 'field' })
      );
      expect(parseSQL(`f8 = f7`, { fields, getValueSources })).toEqual(
        wrapRule({ field: 'f8', operator: '=', value: 'f7', valueSource: 'field' })
      );
      expect(parseSQL(`f9 = f1`, { fields, getValueSources })).toEqual(
        wrapRule({ field: 'f9', operator: '=', value: 'f1', valueSource: 'field' })
      );
      expect(parseSQL(`f10 = f7`, { fields, getValueSources })).toEqual(
        wrapRule({ field: 'f10', operator: '=', value: 'f7', valueSource: 'field' })
      );
      expect(parseSQL(`f10 = f8`, { fields, getValueSources })).toEqual(
        wrapRule({ field: 'f10', operator: '=', value: 'f8', valueSource: 'field' })
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
        wrapRule({ field: baseField, operator: '=', value: subField, valueSource: 'field' })
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
        parseSQL(`${baseField} in (${subField}, ${subField2})`, { fields, listsAsArrays: true })
      ).toEqual(
        wrapRule({
          field: baseField,
          operator: 'in',
          value: [subField, subField2],
          valueSource: 'field',
        })
      );
      // BetweenPredicate
      expect(parseSQL(`${invalidField} between ${subField} and ${subField2}`, { fields })).toEqual(
        wrapRule()
      );
      expect(
        parseSQL(`${baseField} between ${invalidSubField} and ${subField2}`, { fields })
      ).toEqual(wrapRule());
      expect(parseSQL(`${baseField} between ${subField} and ${subField2}`, { fields })).toEqual(
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
        wrapRule({ field: baseField, operator: '=', value: `${subField}`, valueSource: 'field' })
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
          { field: 'f3', operator: 'contains', value: 'f1', valueSource: 'field' },
          { field: 'f3', operator: 'beginsWith', value: 'f1', valueSource: 'field' },
          { field: 'f3', operator: 'endsWith', value: 'f1', valueSource: 'field' },
          { field: 'f3', operator: 'doesNotContain', value: 'f1', valueSource: 'field' },
          { field: 'f3', operator: 'doesNotBeginWith', value: 'f1', valueSource: 'field' },
          { field: 'f3', operator: 'doesNotEndWith', value: 'f1', valueSource: 'field' },
        ],
      });
    });

    it('identifies wildcards', () => {
      expect(isWildcardsOnly({ type: 'SoundsLikePredicate' })).toBe(false);
      expect(isWildcardsOnly({ type: 'String', value: '""' })).toBe(false);
      expect(isWildcardsOnly({ type: 'String', value: '"_"' })).toBe(false);
      expect(isWildcardsOnly({ type: 'String', value: '"%"' })).toBe(true);
      expect(isWildcardsOnly({ type: 'String', value: '"%%"' })).toBe(true);
    });
  });
});

describe('AND/OR/XOR expressions', () => {
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

  it('XOR', () => {
    expect(parseSQL(`firstName = 'Steve' XOR lastName = 'Vai' XOR middleName IS NULL`)).toEqual({
      combinator: 'xor',
      rules: [
        { field: 'firstName', operator: '=', value: 'Steve' },
        { field: 'lastName', operator: '=', value: 'Vai' },
        { field: 'middleName', operator: 'null', value: null },
      ],
    });
  });

  it('order of precedence is AND -> XOR -> OR', () => {
    expect(parseSQL(`f1 = 'v1' AND f2 = 'v2' XOR f3 = 'v3' OR f4 = 'v4'`)).toEqual({
      combinator: 'or',
      rules: [
        {
          combinator: 'xor',
          rules: [
            {
              combinator: 'and',
              rules: [
                { field: 'f1', operator: '=', value: 'v1' },
                { field: 'f2', operator: '=', value: 'v2' },
              ],
            },
            { field: 'f3', operator: '=', value: 'v3' },
          ],
        },
        { field: 'f4', operator: '=', value: 'v4' },
      ],
    });
    expect(parseSQL(`f1 = 'v1' OR f2 = 'v2' XOR f3 = 'v3' AND f4 = 'v4'`)).toEqual({
      combinator: 'or',
      rules: [
        { field: 'f1', operator: '=', value: 'v1' },
        {
          combinator: 'xor',
          rules: [
            { field: 'f2', operator: '=', value: 'v2' },
            {
              combinator: 'and',
              rules: [
                { field: 'f3', operator: '=', value: 'v3' },
                { field: 'f4', operator: '=', value: 'v4' },
              ],
            },
          ],
        },
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
        { rules: [{ field: 'lastName', operator: '=', value: 'Vai' }], not: true },
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
                { combinator: 'and', rules: [{ field: 'lastName', operator: '=', value: 'Vai' }] },
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

describe('regex', () => {
  const pr = { parseRegex: true } as const;
  it.each([
    [`f REGEXP 'a'`, { field: 'f', operator: 'matches', value: 'a' }],
    [`f RLIKE 'a'`, { field: 'f', operator: 'matches', value: 'a' }],
    [`f NOT REGEXP 'a'`, { field: 'f', operator: 'doesNotMatch', value: 'a' }],
    [`f ~ 'a''b'`, { field: 'f', operator: 'matches', value: `a'b`, regexFlags: 's' }],
    [`f ~* 'a'`, { field: 'f', operator: 'matches', value: 'a', regexFlags: 'is' }],
    [`f !~ 'a'`, { field: 'f', operator: 'doesNotMatch', value: 'a', regexFlags: 's' }],
    [`f !~* 'a'`, { field: 'f', operator: 'doesNotMatch', value: 'a', regexFlags: 'is' }],
    [`f ~ '(?i)a'`, { field: 'f', operator: 'matches', value: 'a', regexFlags: 'is' }],
    [`f ~* '(?c)a'`, { field: 'f', operator: 'matches', value: 'a', regexFlags: 's' }],
    [`f ~ '(?ic)a'`, { field: 'f', operator: 'matches', value: 'a', regexFlags: 's' }],
    [`f ~ '(?p)a'`, { field: 'f', operator: 'matches', value: 'a' }],
    [`f ~ '(?n)a'`, { field: 'f', operator: 'matches', value: 'a', regexFlags: 'm' }],
    [`f ~ '(?m)a'`, { field: 'f', operator: 'matches', value: 'a', regexFlags: 'm' }],
    [`f ~ '(?wi)a'`, { field: 'f', operator: 'matches', value: 'a', regexFlags: 'ims' }],
    [`f ~ '(?ps)a'`, { field: 'f', operator: 'matches', value: 'a', regexFlags: 's' }],
    [`f ~ '(?x)a'`, { field: 'f', operator: 'matches', value: '(?x)a', regexFlags: 's' }],
    [`f REGEXP '(?n)a'`, { field: 'f', operator: 'matches', value: 'a', regexFlags: 'm' }],
    [`f REGEXP '(?w)a'`, { field: 'f', operator: 'matches', value: 'a', regexFlags: 'ms' }],
    [`f REGEXP '(?p)a'`, { field: 'f', operator: 'matches', value: 'a' }],
    [`REGEXP_LIKE(f, 'a')`, { field: 'f', operator: 'matches', value: 'a' }],
    [
      `regexp_like(f, 'a', 'nmixc')`,
      { field: 'f', operator: 'matches', value: 'a', regexFlags: 'ms' },
    ],
    [`regexp_like(f, 'a', 'ci')`, { field: 'f', operator: 'matches', value: 'a', regexFlags: 'i' }],
    [
      `NOT REGEXP_LIKE(f, 'a', 'i')`,
      { field: 'f', operator: 'doesNotMatch', value: 'a', regexFlags: 'i' },
    ],
    [`NOT (REGEXP_LIKE(f, 'a'))`, { field: 'f', operator: 'doesNotMatch', value: 'a' }],
  ] as const)('%s', (sql, rule) => {
    expect(parseSQL(sql, pr)).toEqual(wrapRule(rule as DefaultRuleType));
  });

  it.each([
    `f REGEXP g`,
    `'a' ~ f`,
    `regexp_like(f, g)`,
    `regexp_like(f, 'a', g)`,
    `other_fn(f, 'a')`,
    `NOT other_fn(f, 'a')`,
  ])('ignores %s', sql => {
    expect(parseSQL(sql, pr)).toEqual(wrapRule());
  });

  it('ignores regex unless enabled', () => {
    expect(parseSQL(`f ~ 'a'`)).toEqual(wrapRule());
    expect(parseSQL(`f ~ 'a'`, { parseRegex: false })).toEqual(wrapRule());
    expect(parseSQL(`regexp_like(f, 'a')`)).toEqual(wrapRule());
    // Enabled via field operators
    expect(
      parseSQL(`f ~ 'a' and g ~ 'b'`, {
        fields: [
          { name: 'f', label: 'F', operators: [{ name: 'matches', label: 'matches' }] },
          { name: 'g', label: 'G' },
        ],
      })
    ).toEqual(wrapRule({ field: 'f', operator: 'matches', value: 'a', regexFlags: 's' }));
  });

  it('round-trips PostgreSQL', () => {
    const query: DefaultRuleGroupType = {
      combinator: 'and',
      rules: [
        { field: 'f', operator: 'matches', value: `a\\d'x`, regexFlags: 'i' },
        { field: 'g', operator: 'doesNotMatch', value: '^b$', regexFlags: 'm' },
        { field: 'h', operator: 'matches', value: 'c', regexFlags: 'ims' },
        { field: 'k', operator: 'matches', value: 'a.b', regexFlags: 's' },
      ],
    };
    expect(parseSQL(formatQuery(query, { preset: 'postgresql' }), pr)).toEqual(query);
    expect(parseSQL(formatQuery(query, { preset: 'oracle' }), pr)).toEqual(query);
  });
});

describe('LIKE escape clause', () => {
  const operators = [
    'contains',
    'beginsWith',
    'endsWith',
    'doesNotContain',
    'doesNotBeginWith',
    'doesNotEndWith',
  ] as const;
  const presets = ['ansi', 'sqlite', 'postgresql', 'mysql', 'mssql', 'oracle'] as const;
  const values = ['50%', 'a_b', '%', '_', 'x\\y', 'x\\', '\\%', '[a]', "a'%"];

  describe.each(operators)('%s', operator => {
    it.each(presets.flatMap(preset => values.map(value => [preset, value] as const)))(
      'round-trips w/ escapeLikeWildcards (%s, %j)',
      (preset, value) => {
        const q = wrapRule({ field: 's', operator, value });
        const sql = formatQuery(q, { preset, escapeLikeWildcards: true });
        expect(parseSQL(sql, { preset })).toEqual(q);
      }
    );
  });

  it('treats escaped characters as literals', () => {
    expect(parseSQL(`s like '%50\\%' escape '\\'`)).toEqual(
      wrapRule({ field: 's', operator: 'endsWith', value: '50%' })
    );
    expect(parseSQL(`s not like 'a\\_b' escape '\\'`)).toEqual(
      wrapRule({ field: 's', operator: '!=', value: 'a_b' })
    );
    expect(parseSQL(`s like '%50!%%' escape '!'`)).toEqual(
      wrapRule({ field: 's', operator: 'contains', value: '50%' })
    );
    expect(parseSQL(`s like '!%%' escape '!'`)).toEqual(
      wrapRule({ field: 's', operator: 'beginsWith', value: '%' })
    );
    // Trailing escape character is kept as-is
    expect(parseSQL(`s like 'a!' escape '!'`)).toEqual(
      wrapRule({ field: 's', operator: '=', value: 'a!' })
    );
  });

  it('keeps a trailing escape char literal even when it is a wildcard', () => {
    expect(parseSQL(`s like 'a%' escape '%'`)).toEqual(
      wrapRule({ field: 's', operator: '=', value: 'a%' })
    );
  });

  it('ignores non-literal and multi-char escapes', () => {
    expect(parseSQL(`s like '%a\\%' escape t`)).toEqual(
      wrapRule({ field: 's', operator: 'contains', value: 'a\\' })
    );
    expect(parseSQL(`s like '%a\\%' escape 1`)).toEqual(
      wrapRule({ field: 's', operator: 'contains', value: 'a\\' })
    );
    expect(parseSQL(`s like '%a!!%' escape '!!'`)).toEqual(
      wrapRule({ field: 's', operator: 'contains', value: 'a!!' })
    );
  });

  it('drops rules w/ unescaped interior wildcards when an escape clause is present', () => {
    expect(parseSQL(`s like 'a%b' escape '\\'`)).toEqual(wrapRule());
    expect(parseSQL(`s like '%a_b%' escape '\\'`)).toEqual(wrapRule());
    expect(parseSQL(`s like '_ab' escape '\\'`)).toEqual(wrapRule());
    // No escape clause: unchanged (interior wildcards kept in value)
    expect(parseSQL(`s like '%a_b%'`)).toEqual(
      wrapRule({ field: 's', operator: 'contains', value: 'a_b' })
    );
  });
});

describe('mysql preset', () => {
  it('unescapes backslash sequences in string literals', () => {
    expect(parseSQL(`s = 'a\\\\b\\n\\x'`, { preset: 'mysql' })).toEqual(
      wrapRule({ field: 's', operator: '=', value: 'a\\b\nx' })
    );
    expect(parseSQL(`s in ('a\\\\', 'b')`, { preset: 'mysql', listsAsArrays: true })).toEqual(
      wrapRule({ field: 's', operator: 'in', value: ['a\\', 'b'] })
    );
    // Without the preset, backslashes are literal
    expect(parseSQL(`s = 'a\\\\b'`)).toEqual(
      wrapRule({ field: 's', operator: '=', value: 'a\\\\b' })
    );
  });

  it('uses `\\` as the default LIKE escape character', () => {
    expect(parseSQL(`s like '%50\\%'`, { preset: 'mysql' })).toEqual(
      wrapRule({ field: 's', operator: 'endsWith', value: '50%' })
    );
    expect(parseSQL(`s like '%a%b%'`, { preset: 'mysql' })).toEqual(
      wrapRule({ field: 's', operator: 'contains', value: 'a%b' })
    );
  });

  it.each(['x\\y', 'x\\', "a'b", "\\'"])('round-trips %j w/o escapeLikeWildcards', value => {
    for (const operator of ['=', 'contains', 'beginsWith', 'endsWith'] as const) {
      const q = wrapRule({ field: 's', operator, value });
      expect(parseSQL(formatQuery(q, { preset: 'mysql' }), { preset: 'mysql' })).toEqual(q);
    }
  });
});

describe('quotes adjacent to wildcards (#1135)', () => {
  // W/o `escapeLikeWildcards`, `%`/`_` in values stay wildcards, so only quotes here
  const values = ["'s", "s'", "'", "''", "a'b", "''s''"];
  for (const operator of [
    'contains',
    'beginsWith',
    'endsWith',
    'doesNotContain',
    'doesNotBeginWith',
    'doesNotEndWith',
  ] as const) {
    it(`round-trips ${operator}`, () => {
      for (const value of values) {
        const q = wrapRule({ field: 's', operator, value });
        expect(parseSQL(formatQuery(q, 'sql'))).toEqual(q);
      }
    });
  }

  it('parses specific string forms', () => {
    expect(parseSQL(`s like '%''s%'`)).toEqual(
      wrapRule({ field: 's', operator: 'contains', value: "'s" })
    );
    expect(parseSQL(`s = '%'`)).toEqual(wrapRule({ field: 's', operator: '=', value: '%' }));
    expect(parseSQL(`s = ''`)).toEqual(wrapRule({ field: 's', operator: '=', value: '' }));
    expect(parseSQL(`s like '%' || t || '%'`)).toEqual(
      wrapRule({ field: 's', operator: 'contains', value: 't', valueSource: 'field' })
    );
    expect(parseSQL(`s like t || '%'`)).toEqual(
      wrapRule({ field: 's', operator: 'beginsWith', value: 't', valueSource: 'field' })
    );
    expect(parseSQL(`s like '%' || t`)).toEqual(
      wrapRule({ field: 's', operator: 'endsWith', value: 't', valueSource: 'field' })
    );
    for (const c of ['/* c */', '-- c\n', '# c\n']) {
      expect(parseSQL(`s like '%' ${c} || t`)).toEqual(
        wrapRule({ field: 's', operator: 'endsWith', value: 't', valueSource: 'field' })
      );
      expect(parseSQL(`s like t || ${c} '%'`)).toEqual(
        wrapRule({ field: 's', operator: 'beginsWith', value: 't', valueSource: 'field' })
      );
    }
  });
});
