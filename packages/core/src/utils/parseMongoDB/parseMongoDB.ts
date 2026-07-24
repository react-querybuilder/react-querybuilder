import type { Except } from 'type-fest';
import { defaultOperatorNegationMap } from '../../defaults';
import type {
  DefaultOperatorName,
  DefaultRuleGroupType,
  DefaultRuleGroupTypeAny,
  DefaultRuleGroupTypeIC,
  DefaultRuleType,
  ExpressionNode,
  RuleGroupType,
  RuleType,
} from '../../types';
import type { ParserCommonOptions } from '../../types/import';
import { joinWith } from '../arrayUtils';
import { convertToIC } from '../convertQuery';
import { isRuleGroupType } from '../isRuleGroup';
import { isPojo } from '../misc';
import { objectKeys } from '../objectUtils';
import { fieldIsValidUtil, getFieldsArray } from '../parserUtils';
import { prepareRuleGroup } from '../prepareQueryObjects';
import type {
  MongoDBExpressionOperand,
  MongoDbSupportedOperators,
  ParseMongoDBExpressionContext,
} from './types';
import {
  flipMongoDbOperator,
  getRegExStr,
  isMongoDBExpressionOperand,
  isPrimitive,
  mongoDbExprComparisonMap,
  mongoDbFieldRef,
  mongoDbToRqbOperatorMap,
} from './utils';

/**
 * Options object for {@link parseMongoDB}.
 */
export interface ParseMongoDbOptions extends ParserCommonOptions {
  /**
   * When `true`, MongoDB rules in the form of `{ fieldName: { $not: { <...rule> } } }`
   * will be parsed into a rule group with the `not` attribute set to `true`. By default
   * (i.e., when this attribute is `false`), such "`$not`" rules will be parsed into a
   * rule with a negated operator.
   *
   * For example, with `preventOperatorNegation` set to `true`, a MongoDB rule like this...
   *
   * ```ts
   * { fieldName: { $not: { $eq: 1 } } }
   * ```
   *
   * ...would yield a rule group like this:
   *
   * ```ts
   * {
   *   combinator: 'and',
   *   not: true,
   *   rules: [{ field: 'fieldName', operator: '=', value: 1 }]
   * }
   * ```
   *
   * By default, the same MongoDB rule would yield a rule like this:
   *
   * ```ts
   * { field: 'fieldName', operator: '!=', value: 1 }
   * //              negated operator ^
   * ```
   *
   * @default false
   */
  preventOperatorNegation?: boolean;
  /**
   * Map of additional operators to their respective processing functions. Operators
   * must begin with `"$"`. Processing functions should return either a {@link index!RuleType RuleType}
   * or {@link index!RuleGroupType RuleGroupType}.
   *
   * (The functions should _not_ return {@link index!RuleGroupTypeIC RuleGroupTypeIC}, even if using independent
   * combinators. If the `independentCombinators` option is `true`, `parseMongoDB`
   * will convert the final query to {@link index!RuleGroupTypeIC RuleGroupTypeIC} before returning it.)
   *
   * @default {}
   */
  additionalOperators?: Record<
    `$${string}`,
    (
      field: string,
      operator: string,
      // oxlint-disable-next-line typescript/no-explicit-any
      value: any,
      options: ParserCommonOptions
    ) => RuleType | RuleGroupType
  >;
  /**
   * Handler that converts a MongoDB aggregation-expression operand (within `$expr`) into an
   * {@link ExpressionNode}. Return `null` to reject (the rule is dropped). Supplied by
   * `@react-querybuilder/expr` (`expressionParserMongoDB`). When omitted, expression
   * operands are ignored (rule dropped).
   */
  getExpression?: (
    node: MongoDBExpressionOperand,
    ctx: ParseMongoDBExpressionContext
  ) => ExpressionNode | null;
}

const emptyRuleGroup: DefaultRuleGroupType = { combinator: 'and', rules: [] };

