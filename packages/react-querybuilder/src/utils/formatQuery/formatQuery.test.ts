import type {
  RuleGroupType,
  RuleGroupTypeIC,
  RuleProcessor,
  ValueProcessorByRule,
  ValueProcessorLegacy,
} from '@react-querybuilder/ts/src/index.noReact';
import {
  defaultCELValueProcessor,
  defaultMongoDBValueProcessor,
  defaultRuleProcessorCEL,
  defaultRuleProcessorMongoDB,
  defaultRuleProcessorSpEL,
  defaultSpELValueProcessor,
  defaultValueProcessor,
} from '.';
import { defaultPlaceholderFieldName, defaultPlaceholderOperatorName } from '../../defaults';
import { convertToIC } from '../convertQuery';
import { add } from '../queryTools';
import { defaultRuleProcessorJsonLogic } from './defaultRuleProcessorJsonLogic';
import { formatQuery } from './formatQuery';
import { jsonLogicAdditionalOperators } from './utils';

const query: RuleGroupType = {
  id: 'g-root',
  rules: [
    {
      field: defaultPlaceholderFieldName,
      operator: defaultPlaceholderOperatorName,
      value: 'Placeholder',
    },
    {
      field: defaultPlaceholderFieldName,
      operator: '=',
      value: 'Placeholder',
    },
    {
      field: 'firstName',
      operator: defaultPlaceholderOperatorName,
      value: 'Placeholder',
    },
    {
      field: 'firstName',
      operator: 'null',
      value: '',
    },
    {
      field: 'lastName',
      operator: 'notNull',
      value: '',
    },
    {
      field: 'firstName',
      operator: 'in',
      value: 'Test,This',
    },
    {
      field: 'lastName',
      operator: 'notIn',
      value: 'Test,This',
    },
    {
      field: 'firstName',
      operator: 'in',
      value: false,
    },
    {
      field: 'firstName',
      operator: 'between',
      value: 'Test,This',
    },
    {
      field: 'firstName',
      operator: 'between',
      value: ['Test', 'This'],
    },
    {
      field: 'lastName',
      operator: 'notBetween',
      value: 'Test,This',
    },
    {
      field: 'firstName',
      operator: 'between',
      value: 'MissingComma',
    },
    {
      field: 'age',
      operator: 'between',
      value: '12,14',
    },
    {
      field: 'firstName',
      operator: 'between',
      value: 'OnlyFirstElement,',
    },
    {
      field: 'firstName',
      operator: 'between',
      value: ',OnlySecondElement',
    },
    {
      field: 'age',
      operator: '=',
      value: '26',
    },
    {
      field: 'isMusician',
      operator: '=',
      value: true,
    },
    {
      id: 'g-sub1',
      combinator: 'or',
      rules: [
        {
          field: 'gender',
          operator: '=',
          value: 'M',
        },
        {
          field: 'job',
          operator: '!=',
          value: 'Programmer',
        },
        {
          field: 'email',
          operator: 'contains',
          value: '@',
        },
      ],
      not: true,
    },
    {
      id: 'g-sub2',
      combinator: 'or',
      rules: [
        {
          field: 'lastName',
          operator: 'doesNotContain',
          value: 'ab',
        },
        {
          field: 'job',
          operator: 'beginsWith',
          value: 'Prog',
        },
        {
          field: 'email',
          operator: 'endsWith',
          value: 'com',
        },
        {
          field: 'job',
          operator: 'doesNotBeginWith',
          value: 'Man',
        },
        {
          field: 'email',
          operator: 'doesNotEndWith',
          value: 'fr',
        },
      ],
      not: false,
    },
  ],
  combinator: 'and',
  not: false,
};
const mongoQuery: RuleGroupType = {
  id: 'g-root',
  combinator: 'and',
  rules: [
    {
      field: '~',
      operator: '~',
      value: 'Placeholder',
    },
    {
      field: '~',
      operator: '=',
      value: 'Placeholder',
    },
    {
      field: 'firstName',
      operator: '~',
      value: 'Placeholder',
    },
    {
      field: 'invalid',
      value: '',
      operator: 'invalid',
    },
    {
      field: 'firstName',
      value: '',
      operator: 'null',
    },
    {
      field: 'lastName',
      value: '',
      operator: 'notNull',
    },
    {
      field: 'firstName',
      value: 'Test,This',
      operator: 'in',
    },
    {
      field: 'lastName',
      value: 'Test,This',
      operator: 'notIn',
    },
    {
      field: 'firstName',
      value: false,
      operator: 'in',
    },
    {
      field: 'firstName',
      value: 'Test,This',
      operator: 'between',
    },
    {
      field: 'firstName',
      value: ['Test', 'This'],
      operator: 'between',
    },
    {
      field: 'lastName',
      value: 'Test,This',
      operator: 'notBetween',
    },
    {
      field: 'firstName',
      value: '',
      operator: 'between',
    },
    {
      field: 'firstName',
      value: false,
      operator: 'between',
    },
    {
      field: 'age',
      value: '12,14',
      operator: 'between',
    },
    {
      field: 'age',
      value: '26',
      operator: '=',
    },
    {
      field: 'isMusician',
      value: true,
      operator: '=',
    },
    {
      field: 'email',
      value: '@',
      operator: 'contains',
    },
    {
      field: 'email',
      value: 'ab',
      operator: 'beginsWith',
    },
    {
      field: 'email',
      value: 'com',
      operator: 'endsWith',
    },
    {
      field: 'hello',
      value: 'com',
      operator: 'doesNotContain',
    },
    {
      field: 'job',
      value: 'Man',
      operator: 'doesNotBeginWith',
    },
    {
      field: 'job',
      value: 'ger',
      operator: 'doesNotEndWith',
    },
    {
      id: 'g-sub1',
      combinator: 'or',
      rules: [
        {
          field: 'job',
          value: 'Sales Executive',
          operator: '=',
        },
        {
          field: 'job',
          value: [],
          operator: 'in',
        },
        {
          field: 'job',
          value: ['just one value'],
          operator: 'between',
        },
      ],
      not: false,
    },
  ],
  not: false,
};
const queryWithValueSourceField: RuleGroupType = {
  combinator: 'and',
  rules: [
    {
      field: 'firstName',
      operator: 'null',
      value: '',
      valueSource: 'field',
    },
    {
      field: 'lastName',
      operator: 'notNull',
      value: '',
      valueSource: 'field',
    },
    {
      field: 'firstName',
      operator: 'in',
      value: 'middleName,lastName',
      valueSource: 'field',
    },
    {
      field: 'lastName',
      operator: 'notIn',
      value: 'middleName,lastName',
      valueSource: 'field',
    },
    {
      field: 'firstName',
      operator: 'in',
      value: false,
      valueSource: 'field',
    },
    {
      field: 'firstName',
      operator: 'between',
      value: 'middleName,lastName',
      valueSource: 'field',
    },
    {
      field: 'firstName',
      operator: 'between',
      value: ['middleName', 'lastName'],
      valueSource: 'field',
    },
    {
      field: 'lastName',
      operator: 'notBetween',
      value: 'middleName,lastName',
      valueSource: 'field',
    },
    {
      field: 'firstName',
      operator: 'between',
      value: 'MissingComma',
      valueSource: 'field',
    },
    {
      field: 'age',
      operator: '=',
      value: 'iq',
      valueSource: 'field',
    },
    {
      field: 'isMusician',
      operator: '=',
      value: 'isCreative',
      valueSource: 'field',
    },
    {
      id: 'g-sub1',
      combinator: 'or',
      rules: [
        {
          field: 'gender',
          operator: '=',
          value: 'someLetter',
          valueSource: 'field',
        },
        {
          field: 'job',
          operator: '!=',
          value: 'isBetweenJobs',
          valueSource: 'field',
        },
        {
          field: 'email',
          operator: 'contains',
          value: 'atSign',
          valueSource: 'field',
        },
      ],
      not: true,
    },
    {
      id: 'g-sub2',
      combinator: 'or',
      rules: [
        {
          field: 'lastName',
          operator: 'doesNotContain',
          value: 'firstName',
          valueSource: 'field',
        },
        {
          field: 'job',
          operator: 'beginsWith',
          value: 'jobPrefix',
          valueSource: 'field',
        },
        {
          field: 'email',
          operator: 'endsWith',
          value: 'dotCom',
          valueSource: 'field',
        },
        {
          field: 'job',
          operator: 'doesNotBeginWith',
          value: 'hasNoJob',
          valueSource: 'field',
        },
        {
          field: 'email',
          operator: 'doesNotEndWith',
          value: 'isInvalid',
          valueSource: 'field',
        },
      ],
      not: false,
    },
  ],
};
const mongoQueryWithValueSourceField: RuleGroupType = {
  id: 'g-root',
  combinator: 'and',
  rules: [
    {
      field: 'invalid',
      operator: 'invalid',
      value: '',
      valueSource: 'field',
    },
    {
      field: 'firstName',
      operator: 'null',
      value: '',
      valueSource: 'field',
    },
    {
      field: 'lastName',
      operator: 'notNull',
      value: '',
      valueSource: 'field',
    },
    {
      field: 'firstName',
      operator: 'in',
      value: 'middleName,lastName',
      valueSource: 'field',
    },
    {
      field: 'lastName',
      operator: 'notIn',
      value: 'middleName,lastName',
      valueSource: 'field',
    },
    {
      field: 'firstName',
      operator: 'in',
      value: false,
      valueSource: 'field',
    },
    {
      field: 'firstName',
      operator: 'between',
      value: 'middleName,lastName',
      valueSource: 'field',
    },
    {
      field: 'firstName',
      operator: 'between',
      value: ['middleName', 'lastName'],
      valueSource: 'field',
    },
    {
      field: 'lastName',
      operator: 'notBetween',
      value: 'middleName,lastName',
      valueSource: 'field',
    },
    {
      field: 'firstName',
      operator: 'between',
      value: '',
      valueSource: 'field',
    },
    {
      field: 'firstName',
      operator: 'between',
      value: false,
      valueSource: 'field',
    },
    {
      field: 'age',
      operator: '=',
      value: 'iq',
      valueSource: 'field',
    },
    {
      field: 'isMusician',
      operator: '=',
      value: 'isCreative',
      valueSource: 'field',
    },
    {
      field: 'email',
      operator: 'contains',
      value: 'atSign',
      valueSource: 'field',
    },
    {
      field: 'email',
      operator: 'beginsWith',
      value: 'name',
      valueSource: 'field',
    },
    {
      field: 'email',
      operator: 'endsWith',
      value: 'dotCom',
      valueSource: 'field',
    },
    {
      field: 'hello',
      operator: 'doesNotContain',
      value: 'dotCom',
      valueSource: 'field',
    },
    {
      field: 'job',
      operator: 'doesNotBeginWith',
      value: 'noJob',
      valueSource: 'field',
    },
    {
      field: 'job',
      operator: 'doesNotEndWith',
      value: 'noJob',
      valueSource: 'field',
    },
    {
      id: 'g-sub1',
      combinator: 'or',
      rules: [
        {
          field: 'job',
          operator: '=',
          value: 'executiveJobName',
          valueSource: 'field',
        },
      ],
      not: false,
    },
  ],
  not: false,
};

