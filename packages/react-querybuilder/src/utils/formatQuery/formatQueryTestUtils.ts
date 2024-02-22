import {
  defaultPlaceholderFieldName as defaultFieldPlaceholder,
  defaultPlaceholderOperatorName as defaultOperatorPlaceholder,
} from '../../defaults';
import type { RuleGroupType } from '../../types';

export const query: RuleGroupType = {
  id: 'g-root',
  rules: [
    { field: defaultFieldPlaceholder, operator: defaultOperatorPlaceholder, value: 'Placeholder' },
    { field: defaultFieldPlaceholder, operator: '=', value: 'Placeholder' },
    { field: 'firstName', operator: defaultOperatorPlaceholder, value: 'Placeholder' },
    { field: 'firstName', operator: 'null', value: '' },
    { field: 'lastName', operator: 'notNull', value: '' },
    { field: 'firstName', operator: 'in', value: 'Test,This' },
    { field: 'lastName', operator: 'notIn', value: 'Test,This' },
    { field: 'firstName', operator: 'in', value: false },
    { field: 'firstName', operator: 'between', value: 'Test,This' },
    { field: 'firstName', operator: 'between', value: ['Test', 'This'] },
    { field: 'lastName', operator: 'notBetween', value: 'Test,This' },
    { field: 'firstName', operator: 'between', value: 'MissingComma' },
    { field: 'age', operator: 'between', value: '12,14' },
    { field: 'firstName', operator: 'between', value: 'OnlyFirstElement,' },
    { field: 'firstName', operator: 'between', value: ',OnlySecondElement' },
    { field: 'age', operator: '=', value: '26' },
    { field: 'isMusician', operator: '=', value: true },
    { field: 'isLucky', operator: '=', value: false },
    {
      id: 'g-sub1',
      combinator: 'or',
      rules: [
        { field: 'gender', operator: '=', value: 'M' },
        { field: 'job', operator: '!=', value: 'Programmer' },
        { field: 'email', operator: 'contains', value: '@' },
      ],
      not: true,
    },
    {
      id: 'g-sub2',
      combinator: 'or',
      rules: [
        { field: 'lastName', operator: 'doesNotContain', value: 'ab' },
        { field: 'job', operator: 'beginsWith', value: 'Prog' },
        { field: 'email', operator: 'endsWith', value: 'com' },
        { field: 'job', operator: 'doesNotBeginWith', value: 'Man' },
        { field: 'email', operator: 'doesNotEndWith', value: 'fr' },
      ],
      not: false,
    },
  ],
  combinator: 'and',
  not: false,
};

export const queryWithValueSourceField: RuleGroupType = {
  combinator: 'and',
  rules: [
    { field: 'firstName', operator: 'null', value: '', valueSource: 'field' },
    { field: 'lastName', operator: 'notNull', value: '', valueSource: 'field' },
    { field: 'firstName', operator: 'in', value: 'middleName,lastName', valueSource: 'field' },
    { field: 'lastName', operator: 'notIn', value: 'middleName,lastName', valueSource: 'field' },
    { field: 'firstName', operator: 'in', value: false, valueSource: 'field' },
    { field: 'firstName', operator: 'between', value: 'middleName,lastName', valueSource: 'field' },
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
    { field: 'firstName', operator: 'between', value: 'MissingComma', valueSource: 'field' },
    { field: 'age', operator: '=', value: 'iq', valueSource: 'field' },
    { field: 'isMusician', operator: '=', value: 'isCreative', valueSource: 'field' },
    {
      id: 'g-sub1',
      combinator: 'or',
      rules: [
        { field: 'gender', operator: '=', value: 'someLetter', valueSource: 'field' },
        { field: 'job', operator: '!=', value: 'isBetweenJobs', valueSource: 'field' },
        { field: 'email', operator: 'contains', value: 'atSign', valueSource: 'field' },
      ],
      not: true,
    },
    {
      id: 'g-sub2',
      combinator: 'or',
      rules: [
        { field: 'lastName', operator: 'doesNotContain', value: 'firstName', valueSource: 'field' },
        { field: 'job', operator: 'beginsWith', value: 'jobPrefix', valueSource: 'field' },
        { field: 'email', operator: 'endsWith', value: 'dotCom', valueSource: 'field' },
        { field: 'job', operator: 'doesNotBeginWith', value: 'hasNoJob', valueSource: 'field' },
        { field: 'email', operator: 'doesNotEndWith', value: 'isInvalid', valueSource: 'field' },
      ],
      not: false,
    },
  ],
};

export const sqlString =
  "(firstName is null and lastName is not null and firstName in ('Test', 'This') and lastName not in ('Test', 'This') and firstName between 'Test' and 'This' and firstName between 'Test' and 'This' and lastName not between 'Test' and 'This' and age between '12' and '14' and age = '26' and isMusician = TRUE and isLucky = FALSE and NOT (gender = 'M' or job != 'Programmer' or email like '%@%') and (lastName not like '%ab%' or job like 'Prog%' or email like '%com' or job not like 'Man%' or email not like '%fr'))";
export const sqlStringForValueSourceField =
  "(firstName is null and lastName is not null and firstName in (middleName, lastName) and lastName not in (middleName, lastName) and firstName between middleName and lastName and firstName between middleName and lastName and lastName not between middleName and lastName and age = iq and isMusician = isCreative and NOT (gender = someLetter or job != isBetweenJobs or email like '%' || atSign || '%') and (lastName not like '%' || firstName || '%' or job like jobPrefix || '%' or email like '%' || dotCom or job not like hasNoJob || '%' or email not like '%' || isInvalid))";
export const parameterizedSQLString =
  '(firstName is null and lastName is not null and firstName in (?, ?) and lastName not in (?, ?) and firstName between ? and ? and firstName between ? and ? and lastName not between ? and ? and age between ? and ? and age = ? and isMusician = ? and isLucky = ? and NOT (gender = ? or job != ? or email like ?) and (lastName not like ? or job like ? or email like ? or job not like ? or email not like ?))';
export const parameterizedNamedSQLString =
  '(firstName is null and lastName is not null and firstName in (:firstName_1, :firstName_2) and lastName not in (:lastName_1, :lastName_2) and firstName between :firstName_3 and :firstName_4 and firstName between :firstName_5 and :firstName_6 and lastName not between :lastName_3 and :lastName_4 and age between :age_1 and :age_2 and age = :age_3 and isMusician = :isMusician_1 and isLucky = :isLucky_1 and NOT (gender = :gender_1 or job != :job_1 or email like :email_1) and (lastName not like :lastName_5 or job like :job_2 or email like :email_2 or job not like :job_3 or email not like :email_3))';
export const params = [
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
  false,
  'M',
  'Programmer',
  '%@%',
  '%ab%',
  'Prog%',
  '%com',
  'Man%',
  '%fr',
];
export const params_named = {
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
  isLucky_1: false,
  gender_1: 'M',
  job_1: 'Programmer',
  email_1: '%@%',
  lastName_5: '%ab%',
  job_2: 'Prog%',
  email_2: '%com',
  job_3: 'Man%',
  email_3: '%fr',
};
