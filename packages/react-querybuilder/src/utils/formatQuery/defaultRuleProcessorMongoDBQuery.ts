import type {
  FormatQueryFinalOptions,
  RuleGroupType,
  RuleProcessor,
} from '../../types/index.noReact';
import { toArray } from '../arrayUtils';
import { lc } from '../misc';
import { parseNumber } from '../parseNumber';
import { transformQuery } from '../transformQuery';
import { defaultRuleGroupProcessorMongoDBQuery } from './defaultRuleGroupProcessorMongoDBQuery';
import { isValidValue, mongoOperators, processMatchMode, shouldRenderAsNumber } from './utils';

const processNumber = <T>(value: unknown, fallback: T, parseNumbers = false) =>
  shouldRenderAsNumber(value, parseNumbers || typeof value === 'bigint')
    ? Number(parseNumber(value, { parseNumbers: 'strict' }))
    : fallback;

/**
 * Default rule processor used by {@link formatQuery} for "mongodb_query" format.
 *
 * @group Export
 */
export const defaultRuleProcessorMongoDBQuery: RuleProcessor = (
  rule,
  // istanbul ignore next
  options = {}
) => {
  const { field, operator, value, valueSource } = rule;
  const { parseNumbers, preserveValueOrder, context } = options;
  const valueIsField = valueSource === 'field';

  const { avoidFieldsAsKeys } = (context ?? {}) as { avoidFieldsAsKeys?: boolean };

  const matchEval = processMatchMode(rule);

  if (matchEval === false) {
    return;
  } else if (matchEval) {
    const { mode, threshold } = matchEval;

    const totalCount = { $size: { $ifNull: [`$${field}`, []] } };
    const subQueryNoAggCtx = defaultRuleGroupProcessorMongoDBQuery(
      transformQuery(value as RuleGroupType, {
        ruleProcessor: r => ({ ...r, field: r.field ? `${field}.${r.field}` : field }),
      }),
      {
        ...(options as FormatQueryFinalOptions),
        // We have to override `ruleProcessor` in case original `format` is "mongodb"
        ruleProcessor: defaultRuleProcessorMongoDBQuery,
        context: { ...options.context, avoidFieldsAsKeys: false },
      }
    );
    const subQueryWithAggCtx = defaultRuleGroupProcessorMongoDBQuery(
      transformQuery(value as RuleGroupType, {
        ruleProcessor: r => ({ ...r, field: r.field ? `$item.${r.field}` : '$item' }),
      }),
      {
        ...(options as FormatQueryFinalOptions),
        // We have to override `ruleProcessor` in case original `format` is "mongodb"
        ruleProcessor: defaultRuleProcessorMongoDBQuery,
        context: { ...options.context, avoidFieldsAsKeys: true },
      }
    );

    const filteredCount = {
      $size: {
        $ifNull: [
          { $filter: { input: `$${field}`, as: 'item', cond: { $and: [subQueryWithAggCtx] } } },
          [],
        ],
      },
    };

    switch (mode) {
      case 'all':
        return { $expr: { $eq: [filteredCount, totalCount] } };

      case 'none':
        return { $nor: [subQueryNoAggCtx] };

      case 'some':
        return subQueryNoAggCtx;

      case 'atleast':
      case 'atmost':
      case 'exactly': {
        const op =
          mode === 'atleast'
            ? mongoOperators['>=']
            : mode === 'atmost'
              ? mongoOperators['<=']
              : mongoOperators['='];

        if (threshold > 0 && threshold < 1) {
          return { $expr: { [op]: [filteredCount, { $multiply: [totalCount, threshold] }] } };
        }
        return { $expr: { [op]: [filteredCount, threshold] } };
      }
    }
  }

  if (operator === '=' && !valueIsField) {
    return avoidFieldsAsKeys
      ? { $eq: [`$${field}`, processNumber(value, value, parseNumbers)] }
      : { [field]: processNumber(value, value, parseNumbers) };
  }

  const operatorLC = lc(operator);
  switch (operatorLC) {
    case '<':
    case '<=':
    case '=':
    case '!=':
    case '>':
    case '>=': {
      const mongoOperator = mongoOperators[operatorLC];
      return valueIsField
        ? { [mongoOperator]: [`$${field}`, `$${value}`] }
        : avoidFieldsAsKeys
          ? {
              $and: [
                { $ne: [`$${field}`, null] },
                { [mongoOperator]: [`$${field}`, processNumber(value, value, parseNumbers)] },
              ],
            }
          : { [field]: { [mongoOperator]: processNumber(value, value, parseNumbers) } };
    }

    case 'contains':
      return valueIsField
        ? { $where: `this.${field}.includes(this.${value})` }
        : avoidFieldsAsKeys
          ? { $regexMatch: { input: `$${field}`, regex: value } }
          : { [field]: { $regex: value } };

    case 'beginswith':
      return valueIsField
        ? { $where: `this.${field}.startsWith(this.${value})` }
        : avoidFieldsAsKeys
          ? { $regexMatch: { input: `$${field}`, regex: `^${value}` } }
          : { [field]: { $regex: `^${value}` } };

    case 'endswith':
      return valueIsField
        ? { $where: `this.${field}.endsWith(this.${value})` }
        : avoidFieldsAsKeys
          ? { $regexMatch: { input: `$${field}`, regex: `${value}$` } }
          : { [field]: { $regex: `${value}$` } };

    case 'doesnotcontain':
      return valueIsField
        ? { $where: `!this.${field}.includes(this.${value})` }
        : avoidFieldsAsKeys
          ? { $not: { $regexMatch: { input: `$${field}`, regex: value } } }
          : { [field]: { $not: { $regex: value } } };

    case 'doesnotbeginwith':
      return valueIsField
        ? { $where: `!this.${field}.startsWith(this.${value})` }
        : avoidFieldsAsKeys
          ? { $not: { $regexMatch: { input: `$${field}`, regex: `^${value}` } } }
          : { [field]: { $not: { $regex: `^${value}` } } };

    case 'doesnotendwith':
      return valueIsField
        ? { $where: `!this.${field}.endsWith(this.${value})` }
        : avoidFieldsAsKeys
          ? { $not: { $regexMatch: { input: `$${field}`, regex: `${value}$` } } }
          : { [field]: { $not: { $regex: `${value}$` } } };

    case 'null':
      return avoidFieldsAsKeys ? { $eq: [`$${field}`, null] } : { [field]: null };

    case 'notnull':
      return avoidFieldsAsKeys ? { $ne: [`$${field}`, null] } : { [field]: { $ne: null } };

    case 'in':
    case 'notin': {
      const valueAsArray = toArray(value);
      return valueIsField
        ? {
            $where: `${operatorLC === 'notin' ? '!' : ''}[${valueAsArray
              .map(val => `this.${val}`)
              .join(',')}].includes(this.${field})`,
          }
        : avoidFieldsAsKeys
          ? operatorLC === 'notin'
            ? {
                $not: {
                  [mongoOperators.in]: [
                    `$${field}`,
                    valueAsArray.map(val => processNumber(val, val, parseNumbers)),
                  ],
                },
              }
            : {
                [mongoOperators[operatorLC]]: [
                  `$${field}`,
                  valueAsArray.map(val => processNumber(val, val, parseNumbers)),
                ],
              }
          : {
              [field]: {
                [mongoOperators[operatorLC]]: valueAsArray.map(val =>
                  processNumber(val, val, parseNumbers)
                ),
              },
            };
    }

    case 'between':
    case 'notbetween': {
      const valueAsArray = toArray(value);
      if (
        valueAsArray.length >= 2 &&
        isValidValue(valueAsArray[0]) &&
        isValidValue(valueAsArray[1])
      ) {
        const [first, second] = valueAsArray;
        const firstNum = processNumber(first, Number.NaN, true);
        const secondNum = processNumber(second, Number.NaN, true);
        let firstValue = valueIsField ? first : Number.isNaN(firstNum) ? first : firstNum;
        let secondValue = valueIsField ? second : Number.isNaN(secondNum) ? second : secondNum;
        if (
          !preserveValueOrder &&
          firstValue === firstNum &&
          secondValue === secondNum &&
          secondNum < firstNum
        ) {
          const tempNum = secondNum;
          secondValue = firstNum;
          firstValue = tempNum;
        }

        if (operatorLC === 'between') {
          return valueIsField
            ? { $gte: [`$${field}`, `$${firstValue}`], $lte: [`$${field}`, `$${secondValue}`] }
            : avoidFieldsAsKeys
              ? {
                  $and: [{ $gte: [`$${field}`, firstValue] }, { $lte: [`$${field}`, secondValue] }],
                }
              : { [field]: { $gte: firstValue, $lte: secondValue } };
        } else {
          return valueIsField
            ? {
                $or: [
                  { $lt: [`$${field}`, `$${firstValue}`] },
                  { $gt: [`$${field}`, `$${secondValue}`] },
                ],
              }
            : avoidFieldsAsKeys
              ? {
                  $or: [{ $lt: [`$${field}`, firstValue] }, { $gt: [`$${field}`, secondValue] }],
                }
              : { $or: [{ [field]: { $lt: firstValue } }, { [field]: { $gt: secondValue } }] };
        }
      } else {
        return '';
      }
    }
  }
  return '';
};