const sqlString =
  "(firstName is null and lastName is not null and firstName in ('Test', 'This') and lastName not in ('Test', 'This') and firstName between 'Test' and 'This' and firstName between 'Test' and 'This' and lastName not between 'Test' and 'This' and age between '12' and '14' and age = '26' and isMusician = TRUE and NOT (gender = 'M' or job != 'Programmer' or email like '%@%') and (lastName not like '%ab%' or job like 'Prog%' or email like '%com' or job not like 'Man%' or email not like '%fr'))";
const sqlStringForValueSourceField =
  "(firstName is null and lastName is not null and firstName in (middleName, lastName) and lastName not in (middleName, lastName) and firstName between middleName and lastName and firstName between middleName and lastName and lastName not between middleName and lastName and age = iq and isMusician = isCreative and NOT (gender = someLetter or job != isBetweenJobs or email like '%' || atSign || '%') and (lastName not like '%' || firstName || '%' or job like jobPrefix || '%' or email like '%' || dotCom or job not like hasNoJob || '%' or email not like '%' || isInvalid))";
const parameterizedSQLString =
  '(firstName is null and lastName is not null and firstName in (?, ?) and lastName not in (?, ?) and firstName between ? and ? and firstName between ? and ? and lastName not between ? and ? and age between ? and ? and age = ? and isMusician = ? and NOT (gender = ? or job != ? or email like ?) and (lastName not like ? or job like ? or email like ? or job not like ? or email not like ?))';
const parameterizedNamedSQLString =
  '(firstName is null and lastName is not null and firstName in (:firstName_1, :firstName_2) and lastName not in (:lastName_1, :lastName_2) and firstName between :firstName_3 and :firstName_4 and firstName between :firstName_5 and :firstName_6 and lastName not between :lastName_3 and :lastName_4 and age between :age_1 and :age_2 and age = :age_3 and isMusician = :isMusician_1 and NOT (gender = :gender_1 or job != :job_1 or email like :email_1) and (lastName not like :lastName_5 or job like :job_2 or email like :email_2 or job not like :job_3 or email not like :email_3))';
