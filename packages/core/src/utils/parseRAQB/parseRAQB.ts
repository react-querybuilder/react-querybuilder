import type { Except } from 'type-fest';
import type {
  DefaultOperatorName,
  DefaultRuleGroupType,
  DefaultRuleGroupTypeAny,
  DefaultRuleGroupTypeIC,
  DefaultRuleType,
  ExpressionNode,
  MatchConfig,
  ValueSource,
} from '../../types';
import type { ParserCommonOptions } from '../../types/import';
import { convertToIC } from '../convertQuery';
import { isRuleGroupType } from '../isRuleGroup';
import { isPojo } from '../misc';
import { getFieldsArray } from '../parserUtils';
import { prepareRuleGroup } from '../prepareQueryObjects';
import type {
  RAQBFuncValue,
  RAQBJsonGroup,
  RAQBJsonItem,
  RAQBJsonRule,
  RAQBJsonRuleGroup,
  RAQBJsonTree,
  RAQBUnsupportedInfo,
  RAQBValueSource,
} from './types';
import {
  isImmutableLike,
  isRAQBFuncValue,
  raqbFuncToRelativeDateTime,
  raqbAggregateMatchModeMap,
  raqbBinaryOperators,
  raqbChildrenToArray,
  raqbConjunctionToCombinator,
  raqbCountMatchModeMap,
  raqbEmptyValueOperators,
  raqbListOperators,
  raqbNullaryOperators,
  raqbSubQueryModes,
  raqbToRqbFunctionMap,
  raqbToRqbOperatorMap,
} from './utils';

/**
 * Options object for {@link parseRAQB}.
 */
export interface ParseRAQBOptions extends ParserCommonOptions {
  /**
   * Additional or overriding RAQB-to-RQB operator mappings, merged over the defaults.
   */
  operatorMap?: Record<string, DefaultOperatorName>;
  /**
   * Additional or overriding RAQB-to-`@react-querybuilder/expr` function name mappings, merged
   * over the defaults (`LOWER` → `lower`, `UPPER` → `upper`). Functions absent from the merged
   * map are passed through with their original name and reported to {@link onUnsupported}.
   */
  functionMap?: Record<string, string>;
  /**
   * RAQB stores function arguments in a keyed object, while RQB expressions store them in an
   * ordered array. By default, argument order follows the key order of the serialized object
   * (which matches the order they were defined in the RAQB config). Use this option to specify
   * an explicit argument order per function, keyed by the _RAQB_ function name.
   *
   * @example
   * ```ts
   * { funcArgOrder: { RELATIVE_DATETIME: ['date', 'op', 'val', 'dim'] } }
   * ```
   */
  funcArgOrder?: Record<string, string[]>;
  /**
   * RAQB's built-in date/time functions (`NOW`, `TODAY`, `START_OF_TODAY`, `TRUNCATE_DATETIME`,
   * `RELATIVE_DATE`, and `RELATIVE_DATETIME`) describe a date relative to the current date/time,
   * so by default they are converted to `@react-querybuilder/datetime`'s `RelativeDateTimeValue`
   * shape (`{ mode: "relative", anchor, offset, unit }`) instead of to expressions. Set this to
   * `false` to convert them to expressions like any other function.
   *
   * Calls that fall outside what relative date/time values can represent (a `"second"` dimension,
   * or truncation applied after an offset) are converted to expressions either way.
   *
   * @default true
   */
  relativeDateTimes?: boolean;
  /**
   * Called for each RAQB construct that could not be converted. Unsupported constructs are
   * skipped rather than throwing, so a partial conversion is always returned.
   *
   * Reported constructs include `switch_group`/`case_group` (ternary mode, which has no RQB
   * equivalent), unmappable operators (e.g. `proximity`), unmappable `!group` count operators
   * (RAQB's strict inequalities), and functions with no `@react-querybuilder/expr` equivalent.
   */
  onUnsupported?: (info: RAQBUnsupportedInfo) => void;
}

const getMatchConfig = (operator: string | null | undefined, threshold: unknown) => {
  if (!operator) return null;

  const aggregateMode = raqbAggregateMatchModeMap[operator];
  if (aggregateMode) return { mode: aggregateMode } satisfies MatchConfig;

  const countMode = raqbCountMatchModeMap[operator];
  if (countMode && typeof threshold === 'number') {
    return { mode: countMode, threshold } satisfies MatchConfig;
  }

  return null;
};

