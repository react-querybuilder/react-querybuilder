/// <reference types="bun-types" />

import { Database } from 'bun:sqlite';
import type { RuleGroupType } from '../../types';
import { formatQuery } from './formatQuery';

const db = new Database();
db.run('CREATE TABLE fq (firstName TEXT, lastName TEXT)');
db.run(`INSERT INTO fq (firstName, lastName) VALUES ('Peter', 'Parker')`);
db.run(`INSERT INTO fq (firstName, lastName) VALUES ('Clark', 'Kent')`);
db.run(`INSERT INTO fq (firstName, lastName) VALUES ('Steve', 'Rogers')`);
db.run(`INSERT INTO fq (firstName, lastName) VALUES ('Bruce', 'Wayne')`);

const queryBase = `SELECT * FROM fq WHERE 1=1 AND `;
const ruleGroup: RuleGroupType = {
  combinator: 'and',
  rules: [
    { field: 'firstName', operator: 'beginsWith', value: 'P' },
    { field: 'lastName', operator: 'beginsWith', value: 'P' },
  ],
};
const expectedResult = [{ firstName: 'Peter', lastName: 'Parker' }];

it('sql', () => {
  const sql = formatQuery(ruleGroup, 'sql');
  const select = db.prepare(`${queryBase} ${sql}`);
  expect(select.all()).toEqual(expectedResult);
});

it('parameterized', () => {
  const parameterized = formatQuery(ruleGroup, 'parameterized');
  const selectParam = db.prepare(`${queryBase} ${parameterized.sql}`);
  expect(selectParam.all(...parameterized.params)).toEqual(expectedResult);
});

it('parameterized_named', () => {
  const parameterizedNamed = formatQuery(ruleGroup, {
    format: 'parameterized_named',
    paramsKeepPrefix: true,
  });
  const selectParamNamed = db.prepare(`${queryBase} ${parameterizedNamed.sql}`);
  expect(selectParamNamed.all(parameterizedNamed.params)).toEqual(expectedResult);
});
