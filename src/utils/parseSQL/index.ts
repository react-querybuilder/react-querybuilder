import { isRuleGroup } from '..';
import { RuleType } from '../..';
import { ParseSQLOptions, RuleGroupType } from '../../types';
import sqlParser, { WhereObject } from './sqlParser';

const getParamString = (param: any) => {
  switch (typeof param) {
    case 'number':
      return `${param}`;
    case 'boolean':
      return param ? 'TRUE' : 'FALSE';
    default:
      return `'${param}'`;
  }
};

const processWhereObject = (token: WhereObject): RuleType | RuleGroupType | null => {
  if (token.type === 'IsNullBooleanPrimary') {
    if (
      !Array.isArray(token.value) &&
      typeof token.value === 'object' &&
      token.value.type === 'Identifier'
    ) {
      return {
        field: token.value.value as string,
        operator: token.hasNot ? 'notNull' : 'null',
        value: null
      };
    }
  } else if (token.type === 'ComparisonBooleanPrimary') {
    if (
      (token.left?.type === 'Identifier' || token.right?.type === 'Identifier') &&
      token.left?.type !== token.right?.type
    ) {
      const field = [token.left, token.right].find((t) => t?.type === 'Identifier')
        ?.value as string;
      const valueObj = [token.left, token.right].find((t) => t?.type !== 'Identifier');
      return {
        field,
        operator: token.operator!,
        value:
          valueObj?.type === 'String'
            ? (valueObj.value as string).replace(/(^'|'$)/g, '')
            : valueObj?.value
      };
    }
  }
  return null;
};

const parseSQL = (sql: string, options?: ParseSQLOptions): RuleGroupType => {
  let sqlString = /^[ \t\n\r]?SELECT\b/i.test(sql) ? sql : `SELECT * FROM mesa WHERE ${sql}`;
  if (options) {
    const { params, paramPrefix } = options;
    if (params) {
      if (Array.isArray(params)) {
        let i = 0;
        sqlString = sqlString.replace(/\b\?\b/g, () => {
          const paramString = getParamString(params[i]);
          i++;
          return paramString;
        });
      } else {
        const keys = Object.keys(params);
        const prefix = paramPrefix ?? ':';
        keys.forEach((p) => {
          sqlString = sqlString.replace(
            new RegExp(`\\b\\${prefix}${p}\\b`, 'ig'),
            getParamString(params[p])
          );
        });
      }
    }
  }
  const { where } = sqlParser.parse(sqlString).value;
  const result = processWhereObject(where);
  if (result) {
    if (isRuleGroup(result)) {
      return result;
    }
    return { combinator: 'and', rules: [result] };
  }
  return { combinator: 'and', rules: [] };
};

export default parseSQL;
