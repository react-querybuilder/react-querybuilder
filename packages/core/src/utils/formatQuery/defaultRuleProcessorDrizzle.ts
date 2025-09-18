import type { Column, Operators, SQL, SQLWrapper } from 'drizzle-orm';
import type { FormatQueryFinalOptions, RuleGroupType, RuleProcessor } from '../../types';
import { toArray } from '../arrayUtils';
import { lc } from '../misc';
import { parseNumber } from '../parseNumber';
import { transformQuery } from '../transformQuery';
import { defaultRuleGroupProcessorDrizzle } from './defaultRuleGroupProcessorDrizzle';
import { isValidValue, processMatchMode, shouldRenderAsNumber } from './utils';

/**
 * Default rule processor used by {@link formatQuery} for the "drizzle" format.
 *
 * @group Export
 */
export const defaultRuleProcessorDrizzle: RuleProcessor = (rule, _options): SQL | undefined => {
  const opts = _options ?? /* istanbul ignore next */ {};
  // istanbul ignore next
  const { parseNumbers, preserveValueOrder, context = {} } = opts;
  const { columns, drizzleOperators, useRawFields } = context as {
    columns: Record<string, Column>;
    drizzleOperators: Operators;
    useRawFields?: boolean;
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
  // TODO: Improve field validation
  const column =
    useRawFields && /[a-z][a-z0-9]*/i.test(field)
      ? (sql.raw(field) as Exclude<SQLWrapper, SQL.Aliased | Column>)
      : columns[field];
  const operatorLC = lc(operator);

  const valueIsField = valueSource === 'field';
  const asFieldOrValue = (v: string) => (valueIsField ? columns[v] : v);

  if (!column) return;

  const matchEval = processMatchMode(rule);

  if (matchEval === false) {
    return;
  } else if (matchEval) {
    // We only support PostgreSQL nested arrays
    if (opts.preset !== 'postgresql') return;

    const { mode, threshold } = matchEval;

    // TODO?: Randomize this alias
    const arrayElementAlias = 'elem_alias';

    const sqlQuery = transformQuery(rule.value as RuleGroupType, {
      ruleProcessor: r => ({ ...r, field: arrayElementAlias }),
    });

    const nestedArrayFilter = defaultRuleGroupProcessorDrizzle(sqlQuery, {
      ...(opts as FormatQueryFinalOptions),
      context: { ...opts.context, useRawFields: true },
    });

    switch (mode) {
      case 'all':
        return sql`(select count(*) from unnest(${column}) as ${sql.raw(arrayElementAlias)} where ${nestedArrayFilter({}, drizzleOperators)}) = array_length(${column}, 1)`;

      case 'none':
        return sql`not exists (select 1 from unnest(${column}) as ${sql.raw(arrayElementAlias)} where ${nestedArrayFilter({}, drizzleOperators)})`;

      case 'some':
        return sql`exists (select 1 from unnest(${column}) as ${sql.raw(arrayElementAlias)} where ${nestedArrayFilter({}, drizzleOperators)})`;

      case 'atleast':
      case 'atmost':
      case 'exactly': {
        const op = mode === 'atleast' ? '>=' : mode === 'atmost' ? '<=' : '=';

        return threshold > 0 && threshold < 1
          ? sql`(select count(*) / array_length(${column}, 1) from unnest(${column}) as ${sql.raw(arrayElementAlias)} where ${nestedArrayFilter({}, drizzleOperators)}) ${sql.raw(`${op} ${threshold}`)}`
          : sql`(select count(*) from unnest(${column}) as ${sql.raw(arrayElementAlias)} where ${nestedArrayFilter({}, drizzleOperators)}) ${sql.raw(`${op} ${threshold}`)}`;
      }
    }
  }

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
        column as SQL,
        valueIsField ? sql`${asFieldOrValue(value)} || '%'` : `${value}%`
      );
    case 'contains':
    case 'doesnotcontain':
      return (operatorLC === 'doesnotcontain' ? notLike : like)(
        column as SQL,
        valueIsField ? sql`'%' || ${asFieldOrValue(value)} || '%'` : `%${value}%`
      );
    case 'endswith':
    case 'doesnotendwith':
      return (operatorLC === 'doesnotendwith' ? notLike : like)(
        column as SQL,
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
        // For backwards compatibility, default to parsing numbers for between operators
        // unless parseNumbers is explicitly set to false
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