const params = [
  'Test',
  'This',
  'Test',
  'This',
  'Test',
  'This',
  'Test',
  'This',
  'Test',
  'This',
  '12',
  '14',
  '26',
  true,
  'M',
  'Programmer',
  '%@%',
  '%ab%',
  'Prog%',
  '%com',
  'Man%',
  '%fr',
];
const params_named = {
  firstName_1: 'Test',
  firstName_2: 'This',
  lastName_1: 'Test',
  lastName_2: 'This',
  firstName_3: 'Test',
  firstName_4: 'This',
  firstName_5: 'Test',
  firstName_6: 'This',
  lastName_3: 'Test',
  lastName_4: 'This',
  age_1: '12',
  age_2: '14',
  age_3: '26',
  isMusician_1: true,
  gender_1: 'M',
  job_1: 'Programmer',
  email_1: '%@%',
  lastName_5: '%ab%',
  job_2: 'Prog%',
  email_2: '%com',
  job_3: 'Man%',
  email_3: '%fr',
};
const mongoQueryExpectation = {
  $and: [
    { firstName: null },
    { lastName: { $ne: null } },
    { firstName: { $in: ['Test', 'This'] } },
    { lastName: { $nin: ['Test', 'This'] } },
    { firstName: { $gte: 'Test', $lte: 'This' } },
    { firstName: { $gte: 'Test', $lte: 'This' } },
    { $or: [{ lastName: { $lt: 'Test' } }, { lastName: { $gt: 'This' } }] },
    { age: { $gte: 12, $lte: 14 } },
    { age: '26' },
    { isMusician: true },
    { email: { $regex: '@' } },
    { email: { $regex: '^ab' } },
    { email: { $regex: 'com$' } },
    { hello: { $not: { $regex: 'com' } } },
    { job: { $not: { $regex: '^Man' } } },
    { job: { $not: { $regex: 'ger$' } } },
    { job: 'Sales Executive' },
  ],
};
const mongoQueryExpectationForValueSourceField = {
  $and: [
    { firstName: null },
    { lastName: { $ne: null } },
    { $where: '[this.middleName,this.lastName].includes(this.firstName)' },
    { $where: '![this.middleName,this.lastName].includes(this.lastName)' },
    {
      $and: [
        { $expr: { $gte: ['$firstName', '$middleName'] } },
        { $expr: { $lte: ['$firstName', '$lastName'] } },
      ],
    },
    {
      $and: [
        { $expr: { $gte: ['$firstName', '$middleName'] } },
        { $expr: { $lte: ['$firstName', '$lastName'] } },
      ],
    },
    {
      $or: [
        { $expr: { $lt: ['$lastName', '$middleName'] } },
        { $expr: { $gt: ['$lastName', '$lastName'] } },
      ],
    },
    { $expr: { $eq: ['$age', '$iq'] } },
    { $expr: { $eq: ['$isMusician', '$isCreative'] } },
    { $where: 'this.email.includes(this.atSign)' },
    { $where: 'this.email.startsWith(this.name)' },
    { $where: 'this.email.endsWith(this.dotCom)' },
    { $where: '!this.hello.includes(this.dotCom)' },
    { $where: '!this.job.startsWith(this.noJob)' },
    { $where: '!this.job.endsWith(this.noJob)' },
    { $expr: { $eq: ['$job', '$executiveJobName'] } },
  ],
};
const celString =
  'firstName == null && lastName != null && firstName in ["Test", "This"] && !(lastName in ["Test", "This"]) && (firstName >= "Test" && firstName <= "This") && (firstName >= "Test" && firstName <= "This") && (lastName < "Test" || lastName > "This") && (age >= 12 && age <= 14) && age == "26" && isMusician == true && !(gender == "M" || job != "Programmer" || email.contains("@")) && (!lastName.contains("ab") || job.startsWith("Prog") || email.endsWith("com") || !job.startsWith("Man") || !email.endsWith("fr"))';
const celStringForValueSourceField =
  'firstName == null && lastName != null && firstName in [middleName, lastName] && !(lastName in [middleName, lastName]) && (firstName >= middleName && firstName <= lastName) && (firstName >= middleName && firstName <= lastName) && (lastName < middleName || lastName > lastName) && age == iq && isMusician == isCreative && !(gender == someLetter || job != isBetweenJobs || email.contains(atSign)) && (!lastName.contains(firstName) || job.startsWith(jobPrefix) || email.endsWith(dotCom) || !job.startsWith(hasNoJob) || !email.endsWith(isInvalid))';
const spelString =
  "firstName == null and lastName != null and (firstName == 'Test' or firstName == 'This') and !(lastName == 'Test' or lastName == 'This') and (firstName >= 'Test' and firstName <= 'This') and (firstName >= 'Test' and firstName <= 'This') and (lastName < 'Test' or lastName > 'This') and (age >= 12 and age <= 14) and age == '26' and isMusician == true and !(gender == 'M' or job != 'Programmer' or email matches '@') and (!(lastName matches 'ab') or job matches '^Prog' or email matches 'com$' or !(job matches '^Man') or !(email matches 'fr$'))";
const spelStringForValueSourceField =
  "firstName == null and lastName != null and (firstName == middleName or firstName == lastName) and !(lastName == middleName or lastName == lastName) and (firstName >= middleName and firstName <= lastName) and (firstName >= middleName and firstName <= lastName) and (lastName < middleName or lastName > lastName) and age == iq and isMusician == isCreative and !(gender == someLetter or job != isBetweenJobs or email matches atSign) and (!(lastName matches firstName) or job matches '^'.concat(jobPrefix) or email matches dotCom.concat('$') or !(job matches '^'.concat(hasNoJob)) or !(email matches isInvalid.concat('$')))";
const jsonLogicQueryObject = {
  and: [
    { '==': [{ var: 'firstName' }, null] },
    { '!=': [{ var: 'lastName' }, null] },
    { in: [{ var: 'firstName' }, ['Test', 'This']] },
    { '!': { in: [{ var: 'lastName' }, ['Test', 'This']] } },
    { '<=': ['Test', { var: 'firstName' }, 'This'] },
    { '<=': ['Test', { var: 'firstName' }, 'This'] },
    { '!': { '<=': ['Test', { var: 'lastName' }, 'This'] } },
    { '<=': [12, { var: 'age' }, 14] },
    { '==': [{ var: 'age' }, '26'] },
    { '==': [{ var: 'isMusician' }, true] },
    {
      '!': {
        or: [
          { '==': [{ var: 'gender' }, 'M'] },
          { '!=': [{ var: 'job' }, 'Programmer'] },
          { in: ['@', { var: 'email' }] },
        ],
      },
    },
    {
      or: [
        { '!': { in: ['ab', { var: 'lastName' }] } },
        { startsWith: [{ var: 'job' }, 'Prog'] },
        { endsWith: [{ var: 'email' }, 'com'] },
        { '!': { startsWith: [{ var: 'job' }, 'Man'] } },
        { '!': { endsWith: [{ var: 'email' }, 'fr'] } },
      ],
    },
  ],
};
const jsonLogicQueryObjectForValueSourceField = {
  and: [
    { '==': [{ var: 'firstName' }, null] },
    { '!=': [{ var: 'lastName' }, null] },
    {
      in: [{ var: 'firstName' }, [{ var: 'middleName' }, { var: 'lastName' }]],
    },
    {
      '!': {
        in: [{ var: 'lastName' }, [{ var: 'middleName' }, { var: 'lastName' }]],
      },
    },
    {
      '<=': [{ var: 'middleName' }, { var: 'firstName' }, { var: 'lastName' }],
    },
    {
      '<=': [{ var: 'middleName' }, { var: 'firstName' }, { var: 'lastName' }],
    },
    {
      '!': {
        '<=': [{ var: 'middleName' }, { var: 'lastName' }, { var: 'lastName' }],
      },
    },
    { '==': [{ var: 'age' }, { var: 'iq' }] },
    { '==': [{ var: 'isMusician' }, { var: 'isCreative' }] },
    {
      '!': {
        or: [
          { '==': [{ var: 'gender' }, { var: 'someLetter' }] },
          { '!=': [{ var: 'job' }, { var: 'isBetweenJobs' }] },
          { in: [{ var: 'atSign' }, { var: 'email' }] },
        ],
      },
    },
    {
      or: [
        { '!': { in: [{ var: 'firstName' }, { var: 'lastName' }] } },
        { startsWith: [{ var: 'job' }, { var: 'jobPrefix' }] },
        { endsWith: [{ var: 'email' }, { var: 'dotCom' }] },
        { '!': { startsWith: [{ var: 'job' }, { var: 'hasNoJob' }] } },
        { '!': { endsWith: [{ var: 'email' }, { var: 'isInvalid' }] } },
      ],
    },
  ],
};

