import type { RuleProcessor } from '../../types';
import { toArray } from '../arrayUtils';
import { lc } from '../misc';
import { parseNumber } from '../parseNumber';
import type { TanStackDbWhereCallbackReturnType } from './tanStackDbTypes.ts';
import { isValidValue, shouldRenderAsNumber } from './utils';

/**
 * Default rule processor used by {@link formatQuery} for the "tanstack_db" format.
 *
 * @group Export
 */
export const defaultRuleProcessorTanStackDB: RuleProcessor = (
  rule,
  _options
): TanStackDbWhereCallbackReturnType | undefined => {
  const opts = _options ?? /* v8 ignore start -- @preserve */ {} /* v8 ignore stop -- @preserve */;
  const { parseNumbers, preserveValueOrder, context = {} } = opts;
  const ops = context.tanStackDbOperators;
  const refs = context._tanstackDbRefs;
  const primaryRef: string | undefined = context._tanstackDbPrimaryRef;

  if (!ops || !refs || !primaryRef) return undefined;

  const { and, eq, gt, gte, inArray, isNull, like, lt, lte, not } = ops;

  // Resolve a field name to a ref column:
  // - Dotted: "todo.age" → refs.todo.age
  // - Bare: "age" → refs[primaryRef].age
  const resolveField = (fieldName: string) => {
    const dotIdx = fieldName.indexOf('.');
    if (dotIdx > 0) {
      const prefix = fieldName.slice(0, dotIdx);
      const rest = fieldName.slice(dotIdx + 1);
      if (refs[prefix]) return refs[prefix][rest];
    }
    // Bare field: use primary ref
    return refs[primaryRef][fieldName];
  };

  const { field, operator, value, valueSource } = rule;
  const column = resolveField(field);
  const operatorLC = lc(operator);

  const valueIsField = valueSource === 'field';
  const asFieldOrValue = (v: unknown) => (valueIsField ? resolveField(v as string) : v);

  // Parse value as number when applicable
  const maybeParseNumber = (v: unknown) => {
    if (valueIsField || !parseNumbers) return asFieldOrValue(v);
    return shouldRenderAsNumber(v, true) ? parseNumber(v, { parseNumbers: true }) : v;
  };

  switch (operatorLC) {
    case '=':
      return eq(column, maybeParseNumber(value));
    case '!=':
      return not(eq(column, maybeParseNumber(value)));
    case '>':
      return gt(column, maybeParseNumber(value));
    case '<':
      return lt(column, maybeParseNumber(value));
    case '>=':
      return gte(column, maybeParseNumber(value));
    case '<=':
      return lte(column, maybeParseNumber(value));
    case 'beginswith':
    case 'doesnotbeginwith': {
      const pattern = valueIsField ? undefined : `${value}%`;
      const expr = like(column, pattern);
      return operatorLC === 'doesnotbeginwith' ? not(expr) : expr;
    }
    case 'contains':
    case 'doesnotcontain': {
      const pattern = valueIsField ? undefined : `%${value}%`;
      const expr = like(column, pattern);
      return operatorLC === 'doesnotcontain' ? not(expr) : expr;
    }
    case 'endswith':
    case 'doesnotendwith': {
      const pattern = valueIsField ? undefined : `%${value}`;
      const expr = like(column, pattern);
      return operatorLC === 'doesnotendwith' ? not(expr) : expr;
    }
    case 'null':
      return isNull(column);
    case 'notnull':
      return not(isNull(column));
    case 'in':
    case 'notin': {
      const valueAsArray = toArray(value).map(v => maybeParseNumber(v));
      const expr = inArray(column, valueAsArray);
      return operatorLC === 'notin' ? not(expr) : expr;
    }
    case 'between':
    case 'notbetween': {
      const valueAsArray = toArray(value);
      if (
        valueAsArray.length >= 2 &&
        isValidValue(valueAsArray[0]) &&
        isValidValue(valueAsArray[1])
      ) {
        let [first, second] = valueAsArray;
        const shouldParseNumbers = !(parseNumbers === false);
        if (
          !valueIsField &&
          shouldRenderAsNumber(first, shouldParseNumbers) &&
          shouldRenderAsNumber(second, shouldParseNumbers)
        ) {
          const firstNum = parseNumber(first, { parseNumbers: shouldParseNumbers });
          const secondNum = parseNumber(second, { parseNumbers: shouldParseNumbers });
          if (!preserveValueOrder && secondNum < firstNum) {
            const tempNum = secondNum;
            second = firstNum;
            first = tempNum;
          } else {
            first = firstNum;
            second = secondNum;
          }
        } else if (valueIsField) {
          first = asFieldOrValue(first);
          second = asFieldOrValue(second);
        }
        const expr = and(gte(column, first), lte(column, second));
        return operatorLC === 'notbetween' ? not(expr) : expr;
      }
      return undefined;
    }
    default:
      return undefined;
  }
};