/**
 * Converts a MongoDB query object or parseable string into a query suitable
 * for the {@link index!QueryBuilder QueryBuilder} component's `query` or `defaultQuery` props
 * ({@link index!DefaultRuleGroupType DefaultRuleGroupType}).
 */
// oxlint-disable-next-line typescript/no-explicit-any
function parseMongoDB(mongoDbRules: string | Record<string, any>): DefaultRuleGroupType;
/**
 * Converts a MongoDB query object or parseable string into a query suitable
 * for the {@link index!QueryBuilder QueryBuilder} component's `query` or `defaultQuery` props
 * ({@link index!DefaultRuleGroupType DefaultRuleGroupType}).
 */
function parseMongoDB(
  // oxlint-disable-next-line typescript/no-explicit-any
  mongoDbRules: string | Record<string, any>,
  options: Except<ParseMongoDbOptions, 'independentCombinators'> & {
    independentCombinators?: false;
  }
): DefaultRuleGroupType;
/**
 * Converts a MongoDB query object or parseable string into a query suitable
 * for the {@link index!QueryBuilder QueryBuilder} component's `query` or `defaultQuery` props
 * ({@link index!DefaultRuleGroupTypeIC DefaultRuleGroupTypeIC}).
 */
function parseMongoDB(
  // oxlint-disable-next-line typescript/no-explicit-any
  mongoDbRules: string | Record<string, any>,
  options: Except<ParseMongoDbOptions, 'independentCombinators'> & {
    independentCombinators: true;
  }
): DefaultRuleGroupTypeIC;
function parseMongoDB(
  // oxlint-disable-next-line typescript/no-explicit-any
  mongoDbRules: string | Record<string, any>,
  options: ParseMongoDbOptions = {}
): DefaultRuleGroupTypeAny {
  const listsAsArrays = !!options.listsAsArrays;
  const fieldsFlat = getFieldsArray(options.fields);
  const getValueSources = options.getValueSources;
  const additionalOperators = options.additionalOperators ?? {};
  const preventOperatorNegation = !!options.preventOperatorNegation;
  const getExpression = options.getExpression;
  const { additionalOperators: _ao, ...otherOptions } = options;

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
      getValueSources,
    });

  const exprCtx: ParseMongoDBExpressionContext = {
    fieldExists: fieldName => fieldsFlat.length === 0 || fieldsFlat.some(f => f.name === fieldName),
  };

  /**
   * Parses a `$expr` payload that carries arithmetic/function expression operands. Returns a
   * rule, `false` to drop, or `undefined` when the payload is not an expression form (so the
   * caller falls through to the stock `$expr` handling).
   */
  function processMongoDbExprExpression(
    op: string,
    // oxlint-disable-next-line typescript/no-explicit-any
    payload: any
  ): DefaultRuleType | false | undefined {
    // v8 ignore next -- guarded at call site
    if (!getExpression) return undefined;

    // Comparison: { $gt: [lhs, rhs] } with an expression operand
    if (op in mongoDbExprComparisonMap && Array.isArray(payload) && payload.length === 2) {
      const [l, r] = payload;
      const lIsExpr = isMongoDBExpressionOperand(l);
      const rIsExpr = isMongoDBExpressionOperand(r);
      if (!lIsExpr && !rIsExpr) return undefined;
      const rqbOp = mongoDbExprComparisonMap[op];

      if (lIsExpr && rIsExpr) {
        // expression <op> expression → both sides on lhs/value
        const lhs = getExpression(l, exprCtx);
        const rhs = getExpression(r, exprCtx);
        if (lhs && rhs) {
          return { field: '', operator: rqbOp, lhs, value: rhs, valueSource: 'expression' };
        }
        return false;
      }

      if (rIsExpr) {
        const field = mongoDbFieldRef(l);
        if (field !== null) {
          // field <op> expression → rhs expression
          const node = getExpression(r, exprCtx);
          if (node && fieldIsValid(field, rqbOp)) {
            return { field, operator: rqbOp, value: node, valueSource: 'expression' };
          }
          return false;
        }
        // literal <op> expression → lhs = expression, flip operator
        const node = getExpression(r, exprCtx);
        if (node) {
          return { field: '', operator: flipMongoDbOperator(rqbOp), lhs: node, value: l };
        }
        return false;
      }

      // lIsExpr && !rIsExpr
      const field = mongoDbFieldRef(r);
      if (field !== null) {
        // expression <op> field → flip to field <op> expression
        const flipped = flipMongoDbOperator(rqbOp);
        const node = getExpression(l, exprCtx);
        if (node && fieldIsValid(field, flipped)) {
          return { field, operator: flipped, value: node, valueSource: 'expression' };
        }
        return false;
      }
      // expression <op> literal → lhs = expression, plain value
      const node = getExpression(l, exprCtx);
      if (node) {
        return { field: '', operator: rqbOp, lhs: node, value: r };
      }
      return false;
    }

    // Between: { $and: [{ $gte: [lhs, from] }, { $lte: [lhs, to] }] }
    // notBetween: { $or: [{ $lt: [lhs, from] }, { $gt: [lhs, to] }] }
    if ((op === '$and' || op === '$or') && Array.isArray(payload) && payload.length === 2) {
      const between = op === '$and';
      const [c1, c2] = payload;
      if (!isPojo(c1) || !isPojo(c2)) return undefined;
      const k1 = objectKeys(c1)[0];
      const k2 = objectKeys(c2)[0];
      const [expK1, expK2] = between ? ['$gte', '$lte'] : ['$lt', '$gt'];
      if (k1 !== expK1 || k2 !== expK2) return undefined;
      const a1 = c1[k1];
      const a2 = c2[k2];
      if (!Array.isArray(a1) || a1.length !== 2 || !Array.isArray(a2) || a2.length !== 2) {
        return undefined;
      }
      const field = mongoDbFieldRef(a1[0]);
      if (field === null || field !== mongoDbFieldRef(a2[0])) return undefined;
      const [from, to] = [a1[1], a2[1]];
      if (!isMongoDBExpressionOperand(from) && !isMongoDBExpressionOperand(to)) return undefined;
      const fromNode = getExpression(from, exprCtx);
      const toNode = getExpression(to, exprCtx);
      const operator: DefaultOperatorName = between ? 'between' : 'notBetween';
      if (fromNode && toNode && fieldIsValid(field, operator)) {
        return { field, operator, value: [fromNode, toNode], valueSource: 'expression' };
      }
      return false;
    }

    return undefined;
  }

  function processMongoDbQueryBooleanOperator(
    field: string,
    mdbOperator: MongoDbSupportedOperators,
    // oxlint-disable-next-line typescript/no-explicit-any
    keyValue: any
  ): DefaultRuleType | false {
    let operator: DefaultOperatorName = '=';
    // oxlint-disable-next-line typescript/no-explicit-any
    let value: any = '';

    // v8 ignore else
    if (
      mdbOperator === '$eq' ||
      mdbOperator === '$ne' ||
      mdbOperator === '$gt' ||
      mdbOperator === '$gte' ||
      mdbOperator === '$lt' ||
      mdbOperator === '$lte'
    ) {
      if (mdbOperator === '$ne' && keyValue === null) {
        if (fieldIsValid(field, 'notNull')) {
          return { field, operator: 'notNull', value: null };
        }
      } else {
        operator = mongoDbToRqbOperatorMap[mdbOperator]!;
        if (fieldIsValid(field, operator)) {
          return { field, operator, value: keyValue };
        }
      }
    } else if (mdbOperator === '$regex' && /^[^$^]$|^[^^].*[^$]$/.test(getRegExStr(keyValue))) {
      if (fieldIsValid(field, 'contains')) {
        return {
          field,
          operator: 'contains',
          value: getRegExStr(keyValue),
        };
      }
    } else if (mdbOperator === '$regex' && /^\^.*[^$]/.test(getRegExStr(keyValue))) {
      if (fieldIsValid(field, 'beginsWith')) {
        return {
          field,
          operator: 'beginsWith',
          value: getRegExStr(keyValue).replace(/^\^/, ''),
        };
      }
    } else if (mdbOperator === '$regex' && /[^^].*\$/.test(getRegExStr(keyValue))) {
      if (fieldIsValid(field, 'endsWith')) {
        return {
          field,
          operator: 'endsWith',
          value: getRegExStr(keyValue).replace(/\$$/, ''),
        };
      }
    } else if (mdbOperator === '$in' && Array.isArray(keyValue)) {
      if (fieldIsValid(field, 'in')) {
        value = listsAsArrays
          ? keyValue
          : joinWith(
              keyValue.map(v => `${v}`),
              ','
            );
        return { field, operator: 'in', value };
      }
    } else if (mdbOperator === '$nin' && Array.isArray(keyValue) && fieldIsValid(field, 'notIn')) {
      value = listsAsArrays
        ? keyValue
        : joinWith(
            keyValue.map(v => `${v}`),
            ','
          );
      return { field, operator: 'notIn', value };
    }

    return false;
  }

  function processMongoDbQueryObjectKey(
    key: string,
    // oxlint-disable-next-line typescript/no-explicit-any
    keyValue: any
  ): DefaultRuleType | DefaultRuleGroupType | false {
    let field = '';

    // v8 ignore else
    if (key === '$and') {
      if (!Array.isArray(keyValue) || keyValue.length === 0 || !keyValue.every(v => isPojo(v))) {
        return false;
      }

      // Check if this should result in a "between" clause
      if (keyValue.length === 2 && keyValue.every(kv => objectKeys(kv).length === 1)) {
        const [rule1, rule2] = keyValue;
        const [ruleKey1, ruleKey2] = keyValue.map(kv => objectKeys(kv)[0]);
        if (
          ruleKey1 === ruleKey2 &&
          isPojo(rule1[ruleKey1]) &&
          objectKeys(rule1[ruleKey1]).length === 1 &&
          isPojo(rule2[ruleKey2]) &&
          objectKeys(rule2[ruleKey2]).length === 1 &&
          (('$gte' in rule1[ruleKey1] &&
            '$lte' in rule2[ruleKey2] &&
            rule2[ruleKey2].$lte >= rule1[ruleKey1].$gte) ||
            ('$lte' in rule1[ruleKey1] &&
              '$gte' in rule2[ruleKey2] &&
              rule1[ruleKey1].$lte >= rule2[ruleKey2].$gte))
        ) {
          const [val1, val2] = [
            rule1[ruleKey1].$gte ?? rule1[ruleKey1].$lte,
            rule2[ruleKey2].$lte ?? rule2[ruleKey2].$gte,
          ];
          let value = listsAsArrays ? [val1, val2] : joinWith([val1, val2], ',');
          if (val1 > val2) {
            value = listsAsArrays ? [val2, val1] : joinWith([val2, val1], ',');
          }
          return { field: ruleKey1, operator: 'between', value };
        }
      }

      const rules = keyValue.map(l => processMongoDbQueryObject(l)).filter(Boolean) as (
        | DefaultRuleType
        | DefaultRuleGroupType
      )[];

      return rules.length > 0 ? { combinator: 'and', rules } : false;
    } else if (key === '$or') {
      if (!Array.isArray(keyValue) || keyValue.length === 0 || !keyValue.every(v => isPojo(v))) {
        return false;
      }

      // Check if this should result in "notBetween"
      if (keyValue.length === 2 && keyValue.every(kv => objectKeys(kv).length === 1)) {
        const [rule1, rule2] = keyValue;
        const [ruleKey1, ruleKey2] = keyValue.map(kv => objectKeys(kv)[0]);
        if (
          ruleKey1 === ruleKey2 &&
          isPojo(rule1[ruleKey1]) &&
          objectKeys(rule1[ruleKey1]).length === 1 &&
          isPojo(rule2[ruleKey2]) &&
          objectKeys(rule2[ruleKey2]).length === 1 &&
          (('$gt' in rule1[ruleKey1] &&
            '$lt' in rule2[ruleKey2] &&
            rule1[ruleKey1].$gt >= rule2[ruleKey2].$lt) ||
            ('$lt' in rule1[ruleKey1] &&
              '$gt' in rule2[ruleKey2] &&
              rule2[ruleKey2].$gt >= rule1[ruleKey1].$lt))
        ) {
          const [val1, val2] = [
            rule1[ruleKey1].$gt ?? rule1[ruleKey1].$lt,
            rule2[ruleKey2].$lt ?? rule2[ruleKey2].$gt,
          ];
          let value = listsAsArrays ? [val1, val2] : `${val1},${val2}`;
          if (val1 > val2) {
            value = listsAsArrays ? [val2, val1] : `${val2},${val1}`;
          }
          return { field: ruleKey1, operator: 'notBetween', value };
        }
      }

      const rules = keyValue.map(l => processMongoDbQueryObject(l)).filter(Boolean) as (
        | DefaultRuleType
        | DefaultRuleGroupType
      )[];

      return rules.length > 0 ? { combinator: 'or', rules } : false;
    } else if (key === '$not' && isPojo(keyValue)) {
      const ruleOrGroup = processMongoDbQueryObject(keyValue);
      if (ruleOrGroup) {
        if (isRuleGroupType(ruleOrGroup)) {
          return ruleOrGroup.not
            ? { combinator: 'and', rules: [ruleOrGroup], not: true }
            : { ...ruleOrGroup, not: true };
        }
        return preventOperatorNegation
          ? { combinator: 'and', rules: [ruleOrGroup], not: true }
          : { ...ruleOrGroup, operator: defaultOperatorNegationMap[ruleOrGroup.operator] };
      }
      return false;
    } else if (key === '$expr') {
      const op = objectKeys(keyValue)[0] as MongoDbSupportedOperators;
      if (getExpression) {
        const exprRule = processMongoDbExprExpression(op, keyValue[op]);
        if (exprRule !== undefined) return exprRule;
      }
      if (
        /^\$(eq|gte?|lte?|n?in)$/.test(op) &&
        Array.isArray(keyValue[op]) &&
        keyValue[op].length === 2 &&
        typeof keyValue[op][0] === 'string' &&
        keyValue[op][0].startsWith('$')
      ) {
        field = keyValue[op][0].replace(/^\$/, '');
        const val = keyValue[op][1];
        if (
          (typeof val === 'string' && val.startsWith('$')) ||
          (Array.isArray(val) &&
            val.every(v => typeof v === 'string') &&
            val.every(v => v.startsWith('$')))
        ) {
          const valForProcessing = Array.isArray(val)
            ? val.map(v => v.replace(/^\$/, ''))
            : val.replace(/^\$/, '');
          const tempRule = processMongoDbQueryBooleanOperator(field, op, valForProcessing);
          if (tempRule) {
            if (
              typeof tempRule.value === 'string' &&
              !fieldIsValid(field, tempRule.operator, tempRule.value)
            ) {
              return false;
            }
            return { ...tempRule, valueSource: 'field' };
          }
        }
        // An aggregation-object operand requires a `getExpression` handler; without one it
        // cannot be represented, so drop the rule rather than emit an object-valued rule.
        if (isPojo(keyValue[op][1])) {
          return false;
        }
        return processMongoDbQueryBooleanOperator(field, op, keyValue[op][1]);
      }
    } else if (/^[^$]/.test(key)) {
      field = key;

      if (isPrimitive(keyValue)) {
        if (fieldIsValid(field, '=')) {
          return { field, operator: '=', value: keyValue };
        }
      } else if (keyValue === null) {
        if (fieldIsValid(field, 'null')) {
          return { field, operator: 'null', value: keyValue };
        }
      } else if (isPojo(keyValue)) {
        let betweenRule: DefaultRuleType | false = false;
        let notRule: DefaultRuleType | DefaultRuleGroupType | false = false;
        const additionalOpKeys = objectKeys(additionalOperators).map(o => o.replace(/^\$/, ''));
        const allOps = ['eq', 'ne', 'gte?', 'lte?', 'n?in', 'regex', 'not', ...additionalOpKeys];
        const acceptedOpsRegExp = new RegExp(`^\\$(${allOps.join('|')})$`);

        const operators = objectKeys(keyValue)
          .filter(o => acceptedOpsRegExp.test(o))
          // oxlint-disable-next-line no-array-sort
          .sort() as MongoDbSupportedOperators[];

        if (operators.length === 0) {
          return false;
        }

        if ('$not' in keyValue && isPojo(keyValue.$not)) {
          const invertedNotRule = processMongoDbQueryObject({ [field]: keyValue.$not });
          if (invertedNotRule) {
            if (isRuleGroupType(invertedNotRule)) {
              notRule = { ...invertedNotRule, not: true };
            } else {
              notRule = preventOperatorNegation
                ? { combinator: 'and', rules: [invertedNotRule], not: true }
                : {
                    ...invertedNotRule,
                    operator: defaultOperatorNegationMap[invertedNotRule.operator],
                  };
            }
          }
        }

        if ('$gte' in keyValue && '$lte' in keyValue) {
          // This is (at least) a compact "between" clause
          betweenRule = {
            field,
            operator: 'between',
            value: listsAsArrays
              ? [keyValue.$gte, keyValue.$lte]
              : `${keyValue.$gte},${keyValue.$lte}`,
          };
        }

        const rules = operators
          // filter out $not
          .filter(op => !(notRule && op === '$not'))
          // filter out $gte and $lte if they were both present
          .filter(op => !(betweenRule && (op === '$gte' || op === '$lte')))
          .map(op =>
            op in additionalOperators && typeof additionalOperators[op] === 'function'
              ? additionalOperators[op](field, op, keyValue[op], otherOptions)
              : processMongoDbQueryBooleanOperator(field, op, keyValue[op])
          )
          .filter(Boolean) as (DefaultRuleGroupType | DefaultRuleType)[];

        if (notRule) {
          rules.unshift(notRule);
        }

        if (betweenRule) {
          rules.unshift(betweenRule);
        }

        if (rules.length === 0) {
          return false;
        }
        if (rules.length === 1) {
          return rules[0];
        }
        return { combinator: 'and', rules };
      }
    }

    return false;
  }

  function processMongoDbQueryObject(
    // oxlint-disable-next-line typescript/no-explicit-any
    mongoDbQueryObject: Record<string, any>
  ): DefaultRuleGroupType | DefaultRuleType | false {
    const rules = objectKeys(mongoDbQueryObject)
      .map(k => processMongoDbQueryObjectKey(k, mongoDbQueryObject[k]))
      .filter(Boolean) as DefaultRuleGroupType[];
    return rules.length === 1 ? rules[0] : rules.length > 1 ? { combinator: 'and', rules } : false;
  }

  const prepare = options.generateIDs ? prepareRuleGroup : <T>(g: T) => g;

  let mongoDbPOJO = mongoDbRules;
  if (typeof mongoDbRules === 'string') {
    try {
      mongoDbPOJO = JSON.parse(mongoDbRules);
    } catch {
      return prepare(emptyRuleGroup);
    }
  }

  // Bail if the mongoDbPOJO is not actually a POJO
  if (!isPojo(mongoDbPOJO)) {
    return prepare(emptyRuleGroup);
  }

  const result = processMongoDbQueryObject(mongoDbPOJO);
  const finalQuery: DefaultRuleGroupType = result
    ? isRuleGroupType(result)
      ? result
      : { combinator: 'and', rules: [result] }
    : emptyRuleGroup;
  return prepare(options.independentCombinators ? convertToIC(finalQuery) : finalQuery);
}

export { parseMongoDB };