it('formats JSON correctly', () => {
  expect(formatQuery(query)).toBe(JSON.stringify(query, null, 2));
  expect(formatQuery(query, {})).toBe(JSON.stringify(query, null, 2));
  expect(formatQuery(query, 'json')).toBe(JSON.stringify(query, null, 2));
  expect(formatQuery(queryWithValueSourceField)).toBe(
    JSON.stringify(queryWithValueSourceField, null, 2)
  );
  expect(formatQuery(queryWithValueSourceField, {})).toBe(
    JSON.stringify(queryWithValueSourceField, null, 2)
  );
  expect(formatQuery(queryWithValueSourceField, 'json')).toBe(
    JSON.stringify(queryWithValueSourceField, null, 2)
  );
});

it('formats SQL correctly', () => {
  expect(formatQuery(query, 'sql')).toBe(sqlString);
  expect(formatQuery(queryWithValueSourceField, 'sql')).toBe(sqlStringForValueSourceField);
  expect(formatQuery(query, { format: 'sql', valueProcessor: defaultValueProcessor })).toBe(
    sqlString
  );
});

it('formats parameterized SQL correctly', () => {
  expect(formatQuery(query, 'parameterized')).toEqual({
    sql: parameterizedSQLString,
    params: params,
  });
  expect(formatQuery(queryWithValueSourceField, 'parameterized')).toEqual({
    sql: sqlStringForValueSourceField,
    params: [],
  });
});

it('formats parameterized named SQL correctly', () => {
  expect(formatQuery(query, 'parameterized_named')).toEqual({
    sql: parameterizedNamedSQLString,
    params: params_named,
  });
  expect(formatQuery(queryWithValueSourceField, 'parameterized_named')).toEqual({
    sql: sqlStringForValueSourceField,
    params: {},
  });
});

it('formats to mongo query correctly', () => {
  expect(JSON.parse(formatQuery(mongoQuery, 'mongodb'))).toEqual(mongoQueryExpectation);
  expect(JSON.parse(formatQuery(mongoQueryWithValueSourceField, 'mongodb'))).toEqual(
    mongoQueryExpectationForValueSourceField
  );
  expect(
    JSON.parse(
      formatQuery(mongoQueryWithValueSourceField, {
        format: 'mongodb',
        valueProcessor: defaultMongoDBValueProcessor,
      })
    )
  ).toEqual(mongoQueryExpectationForValueSourceField);
});

it('formats CEL correctly', () => {
  const celQuery = add(query, { field: 'invalid', operator: 'invalid', value: '' }, []);
  expect(formatQuery(celQuery, 'cel')).toBe(celString);
  expect(formatQuery(queryWithValueSourceField, 'cel')).toBe(celStringForValueSourceField);
  expect(
    formatQuery(queryWithValueSourceField, {
      format: 'cel',
      valueProcessor: defaultCELValueProcessor,
    })
  ).toBe(celStringForValueSourceField);
  expect(
    formatQuery(
      {
        combinator: 'and',
        rules: [{ field: 'f', operator: 'between', value: [14, 12] }],
      },
      'cel'
    )
  ).toBe('(f >= 12 && f <= 14)');
});

it('formats SpEL correctly', () => {
  const spelQuery = add(query, { field: 'invalid', operator: 'invalid', value: '' }, []);
  expect(formatQuery(spelQuery, 'spel')).toBe(spelString);
  expect(formatQuery(queryWithValueSourceField, 'spel')).toBe(spelStringForValueSourceField);
  expect(
    formatQuery(queryWithValueSourceField, {
      format: 'spel',
      valueProcessor: defaultSpELValueProcessor,
    })
  ).toBe(spelStringForValueSourceField);
  expect(
    formatQuery(
      {
        combinator: 'and',
        rules: [{ field: 'f', operator: 'between', value: [14, 12] }],
      },
      'spel'
    )
  ).toBe('(f >= 12 and f <= 14)');
});

it('formats JSONLogic correctly', () => {
  // Add an empty group and a rule with a non-standard operator
  const jsonLogicQuery = add(
    add(query, { combinator: 'and', rules: [] }, []),
    { field: 'invalid', operator: 'invalid', value: '' },
    []
  );
  expect(formatQuery(jsonLogicQuery, 'jsonlogic')).toEqual(jsonLogicQueryObject);
  expect(formatQuery(queryWithValueSourceField, 'jsonlogic')).toEqual(
    jsonLogicQueryObjectForValueSourceField
  );
  expect(
    formatQuery(
      {
        combinator: 'and',
        rules: [{ field: 'f', operator: 'between', value: [14, 12] }],
      },
      'jsonlogic'
    )
  ).toEqual({ '<=': [12, { var: 'f' }, 14] });
});

it('handles invalid type correctly', () => {
  // @ts-expect-error 'null' is not a valid format
  expect(formatQuery(query, 'null')).toBe('');
});

it('handles custom valueProcessors correctly', () => {
  const queryWithArrayValue: RuleGroupType = {
    id: 'g-root',
    combinator: 'and',
    rules: [
      {
        field: 'instrument',
        value: ['Guitar', 'Vocals'],
        operator: 'in',
      },
      {
        field: 'lastName',
        value: 'Vai',
        operator: '=',
      },
    ],
    not: false,
  };

  const valueProcessorLegacy: ValueProcessorLegacy = (_field, operator, value) => {
    if (operator === 'in') {
      return `(${value.map((v: string) => `'${v.trim()}'`).join(', /* and */ ')})`;
    } else {
      return `'${value}'`;
    }
  };

  expect(
    formatQuery(queryWithArrayValue, {
      format: 'sql',
      valueProcessor: valueProcessorLegacy,
    })
  ).toBe(`(instrument in ('Guitar', /* and */ 'Vocals') and lastName = 'Vai')`);

  const queryForNewValueProcessor: RuleGroupType = {
    combinator: 'and',
    rules: [{ field: 'f1', operator: '=', value: 'v1', valueSource: 'value' }],
  };

  const valueProcessor: ValueProcessorByRule = (
    { field, operator, value, valueSource },
    { parseNumbers } = {}
  ) => `${field}-${operator}-${value}-${valueSource}-${!!parseNumbers}`;

  expect(
    formatQuery(queryForNewValueProcessor, {
      format: 'sql',
      parseNumbers: true,
      valueProcessor,
    })
  ).toBe('(f1 = f1-=-v1-value-true)');
});

it('handles quoteFieldNamesWith correctly', () => {
  const queryToTest: RuleGroupType = {
    id: 'g-root',
    combinator: 'and',
    rules: [
      {
        field: 'instrument',
        value: 'Guitar, Vocals',
        operator: 'in',
      },
      {
        field: 'lastName',
        value: 'Vai',
        operator: '=',
      },
    ],
    not: false,
  };

  expect(formatQuery(queryToTest, { format: 'sql', quoteFieldNamesWith: '`' })).toBe(
    "(`instrument` in ('Guitar', 'Vocals') and `lastName` = 'Vai')"
  );
});

