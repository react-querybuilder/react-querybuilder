import jsonata from 'jsonata';
import type { Except } from 'type-fest';
import type {
  DefaultCombinatorName,
  DefaultOperatorName,
  DefaultRuleGroupArray,
  DefaultRuleGroupICArray,
  DefaultRuleGroupType,
  DefaultRuleGroupTypeAny,
  DefaultRuleGroupTypeIC,
  DefaultRuleType,
  ValueSource,
} from '../../types';
import type { ParserCommonOptions } from '../../types/import';
import { isRuleGroup } from '../isRuleGroup';
import { fieldIsValidUtil, getFieldsArray } from '../parserUtils';
import { prepareRuleGroup } from '../prepareQueryObjects';
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
 * Options object for {@link parseJSONata}.
 *
 * Note: `listsAsArrays` is ignored by `parseJSONata`; lists are _always_ arrays.
 */
export interface ParseJSONataOptions extends ParserCommonOptions {}

/**
 * Converts a JSONata string expression into a query suitable for the
 * {@link index!QueryBuilder QueryBuilder} component's `query` or `defaultQuery` props
 * ({@link index!DefaultRuleGroupType DefaultRuleGroupType}).
 */
function parseJSONata(jsonataInput: string): DefaultRuleGroupType;
/**
 * Converts a JSONata string expression into a query suitable for the
 * {@link index!QueryBuilder QueryBuilder} component's `query` or `defaultQuery` props
 * ({@link index!DefaultRuleGroupType DefaultRuleGroupType}).
 */
function parseJSONata(
  jsonataInput: string,
  options: Except<ParseJSONataOptions, 'independentCombinators'> & {
    independentCombinators?: false;
  }
): DefaultRuleGroupType;
/**
 * Converts a JSONata string expression into a query suitable for the
 * {@link index!QueryBuilder QueryBuilder} component's `query` or `defaultQuery` props
 * ({@link index!DefaultRuleGroupTypeIC DefaultRuleGroupTypeIC}).
 */
function parseJSONata(
  jsonataInput: string,
  options: Except<ParseJSONataOptions, 'independentCombinators'> & {
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
      // istanbul ignore else -- @preserve
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

        // Reduce this group to a single between/notBetween rule if possible
        if (
          ((rs: unknown[]): rs is [DefaultRuleType, DefaultCombinatorName, DefaultRuleType] =>
            rs.length === 3 &&
            (rs[1] === 'and' || rs[1] === 'or') &&
            !isRuleGroup(rs[0]) &&
            !isRuleGroup(rs[2]))(rules) &&
          rules[0].field === rules[2].field &&
          (rules[0].valueSource ?? 'value') === (rules[2].valueSource ?? 'value') &&
          ((rules[1] === 'and' &&
            ((rules[0].operator === '>=' && rules[2].operator === '<=') ||
              (rules[0].operator === '<=' && rules[2].operator === '>='))) ||
            (rules[1] === 'or' &&
              ((rules[0].operator === '>' && rules[2].operator === '<') ||
                (rules[0].operator === '<' && rules[2].operator === '>'))))
        ) {
          return {
            field: rules[0].field,
            operator: rules[1] === 'and' ? 'between' : 'notBetween',
            value:
              (rules[1] === 'and' && rules[0].operator === '<=') ||
              (rules[1] === 'or' && rules[0].operator === '>')
                ? [rules[2].value, rules[0].value]
                : [rules[0].value, rules[2].value],
            ...(rules[0].valueSource ? { valueSource: rules[0].valueSource } : null),
          };
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

      // Reduce this group to a single between/notBetween rule if possible
      if (
        ((rs: unknown[]): rs is [DefaultRuleType, DefaultRuleType] =>
          rs.length === 2 && !isRuleGroup(rs[0]) && !isRuleGroup(rs[1]))(rules) &&
        rules[0].field === rules[1].field &&
        (rules[0].valueSource ?? 'value') === (rules[1].valueSource ?? 'value') &&
        ((combinator === 'and' &&
          ((rules[0].operator === '>=' && rules[1].operator === '<=') ||
            (rules[0].operator === '<=' && rules[1].operator === '>='))) ||
          (combinator === 'or' &&
            ((rules[0].operator === '>' && rules[1].operator === '<') ||
              (rules[0].operator === '<' && rules[1].operator === '>'))))
      ) {
        return {
          field: rules[0].field,
          operator: combinator === 'and' ? 'between' : 'notBetween',
          value:
            (combinator === 'and' && rules[0].operator === '<=') ||
            (combinator === 'or' && rules[0].operator === '>')
              ? [rules[1].value, rules[0].value]
              : [rules[0].value, rules[1].value],
          ...(rules[0].valueSource ? { valueSource: rules[0].valueSource } : null),
        };
      }

      // istanbul ignore else -- @preserve
      if (rules.length > 0) {
        return { combinator, rules };
      }
    } else if (isJSONataNot(expr)) {
      const negatedExpr = parseJSONataAST(expr.arguments[0]);
      // istanbul ignore else -- @preserve
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
      // istanbul ignore else -- @preserve
      if (isJSONataIdentifier(arg1)) {
        field = getFieldFromPath(arg1);
        if (isJSONataIdentifier(arg2)) {
          regex = getFieldFromPath(arg2);
          valueSource = 'field';
        } else {
          // istanbul ignore else -- @preserve
          if (isJSONataString(arg2) || isJSONataRegex(arg2)) {
            regex = getValidValue(arg2);
          }
        }
      }

      // istanbul ignore else -- @preserve
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
        // oxlint-disable-next-line typescript/no-explicit-any
        const value: any[] = getValidValue(expr.rhs);
        // istanbul ignore else -- @preserve
        if (
          field &&
          value.every(v => fieldIsValid(field, 'in', valueSource === 'field' ? v : undefined))
        ) {
          return { field, operator: 'in', value, ...(valueSource ? { valueSource } : {}) };
        }
      }
    } else if (isJSONataComparison(expr)) {
      let field: string | null = null;
      // oxlint-disable-next-line typescript/no-explicit-any
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
        // istanbul ignore else -- @preserve
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
        value !== undefined
      ) {
        return valueSource ? { field, operator, value, valueSource } : { field, operator, value };
      }
    }
    return null;
  };

  const prepare = options.generateIDs ? prepareRuleGroup : <T>(g: T) => g;

  let jsonataExpr: jsonata.Expression;
  try {
    jsonataExpr = jsonata(jsonataInput);
  } catch {
    return prepare(emptyQuery);
  }
  const jsonataAST = jsonataExpr.ast() as JSONataExprNode;

  const result = parseJSONataAST(jsonataAST);
  if (result) {
    if (isRuleGroup(result)) {
      return prepare(result);
    }
    return prepare({ rules: [result], ...(ic ? {} : { combinator: 'and' }) });
  }

  return prepare(emptyQuery);
}

export { parseJSONata };