const applyValueSource = (rule: DefaultRuleType, valueSource: ValueSource) => {
  if (valueSource !== 'value') {
    rule.valueSource = valueSource;
  }
};

const emptyRuleGroup: DefaultRuleGroupType = { combinator: 'and', rules: [] };

/**
 * Converts a [react-awesome-query-builder](https://github.com/ukrbublik/react-awesome-query-builder)
 * (RAQB) query tree into a query suitable for the {@link index!QueryBuilder QueryBuilder}
 * component's `query` or `defaultQuery` props
 * ({@link index!DefaultRuleGroupType DefaultRuleGroupType}).
 *
 * Only RAQB's _plain-JSON_ tree form is accepted — call RAQB's `Utils.getTree(immutableTree)`
 * first if you have an immutable.js tree.
 */
function parseRAQB(raqbTree: string | RAQBJsonTree): DefaultRuleGroupType;
/**
 * Converts a RAQB query tree into a query suitable for the
 * {@link index!QueryBuilder QueryBuilder} component's `query` or `defaultQuery` props
 * ({@link index!DefaultRuleGroupType DefaultRuleGroupType}).
 */
function parseRAQB(
  raqbTree: string | RAQBJsonTree,
  options: Except<ParseRAQBOptions, 'independentCombinators'> & {
    independentCombinators?: false;
  }
): DefaultRuleGroupType;
/**
 * Converts a RAQB query tree into a query suitable for the
 * {@link index!QueryBuilder QueryBuilder} component's `query` or `defaultQuery` props
 * ({@link index!DefaultRuleGroupTypeIC DefaultRuleGroupTypeIC}).
 */