it('handles custom fallbackExpression correctly', () => {
  const fallbackExpression = 'fallbackExpression';
  const queryToTest: RuleGroupType = {
    id: 'g-root',
    combinator: 'and',
    rules: [],
  };

  expect(formatQuery(queryToTest, { format: 'sql', fallbackExpression })).toBe(fallbackExpression);
});

it('handles json_without_ids correctly', () => {
  const queryToTest: RuleGroupType = {
    id: 'root',
    combinator: 'and',
    rules: [
      {
        field: 'firstName',
        value: '',
        operator: 'null',
        valueSource: 'value',
      },
    ],
    not: false,
  };
  const expectedResult =
    '{"rules":[{"field":"firstName","value":"","operator":"null","valueSource":"value"}],"combinator":"and","not":false}';
  expect(formatQuery(queryToTest, 'json_without_ids')).toBe(expectedResult);
});

it('uses paramPrefix correctly', () => {
  const queryToTest: RuleGroupType = {
    combinator: 'and',
    rules: [{ field: 'firstName', operator: '=', value: 'Test' }],
  };
  expect(
    formatQuery(queryToTest, {
      format: 'parameterized_named',
      paramPrefix: '$',
    })
  ).toEqual({
    sql: '(firstName = $firstName_1)',
    params: { firstName_1: 'Test' },
  });
});

describe('escapes quotes when appropriate', () => {
  const testQuerySQ: RuleGroupType = {
    combinator: 'and',
    rules: [{ field: 'f1', operator: '=', value: `Te'st` }],
  };

  it.each([
    { fmt: 'sql', result: `(f1 = 'Te''st')` },
    { fmt: 'parameterized', result: { sql: `(f1 = ?)`, params: [`Te'st`] } },
    {
      fmt: 'parameterized_named',
      result: { sql: `(f1 = :f1_1)`, params: { f1_1: `Te'st` } },
    },
    { fmt: 'spel', result: `f1 == 'Te\\'st'` },
  ])('escapes single quotes (if appropriate) for $fmt export', ({ fmt, result }) => {
    // @ts-expect-error Conflicting formatQuery overloads
    expect(formatQuery(testQuerySQ, fmt)).toEqual(result);
  });

  const testQueryDQ: RuleGroupType = {
    combinator: 'and',
    rules: [{ field: 'f1', operator: '=', value: `Te"st` }],
  };

  it.each([
    { fmt: 'mongodb', result: `{"f1":"Te\\"st"}` },
    { fmt: 'cel', result: `f1 == "Te\\"st"` },
  ])('escapes double quotes (if appropriate) for $fmt export', ({ fmt, result }) => {
    expect(formatQuery(testQueryDQ, fmt as 'cel' | 'mongodb')).toEqual(result);
  });
});

describe('independent combinators', () => {
  const queryIC: RuleGroupTypeIC = {
    rules: [
      { field: 'firstName', operator: '=', value: 'Test' },
      'and',
      { field: 'middleName', operator: '=', value: 'Test' },
      'or',
      { field: 'lastName', operator: '=', value: 'Test' },
    ],
  };
  it('handles independent combinators for sql', () => {
    expect(formatQuery(queryIC, 'sql')).toBe(
      `(firstName = 'Test' and middleName = 'Test' or lastName = 'Test')`
    );
  });

  it('handles independent combinators for cel', () => {
    expect(formatQuery(queryIC, 'cel')).toBe(
      `firstName == "Test" && middleName == "Test" || lastName == "Test"`
    );
  });

  it('handles independent combinators for spel', () => {
    expect(formatQuery(queryIC, 'spel')).toBe(
      `firstName == 'Test' and middleName == 'Test' or lastName == 'Test'`
    );
  });

  it('handles independent combinators for mongodb', () => {
    expect(formatQuery(queryIC, 'mongodb')).toBe(
      '{"$or":[{"$and":[{"firstName":"Test"},{"middleName":"Test"}]},{"lastName":"Test"}]}'
    );
  });

  it('handles independent combinators for jsonlogic', () => {
    expect(formatQuery(queryIC, 'jsonlogic')).toEqual({
      or: [
        {
          and: [
            { '==': [{ var: 'firstName' }, 'Test'] },
            { '==': [{ var: 'middleName' }, 'Test'] },
          ],
        },
        { '==': [{ var: 'lastName' }, 'Test'] },
      ],
    });
  });
});

