import type { Column, Operators, SQL } from 'drizzle-orm';
import type { RuleProcessor } from '../../types/index.noReact';
import { toArray } from '../arrayUtils';
import { parseNumber } from '../parseNumber';
import { isValidValue, shouldRenderAsNumber } from './utils';

/**
 * Default rule processor used by {@link formatQuery} for the "drizzle" format.
 *
 * @group Export
 */
export const defaultRuleProcessorDrizzle: RuleProcessor = (
  rule,
  // istanbul ignore next
  { preserveValueOrder, context = {} } = {}
): SQL | undefined => {
  const { columns, drizzleOperators } = context as {
    columns: Record<string, Column>;
    drizzleOperators: Operators;
  };

  if (!columns || !drizzleOperators) return;

  const {
    between,
    eq,
    gt,
    gte,
    inArray,
    isNotNull,
    isNull,
    like,
    lt,
    lte,
    ne,
    notBetween,
    notInArray,
    notLike,
    sql,
  } = drizzleOperators;

  const { field, operator, value, valueSource } = rule;
  const column = columns[field];
  const operatorLC = operator.toLowerCase();

  const valueIsField = valueSource === 'field';
  const asFieldOrValue = (v: string) => (valueIsField ? columns[v] : v);

  if (!column) return;

  switch (operatorLC) {
    case '=':
      return eq(column, asFieldOrValue(value));
    case '!=':
      return ne(column, asFieldOrValue(value));
    case '>':
      return gt(column, asFieldOrValue(value));
    case '<':
      return lt(column, asFieldOrValue(value));
    case '>=':
      return gte(column, asFieldOrValue(value));
    case '<=':
      return lte(column, asFieldOrValue(value));
    case 'beginswith':
    case 'doesnotbeginwith':
      return (operatorLC === 'doesnotbeginwith' ? notLike : like)(
        column,
        valueIsField ? sql`${asFieldOrValue(value)} || '%'` : `${value}%`
      );
    case 'contains':
    case 'doesnotcontain':
      return (operatorLC === 'doesnotcontain' ? notLike : like)(
        column,
        valueIsField ? sql`'%' || ${asFieldOrValue(value)} || '%'` : `%${value}%`
      );
    case 'endswith':
    case 'doesnotendwith':
      return (operatorLC === 'doesnotendwith' ? notLike : like)(
        column,
        valueIsField ? sql`'%' || ${asFieldOrValue(value)}` : `%${value}`
      );
    case 'null':
      return isNull(column);
    case 'notnull':
      return isNotNull(column);
    case 'in':
    case 'notin': {
      const valueAsArray = toArray(value).map(v => asFieldOrValue(v));
      return operatorLC === 'notin'
        ? notInArray(column, valueAsArray)
        : inArray(column, valueAsArray);
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
        if (
          !valueIsField &&
          shouldRenderAsNumber(first, true) &&
          shouldRenderAsNumber(second, true)
        ) {
          const firstNum = parseNumber(first, { parseNumbers: true });
          const secondNum = parseNumber(second, { parseNumbers: true });
          if (!preserveValueOrder && secondNum < firstNum) {
            const tempNum = secondNum;
            second = firstNum;
            first = tempNum;
          } else {
            first = firstNum;
            second = secondNum;
          }
        } else {
          // istanbul ignore else
          if (valueIsField) {
            first = asFieldOrValue(first);
            second = asFieldOrValue(second);
          }
        }
        return operatorLC === 'notbetween'
          ? notBetween(column, first, second)
          : between(column, first, second);
      }
      return;
    }
    default:
      return;
  }
};