function parseRAQB(
  raqbTree: string | RAQBJsonTree,
  options: Except<ParseRAQBOptions, 'independentCombinators'> & {
    independentCombinators: true;
  }
): DefaultRuleGroupTypeIC;
function parseRAQB(
  raqbTree: string | RAQBJsonTree,
  options: ParseRAQBOptions = {}
): DefaultRuleGroupTypeAny {
  const listsAsArrays = !!options.listsAsArrays;
  const fieldsFlat = getFieldsArray(options.fields);
  const operatorMap = { ...raqbToRqbOperatorMap, ...options.operatorMap };
  const functionMap = { ...raqbToRqbFunctionMap, ...options.functionMap };
  const funcArgOrder = options.funcArgOrder ?? {};
  const relativeDateTimes = options.relativeDateTimes ?? true;
  const prepare = options.generateIDs ? prepareRuleGroup : <T>(g: T) => g;

  const report = (info: RAQBUnsupportedInfo) => options.onUnsupported?.(info);

  const fieldIsValid = (fieldName: string) =>
    fieldsFlat.length === 0 || fieldsFlat.some(f => f.name === fieldName);

  const processFuncValue = (funcValue: RAQBFuncValue): ExpressionNode => {
    const fn = functionMap[funcValue.func];
    const args = funcValue.args ?? {};
    const argKeys = funcArgOrder[funcValue.func] ?? Object.keys(args);
    const argNodes = argKeys.map(key =>
      processOperand(args[key]?.value, args[key]?.valueSrc ?? 'value')
    );

    // RAQB's LINEAR_REGRESSION is defined as `coef * val + bias`; expand it to native
    // expression functions so it round-trips through every RQB export format.
    if (funcValue.func === 'LINEAR_REGRESSION' && argNodes.length === 3) {
      const [coef, val, bias] = argNodes;
      return {
        kind: 'func',
        fn: 'add',
        args: [{ kind: 'func', fn: 'multiply', args: [coef, val] }, bias],
      };
    }

    if (!fn) {
      report({
        reason: 'func',
        key: funcValue.func,
        message: `No @react-querybuilder/expr equivalent for RAQB function "${funcValue.func}"; passed through as-is. Register matching function metadata to render or serialize it.`,
      });
    }

    return { kind: 'func', fn: fn ?? funcValue.func, args: argNodes };
  };

  const processOperand = (value: unknown, valueSrc: RAQBValueSource): ExpressionNode =>
    valueSrc === 'field'
      ? { kind: 'field', field: `${value ?? ''}` }
      : valueSrc === 'func' && isRAQBFuncValue(value)
        ? processFuncValue(value)
        : { kind: 'value', value };

  const processRule = (item: RAQBJsonRule): DefaultRuleType | null => {
    const { field, fieldSrc, operator, value = [], valueSrc = [] } = item.properties ?? {};

    if (!operator) return null;

    const rqbOperator = operatorMap[operator];
    if (!rqbOperator) {
      report({
        reason: 'operator',
        key: operator,
        message: `RAQB operator "${operator}" has no react-querybuilder equivalent; rule skipped.`,
      });
      return null;
    }

    // The LHS is either a plain field path or, when `fieldSrc` is "func", a function expression.
    let fieldName: string;
    let lhs: ExpressionNode | undefined;
    if (fieldSrc === 'func' && isRAQBFuncValue(field)) {
      lhs = processFuncValue(field);
      // RQB still uses `field` for operator selection/validation; use the first field-sourced
      // argument if there is one, otherwise the function name.
      fieldName = findFirstFieldRef(lhs) ?? field.func;
    } else {
      if (typeof field !== 'string' || field.length === 0) return null;
      fieldName = field;
    }

    if (!lhs && !fieldIsValid(fieldName)) {
      report({
        reason: 'field',
        key: fieldName,
        message: `Field "${fieldName}" is not present in the provided \`fields\`; rule skipped.`,
      });
      return null;
    }

    const rule: DefaultRuleType = { field: fieldName, operator: rqbOperator, value: '' };
    if (lhs) {
      rule.lhs = lhs;
    }
    if (item.id) {
      rule.id = item.id;
    }

    if (raqbNullaryOperators.has(operator)) {
      return rule;
    }

    if (raqbEmptyValueOperators.has(operator)) {
      // RQB has no "is empty" operator; compare against an empty string instead.
      return rule;
    }

    if (raqbBinaryOperators.has(operator)) {
      const operands = [
        processRHSOperand(value[0], valueSrc[0]),
        processRHSOperand(value[1], valueSrc[1]),
      ];
      if (operands.some(o => o === null)) return null;

      const sources = new Set(operands.map(o => o!.valueSource));
      if (sources.size > 1) {
        report({
          reason: 'value_source',
          message: `Operands of RAQB operator "${operator}" have mismatched value sources (${[...sources].join(', ')}), which RQB cannot represent on a single rule; rule skipped.`,
        });
        return null;
      }

      const values = operands.map(o => o!.value);
      // Expressions and relative date/time values are objects, which can't survive being
      // joined into a comma-delimited string.
      const anyObject = values.some(v => typeof v === 'object' && v !== null);
      rule.value = listsAsArrays || anyObject ? values : values.join(',');
      applyValueSource(rule, operands[0]!.valueSource);
      return rule;
    }

    if (
      raqbListOperators.has(operator) &&
      (valueSrc[0] ?? 'value') === 'value' &&
      Array.isArray(value[0])
    ) {
      rule.value = listsAsArrays ? value[0] : value[0].join(',');
      return rule;
    }

    const operand = processRHSOperand(value[0], valueSrc[0]);
    if (!operand) return null;
    rule.value = operand.value;
    applyValueSource(rule, operand.valueSource);

    return rule;
  };

  /**
   * Converts a single right-hand side operand. Returns `null` for missing operands, which
   * indicate an incomplete RAQB rule.
   */
  const processRHSOperand = (
    value: unknown,
    valueSrc: RAQBValueSource | undefined
  ): { value: unknown; valueSource: ValueSource } | null => {
    if (valueSrc === 'func') {
      if (!isRAQBFuncValue(value)) return null;

      // RAQB's built-in date/time functions are really just relative date/time values.
      const relative = relativeDateTimes ? raqbFuncToRelativeDateTime(value) : null;
      if (relative) return { value: relative, valueSource: 'value' };

      return { value: processFuncValue(value), valueSource: 'expression' };
    }

    // A missing operand means an incomplete RAQB rule; skip it rather than emitting an
    // empty rule. (`is_null`/`is_not_null` are handled by the caller.)
    if (value === undefined || value === null) return null;

    return { value, valueSource: valueSrc === 'field' ? 'field' : 'value' };
  };

  /**
   * `rule_group` items come from `!struct`- and `!group`-typed fields. Struct-mode groups are
   * plain nested groups; `some`/`array`-mode groups become RQB match-mode rules.
   */
  const processRuleGroup = (
    item: RAQBJsonRuleGroup
  ): DefaultRuleGroupType | DefaultRuleType | null => {
    const props = item.properties ?? {};
    const { field, mode, operator, value = [], conjunction, not } = props;
    const children = processChildren(item.children1);

    const isSubQuery = !!mode && raqbSubQueryModes.has(mode);
    if (!isSubQuery || typeof field !== 'string' || field.length === 0) {
      // Struct mode (or an unrecognized mode): the children are ordinary rules on subfields.
      if (children.length === 0) return null;
      const group: DefaultRuleGroupType = { combinator: 'and', rules: children };
      if (item.id) {
        group.id = item.id;
      }
      return group;
    }

    const match = getMatchConfig(operator, value[0]);
    if (!match) {
      report({
        reason: 'match_mode',
        key: operator ?? '',
        message: `RAQB group operator "${operator}" has no react-querybuilder match mode equivalent; rule group "${field}" skipped.`,
      });
      return null;
    }

    const subQuery: DefaultRuleGroupType = {
      combinator: raqbConjunctionToCombinator(conjunction),
      rules: children,
    };
    if (not) {
      subQuery.not = true;
    }

    const rule: DefaultRuleType = { field, operator: '=', value: subQuery, match };
    if (item.id) {
      rule.id = item.id;
    }
    return rule;
  };

  const processGroup = (item: RAQBJsonGroup): DefaultRuleGroupType | null => {
    const { conjunction, not } = item.properties ?? {};
    const group: DefaultRuleGroupType = {
      combinator: raqbConjunctionToCombinator(conjunction),
      rules: processChildren(item.children1),
    };
    if (not) {
      group.not = true;
    }
    if (item.id) {
      group.id = item.id;
    }
    return group;
  };

  const processItem = (item: RAQBJsonItem): DefaultRuleGroupType | DefaultRuleType | null => {
    if (!isPojo(item)) return null;

    switch (item.type) {
      case 'rule': {
        return processRule(item);
      }
      case 'group': {
        return processGroup(item);
      }
      case 'rule_group': {
        return processRuleGroup(item);
      }
      case 'switch_group':
      case 'case_group': {
        report({
          reason: item.type,
          message: `RAQB "${item.type}" items (ternary/case mode) have no react-querybuilder equivalent and were skipped.`,
        });
        return null;
      }
      default: {
        return null;
      }
    }
  };

  const processChildren = (children: RAQBJsonItem[] | Record<string, RAQBJsonItem> | undefined) =>
    raqbChildrenToArray(children)
      .map(child => processItem(child))
      .filter(child => child !== null && !(isRuleGroupType(child) && child.rules.length === 0)) as (
      | DefaultRuleGroupType
      | DefaultRuleType
    )[];

  let raqbPOJO: unknown = raqbTree;
  if (typeof raqbTree === 'string') {
    try {
      raqbPOJO = JSON.parse(raqbTree);
    } catch {
      return prepare(emptyRuleGroup);
    }
  }

  if (isImmutableLike(raqbPOJO)) {
    throw new TypeError(
      "parseRAQB requires a plain JSON tree. Convert the immutable.js tree first with react-awesome-query-builder's `Utils.getTree(immutableTree)`."
    );
  }

  if (!isPojo(raqbPOJO)) {
    return prepare(emptyRuleGroup);
  }

  const result = processItem(raqbPOJO as RAQBJsonItem);
  const finalQuery: DefaultRuleGroupType = !result
    ? emptyRuleGroup
    : isRuleGroupType(result)
      ? result
      : { combinator: 'and', rules: [result] };

  return prepare(options.independentCombinators ? convertToIC(finalQuery) : finalQuery);
}

/** Returns the first field reference within an expression tree, if any. */
const findFirstFieldRef = (node: ExpressionNode): string | undefined => {
  if (node.kind === 'field') return node.field;
  if (node.kind === 'func') {
    for (const arg of node.args) {
      const found = findFirstFieldRef(arg);
      if (found !== undefined) return found;
    }
  }
  return undefined;
};

export { parseRAQB };