describe('validation', () => {
  describe('sql', () => {
    it('should invalidate sql', () => {
      expect(
        formatQuery(
          { id: 'root', combinator: 'and', rules: [] },
          { format: 'sql', validator: () => false }
        )
      ).toBe('(1 = 1)');
    });

    it('should invalidate sql even if fields are valid', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [{ field: 'field', operator: '=', value: '' }],
          },
          {
            format: 'sql',
            validator: () => false,
            fields: [{ name: 'field', validator: () => true }],
          }
        )
      ).toBe('(1 = 1)');
    });

    it('should invalidate sql rule by validator function', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [
              { field: 'field', operator: '=', value: '' },
              { field: 'field2', operator: '=', value: '' },
            ],
          },
          {
            format: 'sql',
            fields: [
              { name: 'field', validator: () => false },
              { name: 'field3', validator: () => false },
            ],
          }
        )
      ).toBe(`(field2 = '')`);
    });

    it('should invalidate sql rule specified by validationMap', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [
              { id: 'f1', field: 'field', operator: '=', value: '' },
              { id: 'f2', field: 'field2', operator: '=', value: '' },
            ],
          },
          {
            format: 'sql',
            validator: () => ({ f1: false }),
          }
        )
      ).toBe(`(field2 = '')`);
    });

    it('should invalidate sql outermost group', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [],
          },
          {
            format: 'sql',
            validator: () => ({ root: false }),
          }
        )
      ).toBe('(1 = 1)');
    });

    it('should invalidate sql inner group', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [{ id: 'inner', combinator: 'and', rules: [] }],
          },
          {
            format: 'sql',
            validator: () => ({ inner: false }),
          }
        )
      ).toBe('()');
    });

    it('should convert sql inner group with no rules to (1 = 1)', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [
              { field: 'field', operator: '=', value: '' },
              { id: 'inner', combinator: 'and', rules: [] },
            ],
          },
          'sql'
        )
      ).toBe(`(field = '' and (1 = 1))`);
    });
  });

  describe('parameterized', () => {
    it('should invalidate parameterized rule', () => {
      const queryToTest: RuleGroupType = {
        id: 'root',
        combinator: 'and',
        rules: [
          { field: 'field', operator: '=', value: '' },
          { field: 'field2', operator: '=', value: '' },
        ],
      };
      const fields = [{ name: 'field', validator: () => false }];
      expect(
        formatQuery(queryToTest, {
          format: 'parameterized',
          fields,
        })
      ).toEqual({ sql: `(field2 = ?)`, params: [''] });
      expect(
        formatQuery(queryToTest, {
          format: 'parameterized_named',
          fields,
        })
      ).toEqual({ sql: '(field2 = :field2_1)', params: { field2_1: '' } });
    });

    it('should invalidate parameterized', () => {
      const queryToTest: RuleGroupType = {
        id: 'root',
        combinator: 'and',
        rules: [],
      };
      expect(
        formatQuery(queryToTest, {
          format: 'parameterized',
          validator: () => false,
        })
      ).toEqual({
        sql: '(1 = 1)',
        params: [],
      });
      expect(
        formatQuery(queryToTest, {
          format: 'parameterized_named',
          validator: () => false,
        })
      ).toEqual({ sql: '(1 = 1)', params: {} });
    });
  });

  describe('mongodb', () => {
    it('should invalidate a mongodb query', () => {
      expect(
        formatQuery(
          { id: 'root', combinator: 'and', rules: [] },
          { format: 'mongodb', validator: () => false }
        )
      ).toBe('{"$and":[{"$expr":true}]}');
    });

    it('should invalidate a mongodb rule', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [
              { field: 'field', operator: '=', value: '' },
              { field: 'otherfield', operator: '=', value: '' },
            ],
          },
          {
            format: 'mongodb',
            fields: [{ name: 'field', validator: () => false }],
          }
        )
      ).toBe('{"otherfield":""}');
    });

    it('should invalidate mongodb even if fields are valid', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [{ field: 'field', operator: '=', value: '' }],
          },
          {
            format: 'mongodb',
            validator: () => false,
            fields: [{ name: 'field', validator: () => true }],
          }
        )
      ).toBe('{"$and":[{"$expr":true}]}');
    });

    it('should invalidate mongodb outermost group', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [],
          },
          {
            format: 'mongodb',
            validator: () => ({ root: false }),
          }
        )
      ).toBe('{"$and":[{"$expr":true}]}');
    });

    it('should invalidate mongodb inner group', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [{ id: 'inner', combinator: 'and', rules: [] }],
          },
          {
            format: 'mongodb',
            validator: () => ({ inner: false }),
          }
        )
      ).toBe('{"$and":[{"$expr":true}]}');
    });
  });

  describe('cel', () => {
    it('should invalidate a cel query', () => {
      expect(
        formatQuery(
          { id: 'root', combinator: 'and', rules: [] },
          { format: 'cel', validator: () => false }
        )
      ).toBe('1 == 1');
    });

    it('should invalidate a cel rule', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [
              { field: 'field', operator: '=', value: '' },
              { field: 'otherfield', operator: '=', value: '' },
            ],
          },
          { format: 'cel', fields: [{ name: 'field', validator: () => false }] }
        )
      ).toBe('otherfield == ""');
    });

    it('should invalidate cel even if fields are valid', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [{ field: 'field', operator: '=', value: '' }],
          },
          {
            format: 'cel',
            validator: () => false,
            fields: [{ name: 'field', validator: () => true }],
          }
        )
      ).toBe('1 == 1');
    });

    it('should invalidate cel outermost group', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [],
          },
          {
            format: 'cel',
            validator: () => ({ root: false }),
          }
        )
      ).toBe('1 == 1');
    });

    it('should invalidate cel inner group', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [{ id: 'inner', combinator: 'and', rules: [] }],
          },
          {
            format: 'cel',
            validator: () => ({ inner: false }),
          }
        )
      ).toBe('1 == 1');
    });
  });

  describe('spel', () => {
    it('should invalidate a spel query', () => {
      expect(
        formatQuery(
          { id: 'root', combinator: 'and', rules: [] },
          { format: 'spel', validator: () => false }
        )
      ).toBe('1 == 1');
    });

    it('should invalidate a spel rule', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [
              { field: 'field', operator: '=', value: '' },
              { field: 'otherfield', operator: '=', value: '' },
            ],
          },
          {
            format: 'spel',
            fields: [{ name: 'field', validator: () => false }],
          }
        )
      ).toBe("otherfield == ''");
    });

    it('should invalidate spel even if fields are valid', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [{ field: 'field', operator: '=', value: '' }],
          },
          {
            format: 'spel',
            validator: () => false,
            fields: [{ name: 'field', validator: () => true }],
          }
        )
      ).toBe('1 == 1');
    });

    it('should invalidate spel outermost group', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [],
          },
          {
            format: 'spel',
            validator: () => ({ root: false }),
          }
        )
      ).toBe('1 == 1');
    });

    it('should invalidate spel inner group', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [{ id: 'inner', combinator: 'and', rules: [] }],
          },
          {
            format: 'spel',
            validator: () => ({ inner: false }),
          }
        )
      ).toBe('1 == 1');
    });
  });

  describe('jsonlogic', () => {
    it('should invalidate a jsonlogic query', () => {
      expect(
        formatQuery(
          { id: 'root', combinator: 'and', rules: [] },
          { format: 'jsonlogic', validator: () => false }
        )
      ).toBe(false);
    });

    it('should invalidate a jsonlogic rule', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [
              { field: 'field', operator: '=', value: '' },
              { field: 'otherfield', operator: '=', value: '' },
            ],
          },
          {
            format: 'jsonlogic',
            fields: [{ name: 'field', validator: () => false }],
          }
        )
      ).toEqual({ '==': [{ var: 'otherfield' }, ''] });
    });

    it('should invalidate jsonlogic even if fields are valid', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [{ field: 'field', operator: '=', value: '' }],
          },
          {
            format: 'jsonlogic',
            validator: () => false,
            fields: [{ name: 'field', validator: () => true }],
          }
        )
      ).toBe(false);
    });

    it('should invalidate jsonlogic outermost group', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [],
          },
          {
            format: 'jsonlogic',
            validator: () => ({ root: false }),
          }
        )
      ).toBe(false);
    });

    it('should invalidate jsonlogic inner group', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [{ id: 'inner', combinator: 'and', rules: [] }],
          },
          {
            format: 'jsonlogic',
            validator: () => ({ inner: false }),
          }
        )
      ).toBe(false);
    });
  });
});

