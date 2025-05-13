import type {
  FormatQueryOptions,
  RuleGroupType,
  RuleProcessor,
} from '../../../types/index.noReact';
import { add } from '../../queryTools';
import { defaultRuleProcessorLDAP } from '../defaultRuleProcessorLDAP';
import { formatQuery } from '../formatQuery';
import {
  getValidationTestData,
  query,
  queryAllOperators,
  queryAllOperatorsRandomCase,
  queryForNumberParsing,
  queryForPreserveValueOrder,
  queryIC,
  queryWithValueSourceField,
  testQueryDQ,
} from '../formatQueryTestUtils';

const ldapString = `(&(firstName=*)(!(lastName=*))(|(firstName=Test)(firstName=This))(!(|(lastName=Test)(lastName=This)))(|)(&(firstName>=Test)(firstName<=This))(&(firstName>=Test)(firstName<=This))(!(&(lastName>=Test)(lastName<=This)))(&(age>=12)(age<=14))(age=26)(isMusician=true)(isLucky=false)(!(|(gender=M)(!(job=Programmer))(email=*@*)))(|(!(lastName=*ab*))(job=Prog*)(email=*com)(!(job=Man*))(!(email=*fr))))`;
const ldapStringForValueSourceField = ``;

it('formats LDAP correctly', () => {
  const ldapQuery = add(query, { field: 'invalid', operator: 'invalid', value: '' }, []);
  expect(formatQuery(ldapQuery, 'ldap')).toBe(ldapString);
  expect(formatQuery(queryWithValueSourceField, 'ldap')).toBe(ldapStringForValueSourceField);
  expect(
    formatQuery(
      { combinator: 'and', rules: [{ field: 'f', operator: 'between', value: [14, 12] }] },
      'ldap'
    )
  ).toBe('(&(f>=12)(f<=14))');
});

it('handles operator case variations', () => {
  expect(formatQuery(queryAllOperators, 'ldap')).toBe(
    formatQuery(queryAllOperatorsRandomCase, 'ldap')
  );
});

it('does not need to escape quotes', () => {
  expect(formatQuery(testQueryDQ, 'ldap')).toEqual(`(f1=Te"st)`);
});

it('escapes special characters', () => {
  expect(
    formatQuery({ rules: [{ field: 'f1', operator: '=', value: `()&|=><~*/\\` }] }, 'ldap')
  ).toEqual(`(f1=\\28\\29\\26\\7c\\3d\\3e\\3c\\7e\\2a\\2f\\5c)`);
});

it('independent combinators', () => {
  expect(formatQuery(queryIC, 'ldap')).toBe(
    `(|(&(firstName=Test)(middleName=Test))(lastName=Test))`
  );
});

describe('validation', () => {
  const validationResults: Record<string, string> = {
    'should invalidate ldap': '',
    'should invalidate ldap even if fields are valid': '',
    'should invalidate ldap rule by validator function': ``,
    'should invalidate ldap rule specified by validationMap': ``,
    'should invalidate ldap outermost group': '',
    'should invalidate ldap inner group': '',
    'should convert ldap inner group with no rules to fallbackExpression': '',
  };

  for (const vtd of getValidationTestData('ldap')) {
    if (validationResults[vtd.title] !== undefined) {
      it(vtd.title, () => {
        expect(formatQuery(vtd.query, vtd.options)).toBe(validationResults[vtd.title]);
      });
    }
  }
});

it('ruleProcessor', () => {
  const queryForRuleProcessor: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 'f1', operator: 'custom_operator', value: 'v1' },
      { field: 'f2', operator: '=', value: 'v2' },
    ],
  };

  const ruleProcessor: RuleProcessor = r =>
    r.operator === 'custom_operator' ? r.operator : defaultRuleProcessorLDAP(r);
  expect(formatQuery(queryForRuleProcessor, { format: 'ldap', ruleProcessor })).toBe(
    '(&custom_operator(f2=v2))'
  );
  expect(
    formatQuery(queryForRuleProcessor, { format: 'ldap', valueProcessor: ruleProcessor })
  ).toBe('(&custom_operator(f2=v2))');
});

it('parseNumbers', () => {
  const allNumbersParsed =
    '(&(f>=NaN)(f=0)(f=0)(f=0)(|(f<=1.5)(f>=1.5))(|(f=0)(f=1)(f=2))(|(f=0)(f=1)(f=2))(|(f=0)(f=abc)(f=2))(&(f>=0)(f<=1))(&(f>=0)(f<=1))(&(f>=0)(f<=abc))(&(f>=[object Object])(f<=[object Object])))';
  for (const opts of [
    { parseNumbers: true },
    { parseNumbers: 'strict' },
    { parseNumbers: 'strict-limited', fields: [{ name: 'f', label: 'f', inputType: 'number' }] },
  ] as FormatQueryOptions[]) {
    expect(formatQuery(queryForNumberParsing, { ...opts, format: 'ldap' })).toBe(allNumbersParsed);
  }
  const queryForNumberParsingLDAP: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 'f', operator: 'beginsWith', value: 1 },
      { field: 'f', operator: 'endsWith', value: 1 },
    ],
  };
  expect(formatQuery(queryForNumberParsingLDAP, { format: 'ldap', parseNumbers: true })).toBe(
    `(&(f=1*)(f=*1))`
  );
});

it('preserveValueOrder', () => {
  expect(formatQuery(queryForPreserveValueOrder, { format: 'ldap', parseNumbers: true })).toBe(
    `(&(&(f1>=12)(f1<=14))(&(f2>=12)(f2<=14)))`
  );
  expect(
    formatQuery(queryForPreserveValueOrder, {
      format: 'ldap',
      parseNumbers: true,
      preserveValueOrder: true,
    })
  ).toBe(`(&(&(f1>=12)(f1<=14))(&(f2>=14)(f2<=12)))`);
});
