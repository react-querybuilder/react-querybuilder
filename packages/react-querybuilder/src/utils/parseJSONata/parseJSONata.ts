import jsonata from 'jsonata';
import type {
  DefaultCombinatorName,
  DefaultOperatorName,
  DefaultRuleGroupArray,
  DefaultRuleGroupICArray,
  DefaultRuleGroupType,
  DefaultRuleGroupTypeAny,
  DefaultRuleGroupTypeIC,
  DefaultRuleType,
  ParseJSONataOptions,
  ValueSource,
} from '../../types/index.noReact';
import { isRuleGroup } from '../isRuleGroup';
import { fieldIsValidUtil, getFieldsArray } from '../parserUtils';
import type { JSONataExprNode } from './types';
import {
  generateFlatAndOrList,
  generateMixedAndOrList,
  getFieldFromPath,
  getValidValue,
  isJSONataAnd,
  isJSONataBlock,
  isJSONataComparison,
  isJSONataContains,
  isJSONataIdentifier,
  isJSONataIdentifierList,
  isJSONataIn,
  isJSONataNot,
  isJSONataOr,
  isJSONataRegex,
  isJSONataString,
  isJSONataValidValue,
  negatedLikeOperators,
  normalizeOperator,
} from './utils';

/**
 * Converts a JSONata string expression into a query suitable for the
 * {@link QueryBuilder} component's `query` or `defaultQuery` props
 * ({@link DefaultRuleGroupType}).
 */
function parseJSONata(jsonataInput: string): DefaultRuleGroupType;
/**
 * Converts a JSONata string expression into a query suitable for the
 * {@link QueryBuilder} component's `query` or `defaultQuery` props
 * ({@link DefaultRuleGroupType}).
 */
function parseJSONata(
  jsonataInput: string,
  options: Omit<ParseJSONataOptions, 'independentCombinators'> & {
    independentCombinators?: false;
  }
): DefaultRuleGroupType;
/**
 * Converts a JSONata string expression into a query suitable for the
 * {@link QueryBuilder} component's `query` or `defaultQuery` props
 * ({@link DefaultRuleGroupTypeIC}).
 */