describe('ruleProcessor', () => {
  const queryForRuleProcessor: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 'f1', operator: 'custom_operator', value: 'v1' },
      { field: 'f2', operator: '=', value: 'v2' },
    ],
  };

  it('handles custom MongoDB rule processor', () => {
    const ruleProcessor: RuleProcessor = r =>
      r.operator === 'custom_operator' ? r.operator : defaultRuleProcessorMongoDB(r);
    expect(formatQuery(queryForRuleProcessor, { format: 'mongodb', ruleProcessor })).toBe(
      '{"$and":[custom_operator,{"f2":"v2"}]}'
    );
    expect(
      formatQuery(queryForRuleProcessor, { format: 'mongodb', valueProcessor: ruleProcessor })
    ).toBe('{"$and":[custom_operator,{"f2":"v2"}]}');
  });

  it('handles custom CEL rule processor', () => {
    const ruleProcessor: RuleProcessor = r =>
      r.operator === 'custom_operator' ? r.operator : defaultRuleProcessorCEL(r);
    expect(formatQuery(queryForRuleProcessor, { format: 'cel', ruleProcessor })).toBe(
      'custom_operator && f2 == "v2"'
    );
    expect(
      formatQuery(queryForRuleProcessor, { format: 'cel', valueProcessor: ruleProcessor })
    ).toBe('custom_operator && f2 == "v2"');
  });

  it('handles custom SpEL rule processor', () => {
    const ruleProcessor: RuleProcessor = r =>
      r.operator === 'custom_operator' ? r.operator : defaultRuleProcessorSpEL(r);
    expect(formatQuery(queryForRuleProcessor, { format: 'spel', ruleProcessor })).toBe(
      "custom_operator and f2 == 'v2'"
    );
    expect(
      formatQuery(queryForRuleProcessor, { format: 'spel', valueProcessor: ruleProcessor })
    ).toBe("custom_operator and f2 == 'v2'");
  });

  it('handles custom JsonLogic rule processor', () => {
    const ruleProcessor: RuleProcessor = r =>
      r.operator === 'custom_operator'
        ? { [r.operator]: [{ var: r.field }, r.value] }
        : defaultRuleProcessorJsonLogic(r);
    expect(formatQuery(queryForRuleProcessor, { format: 'jsonlogic', ruleProcessor })).toEqual({
      and: [{ custom_operator: [{ var: 'f1' }, 'v1'] }, { '==': [{ var: 'f2' }, 'v2'] }],
    });
    expect(
      formatQuery(queryForRuleProcessor, { format: 'jsonlogic', valueProcessor: ruleProcessor })
    ).toEqual({
      and: [{ custom_operator: [{ var: 'f1' }, 'v1'] }, { '==': [{ var: 'f2' }, 'v2'] }],
    });
  });
});

describe('parseNumbers', () => {
  const queryForNumberParsing: RuleGroupType = {
    combinator: 'and',
    rules: [
      {
        field: 'f',
        operator: '>',
        value: 'NaN',
      },
      {
        field: 'f',
        operator: '=',
        value: '0',
      },
      {
        field: 'f',
        operator: '=',
        value: '    0    ',
      },
      {
        field: 'f',
        operator: '=',
        value: 0,
      },
      {
        combinator: 'or',
        rules: [
          {
            field: 'f',
            operator: '<',
            value: '1.5',
          },
          {
            field: 'f',
            operator: '>',
            value: 1.5,
          },
        ],
      },
      {
        field: 'f',
        operator: 'in',
        value: '0, 1, 2',
      },
      {
        field: 'f',
        operator: 'in',
        value: [0, 1, 2],
      },
      {
        field: 'f',
        operator: 'in',
        value: '0, abc, 2',
      },
      {
        field: 'f',
        operator: 'between',
        value: '0, 1',
      },
      {
        field: 'f',
        operator: 'between',
        value: [0, 1],
      },
      {
        field: 'f',
        operator: 'between',
        value: '0, abc',
      },
      {
        field: 'f',
        operator: 'between',
        value: '1',
      },
      {
        field: 'f',
        operator: 'between',
        value: 1,
      },
      {
        field: 'f',
        operator: 'between',
        value: [1],
      },
      {
        field: 'f',
        operator: 'between',
        value: [{}, {}],
      },
    ],
  };
  it('parses numbers for json', () => {
    expect(formatQuery(queryForNumberParsing, { format: 'json', parseNumbers: true })).toBe(
      `{
  "combinator": "and",
  "rules": [
    {
      "field": "f",
      "operator": ">",
      "value": "NaN"
    },
    {
      "field": "f",
      "operator": "=",
      "value": 0
    },
    {
      "field": "f",
      "operator": "=",
      "value": 0
    },
    {
      "field": "f",
      "operator": "=",
      "value": 0
    },
    {
      "combinator": "or",
      "rules": [
        {
          "field": "f",
          "operator": "<",
          "value": 1.5
        },
        {
          "field": "f",
          "operator": ">",
          "value": 1.5
        }
      ]
    },
    {
      "field": "f",
      "operator": "in",
      "value": "0, 1, 2"
    },
    {
      "field": "f",
      "operator": "in",
      "value": [
        0,
        1,
        2
      ]
    },
    {
      "field": "f",
      "operator": "in",
      "value": "0, abc, 2"
    },
    {
      "field": "f",
      "operator": "between",
      "value": "0, 1"
    },
    {
      "field": "f",
      "operator": "between",
      "value": [
        0,
        1
      ]
    },
    {
      "field": "f",
      "operator": "between",
      "value": "0, abc"
    },
    {
      "field": "f",
      "operator": "between",
      "value": 1
    },
    {
      "field": "f",
      "operator": "between",
      "value": 1
    },
    {
      "field": "f",
      "operator": "between",
      "value": [
        1
      ]
    },
    {
      "field": "f",
      "operator": "between",
      "value": [
        {},
        {}
      ]
    }
  ]
}`
    );
  });
  it('parses numbers for json_without_ids', () => {
    expect(
      formatQuery(queryForNumberParsing, {
        format: 'json_without_ids',
        parseNumbers: true,
      })
    ).toBe(
      '{"rules":[{"field":"f","value":"NaN","operator":">"},{"field":"f","value":0,"operator":"="},{"field":"f","value":0,"operator":"="},{"field":"f","value":0,"operator":"="},{"rules":[{"field":"f","value":1.5,"operator":"<"},{"field":"f","value":1.5,"operator":">"}],"combinator":"or"},{"field":"f","value":"0, 1, 2","operator":"in"},{"field":"f","value":[0,1,2],"operator":"in"},{"field":"f","value":"0, abc, 2","operator":"in"},{"field":"f","value":"0, 1","operator":"between"},{"field":"f","value":[0,1],"operator":"between"},{"field":"f","value":"0, abc","operator":"between"},{"field":"f","value":1,"operator":"between"},{"field":"f","value":1,"operator":"between"},{"field":"f","value":[1],"operator":"between"},{"field":"f","value":[{},{}],"operator":"between"}],"combinator":"and"}'
    );
  });
  it('parses numbers for json_without_ids with independentCombinators', () => {
    expect(
      formatQuery(convertToIC(queryForNumberParsing), {
        format: 'json_without_ids',
        parseNumbers: true,
      })
    ).toBe(
      '{"rules":[{"field":"f","value":"NaN","operator":">"},"and",{"field":"f","value":0,"operator":"="},"and",{"field":"f","value":0,"operator":"="},"and",{"field":"f","value":0,"operator":"="},"and",{"rules":[{"field":"f","value":1.5,"operator":"<"},"or",{"field":"f","value":1.5,"operator":">"}]},"and",{"field":"f","value":"0, 1, 2","operator":"in"},"and",{"field":"f","value":[0,1,2],"operator":"in"},"and",{"field":"f","value":"0, abc, 2","operator":"in"},"and",{"field":"f","value":"0, 1","operator":"between"},"and",{"field":"f","value":[0,1],"operator":"between"},"and",{"field":"f","value":"0, abc","operator":"between"},"and",{"field":"f","value":1,"operator":"between"},"and",{"field":"f","value":1,"operator":"between"},"and",{"field":"f","value":[1],"operator":"between"},"and",{"field":"f","value":[{},{}],"operator":"between"}]}'
    );
  });
  it('parses numbers for sql', () => {
    expect(formatQuery(queryForNumberParsing, { format: 'sql', parseNumbers: true })).toBe(
      "(f > 'NaN' and f = 0 and f = 0 and f = 0 and (f < 1.5 or f > 1.5) and f in (0, 1, 2) and f in (0, 1, 2) and f in (0, 'abc', 2) and f between 0 and 1 and f between 0 and 1 and f between '0' and 'abc' and f between '[object Object]' and '[object Object]')"
    );
  });
  it('parses numbers for parameterized', () => {
    expect(
      formatQuery(queryForNumberParsing, {
        format: 'parameterized',
        parseNumbers: true,
      })
    ).toHaveProperty('params', [
      'NaN',
      0,
      0,
      0,
      1.5,
      1.5,
      0,
      1,
      2,
      0,
      1,
      2,
      0,
      'abc',
      2,
      0,
      1,
      0,
      1,
      0,
      'abc',
      {},
      {},
    ]);
  });
  it('parses numbers for parameterized_named', () => {
    expect(
      formatQuery(queryForNumberParsing, {
        format: 'parameterized_named',
        parseNumbers: true,
      })
    ).toHaveProperty('params', {
      f_1: 'NaN',
      f_2: 0,
      f_3: 0,
      f_4: 0,
      f_5: 1.5,
      f_6: 1.5,
      f_7: 0,
      f_8: 1,
      f_9: 2,
      f_10: 0,
      f_11: 1,
      f_12: 2,
      f_13: 0,
      f_14: 'abc',
      f_15: 2,
      f_16: 0,
      f_17: 1,
      f_18: 0,
      f_19: 1,
      f_20: 0,
      f_21: 'abc',
      f_22: {},
      f_23: {},
    });
  });
  it('parses numbers for mongodb', () => {
    expect(
      formatQuery(queryForNumberParsing, {
        format: 'mongodb',
        parseNumbers: true,
      })
    ).toBe(
      '{"$and":[{"f":{"$gt":"NaN"}},{"f":0},{"f":0},{"f":0},{"$or":[{"f":{"$lt":1.5}},{"f":{"$gt":1.5}}]},{"f":{"$in":[0,1,2]}},{"f":{"$in":[0,1,2]}},{"f":{"$in":[0,"abc",2]}},{"f":{"$gte":0,"$lte":1}},{"f":{"$gte":0,"$lte":1}},{"f":{"$gte":0,"$lte":"abc"}},{"f":{"$gte":"[object Object]","$lte":"[object Object]"}}]}'
    );
  });
  it('parses numbers for cel', () => {
    expect(formatQuery(queryForNumberParsing, { format: 'cel', parseNumbers: true })).toBe(
      'f > "NaN" && f == 0 && f == 0 && f == 0 && (f < 1.5 || f > 1.5) && f in [0, 1, 2] && f in [0, 1, 2] && f in [0, "abc", 2] && (f >= 0 && f <= 1) && (f >= 0 && f <= "abc") && (f >= "[object Object]" && f <= "[object Object]")'
    );
    const queryForNumberParsingCEL: RuleGroupType = {
      combinator: 'and',
      rules: [
        { field: 'f', operator: 'beginsWith', value: 1 },
        { field: 'f', operator: 'endsWith', value: 1 },
      ],
    };
    expect(
      formatQuery(queryForNumberParsingCEL, {
        format: 'cel',
        parseNumbers: true,
      })
    ).toBe(`f.startsWith("1") && f.endsWith("1")`);
  });
  it('parses numbers for spel', () => {
    expect(formatQuery(queryForNumberParsing, { format: 'spel', parseNumbers: true })).toBe(
      "f > 'NaN' and f == 0 and f == 0 and f == 0 and (f < 1.5 or f > 1.5) and (f == 0 or f == 1 or f == 2) and (f == 0 or f == 1 or f == 2) and (f == 0 or f == 'abc' or f == 2) and (f >= 0 and f <= 1) and (f >= 0 and f <= 'abc') and (f >= '[object Object]' and f <= '[object Object]')"
    );
    const queryForNumberParsingSpEL: RuleGroupType = {
      combinator: 'and',
      rules: [
        { field: 'f', operator: 'beginsWith', value: 1 },
        { field: 'f', operator: 'beginsWith', value: '^hasCaret' },
        { field: 'f', operator: 'endsWith', value: 1 },
        { field: 'f', operator: 'endsWith', value: 'hasDollarSign$' },
      ],
    };
    expect(
      formatQuery(queryForNumberParsingSpEL, {
        format: 'spel',
        parseNumbers: true,
      })
    ).toBe(
      `f matches '^1' and f matches '^hasCaret' and f matches '1$' and f matches 'hasDollarSign$'`
    );
  });
  it('parses numbers for jsonlogic', () => {
    expect(
      formatQuery(queryForNumberParsing, {
        format: 'jsonlogic',
        parseNumbers: true,
      })
    ).toEqual({
      and: [
        { '>': [{ var: 'f' }, 'NaN'] },
        { '==': [{ var: 'f' }, 0] },
        { '==': [{ var: 'f' }, 0] },
        { '==': [{ var: 'f' }, 0] },
        { or: [{ '<': [{ var: 'f' }, 1.5] }, { '>': [{ var: 'f' }, 1.5] }] },
        { in: [{ var: 'f' }, [0, 1, 2]] },
        { in: [{ var: 'f' }, [0, 1, 2]] },
        { in: [{ var: 'f' }, [0, 'abc', 2]] },
        { '<=': [0, { var: 'f' }, 1] },
        { '<=': [0, { var: 'f' }, 1] },
        { '<=': ['0', { var: 'f' }, 'abc'] },
        { '<=': [{}, { var: 'f' }, {}] },
      ],
    });
  });
});

describe('placeholder names', () => {
  const placeholderFieldName = 'placeholderFieldName';
  const placeholderOperatorName = 'placeholderOperatorName';

  const queryForPlaceholders: RuleGroupType = {
    combinator: 'and',
    rules: [
      {
        field: defaultPlaceholderFieldName,
        operator: defaultPlaceholderOperatorName,
        value: 'v1',
      },
      { field: placeholderFieldName, operator: '=', value: 'v2' },
      { field: 'f3', operator: placeholderOperatorName, value: 'v3' },
      {
        field: placeholderFieldName,
        operator: placeholderOperatorName,
        value: 'v4',
      },
    ],
  };

  it('respects custom placeholder names', () => {
    expect(
      formatQuery(queryForPlaceholders, {
        format: 'sql',
        placeholderFieldName,
        placeholderOperatorName,
      })
    ).toBe(`(${defaultPlaceholderFieldName} ${defaultPlaceholderOperatorName} 'v1')`);
  });
});

describe('non-standard combinators', () => {
  const queryForXor: RuleGroupType = {
    combinator: 'xor',
    rules: [
      { field: 'f1', operator: '=', value: 'v1' },
      { field: 'f2', operator: '=', value: 'v2' },
    ],
  };

  it('handles XOR operator', () => {
    expect(formatQuery(queryForXor, 'sql')).toBe(`(f1 = 'v1' xor f2 = 'v2')`);
  });
});

describe('misc', () => {
  it('runs the jsonLogic additional operators', () => {
    const { startsWith, endsWith } = jsonLogicAdditionalOperators;
    expect(startsWith('TestString', 'Test')).toBe(true);
    expect(endsWith('TestString', 'String')).toBe(true);
  });
});