function parseJSONata(
  jsonataInput: string,
  options: Omit<ParseJSONataOptions, 'independentCombinators'> & {
    independentCombinators: true;
  }
): DefaultRuleGroupTypeIC;
function parseJSONata(
  jsonataInput: string,
  options: ParseJSONataOptions = {}
): DefaultRuleGroupTypeAny {
  const { fields, independentCombinators, listsAsArrays: _laa } = options;
  const ic = !!independentCombinators;
  const fieldsFlat = getFieldsArray(fields);

  const fieldIsValid = (
    fieldName: string,
    operator: DefaultOperatorName,
    subordinateFieldName?: string
  ) =>
    fieldIsValidUtil({
      fieldName,
      fieldsFlat,
      operator,
      subordinateFieldName,
      getValueSources: options?.getValueSources,
    });

  const emptyQuery: DefaultRuleGroupTypeAny = {
    rules: [],
    ...(ic ? {} : { combinator: 'and' }),
  };

  const parseJSONataAST = (
    expr: JSONataExprNode,
    processOpts: {
      groupOnlyIfNecessary?: boolean;
      forwardNegation?: boolean;
    } = {}
  ): DefaultRuleType | DefaultRuleGroupTypeAny | null => {
    const { forwardNegation: _forwardedNegation, groupOnlyIfNecessary: _g } = processOpts;
    if (isJSONataBlock(expr)) {
      if (
        isJSONataAnd(expr.expressions[0]) ||
        isJSONataOr(expr.expressions[0]) ||
        isJSONataBlock(expr.expressions[0])
      ) {
        return parseJSONataAST(expr.expressions[0]);
      }
      const blockOfExpr = parseJSONataAST(expr.expressions[0]);
      // istanbul ignore else
      if (blockOfExpr) {
        return ic
          ? ({ rules: [blockOfExpr] } as DefaultRuleGroupTypeIC)
          : ({
              combinator: 'and',
              rules: [blockOfExpr],
            } as DefaultRuleGroupType);
      }
    } else if (isJSONataAnd(expr) || isJSONataOr(expr)) {
      if (ic) {
        const andOrList = generateFlatAndOrList(expr);
        const rules = andOrList.map(v => {
          if (typeof v === 'string') {
            return v;
          }
          return parseJSONataAST(v);
        });
        // Bail out completely if any rules in the list were invalid
        // so as not to return an incorrect and/or sequence
        if (!rules.every(Boolean)) {
          return null;
        }
        return {
          rules: rules as DefaultRuleGroupICArray,
        };
      }
      const andOrList = generateMixedAndOrList(expr);
      const combinator = andOrList[1] as DefaultCombinatorName;
      const filteredList = andOrList
        .filter(v => Array.isArray(v) || (!!v && typeof v !== 'string' && 'type' in v))
        .map(v =>
          Array.isArray(v) ? v.filter(vf => !!v && typeof vf !== 'string' && 'type' in vf) : v
        ) as (JSONataExprNode | JSONataExprNode[])[];
      const rules = filteredList
        .map((exp): DefaultRuleGroupType | DefaultRuleType | null => {
          if (Array.isArray(exp)) {
            return {
              combinator: 'and',
              rules: exp.map(e => parseJSONataAST(e)).filter(Boolean) as DefaultRuleGroupArray,
            };
          }
          return parseJSONataAST(exp) as DefaultRuleType | DefaultRuleGroupType | null;
        })
        .filter(Boolean) as DefaultRuleGroupArray;
      // istanbul ignore else
      if (rules.length > 0) {
        return { combinator, rules };
      }
    } else if (isJSONataNot(expr)) {
      const negatedExpr = parseJSONataAST(expr.arguments[0]);
      // istanbul ignore else
      if (negatedExpr) {
        if (
          !isRuleGroup(negatedExpr) &&
          (negatedExpr.operator === 'contains' ||
            negatedExpr.operator === 'beginsWith' ||
            negatedExpr.operator === 'endsWith')
        ) {
          return {
            ...negatedExpr,
            operator: negatedLikeOperators[negatedExpr.operator],
          };
        }
        return ic
          ? ({ rules: [negatedExpr], not: true } as DefaultRuleGroupTypeIC)
          : ({
              combinator: 'and',
              rules: [negatedExpr],
              not: true,
            } as DefaultRuleGroupType);
      }
    } else if (isJSONataContains(expr)) {
      const [arg1, arg2] = expr.arguments;
      let field: string = '';
      let regex: string | RegExp = '';
      let valueSource: ValueSource | undefined = undefined;
      // istanbul ignore else
      if (isJSONataIdentifier(arg1)) {
        field = getFieldFromPath(arg1);
        if (isJSONataIdentifier(arg2)) {
          regex = getFieldFromPath(arg2);
          valueSource = 'field';
        } else {
          // istanbul ignore else
          if (isJSONataString(arg2) || isJSONataRegex(arg2)) {
            regex = getValidValue(arg2);
          }
        }
      }

      // istanbul ignore else
      if (
        valueSource === 'field'
          ? fieldIsValid(field, 'contains', regex as string)
          : fieldIsValid(field, 'contains')
      ) {
        return {
          field,
          operator: 'contains',
          value: regex,
          ...(valueSource ? { valueSource } : {}),
        };
      }
    } else if (isJSONataIn(expr)) {
      const field = getFieldFromPath(expr.lhs);
      let valueSource: ValueSource | undefined = undefined;
      if (isJSONataIdentifierList(expr.rhs)) {
        valueSource = 'field';
      }
      if (isJSONataValidValue(expr.rhs)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value: any[] = getValidValue(expr.rhs);
        // istanbul ignore else
        if (
          field &&
          value.every(v => fieldIsValid(field, 'in', valueSource === 'field' ? v : undefined))
        ) {
          return { field, operator: 'in', value, ...(valueSource ? { valueSource } : {}) };
        }
      }
    } else if (isJSONataComparison(expr)) {
      let field: string | null = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let value: any = undefined;
      let valueSource: ValueSource | undefined = undefined;
      let flip = false;
      const { lhs, rhs } = expr;

      if (isJSONataIdentifier(lhs) && isJSONataValidValue(rhs)) {
        field = getFieldFromPath(lhs);
        value = getValidValue(rhs);
        if (isJSONataIdentifier(rhs)) {
          valueSource = 'field';
        }
      } else {
        // istanbul ignore else
        if (isJSONataIdentifier(rhs) && isJSONataValidValue(lhs)) {
          flip = true;
          field = getFieldFromPath(rhs);
          value = getValidValue(lhs);
        }
      }
      let operator = normalizeOperator(expr.value, flip);
      if (value === null && (operator === '=' || operator === '!=')) {
        operator = operator === '=' ? 'null' : 'notNull';
      }
      if (
        field &&
        fieldIsValid(field, operator, valueSource === 'field' ? value : undefined) &&
        typeof value !== 'undefined'
      ) {
        return valueSource ? { field, operator, value, valueSource } : { field, operator, value };
      }
    }
    return null;
  };

  let jsonataExpr: jsonata.Expression;
  try {
    jsonataExpr = jsonata(jsonataInput);
  } catch (err) {
    return emptyQuery;
  }
  const jsonataAST = jsonataExpr.ast() as JSONataExprNode;

  const result = parseJSONataAST(jsonataAST);
  if (result) {
    if (isRuleGroup(result)) {
      return result;
    }
    return { rules: [result], ...(ic ? {} : { combinator: 'and' }) };
  }

  return emptyQuery;
}

export { parseJSONata };
