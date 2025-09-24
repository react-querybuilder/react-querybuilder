import type { Op as _OpTypes, col as _colType, fn as _fnType } from 'sequelize';
import type { Simplify } from 'type-fest';
import type { RuleProcessor } from '../../types';
import { toArray } from '../arrayUtils';
import { lc } from '../misc';
import { parseNumber } from '../parseNumber';
import { isValidValue, processMatchMode, shouldRenderAsNumber } from './utils';

type OpTypes = Simplify<typeof _OpTypes>;
type ColType = typeof _colType;
type FnType = typeof _fnType;

/**
 * Default rule processor used by {@link formatQuery} for the "sequelize" format.
 *
 * @group Export
 */
export const defaultRuleProcessorSequelize: RuleProcessor = (
  rule,
  // istanbul ignore next
  { parseNumbers, preserveValueOrder, context = {} } = {}
): Record<string, unknown> | undefined => {
  const {
    sequelizeOperators: Op,
    sequelizeCol: col,
    sequelizeFn: fn,
  } = context as {
    sequelizeOperators: OpTypes;
    sequelizeCol?: ColType;
    sequelizeFn?: FnType;
  };

  // Match modes are not supported in this format
  if (processMatchMode(rule)) return;

  const { field, operator, value, valueSource } = rule;
  const valueIsField = valueSource === 'field';

  const operatorLC = lc(operator);

  if (
    // Bail out if we don't have the Op symbols
    !Op ||
    // ...or valueSource is 'field' and we don't have the `col` function,
    (valueIsField &&
      (!col ||
        // ...or valueSource is 'field' and we don't have the `fn` function
        // and the operator is one of the "doesNot*" ones
        (!fn && ['doesnotcontain', 'doesnotbeginwith', 'doesnotendwith'].includes(operatorLC))))
  ) {
    return;
  }

  switch (operatorLC) {
    case '=':
    case '!=':
    case '<':
    case '<=':
    case '>':
    case '>=': {
      const sequelizeOperator = {
        '=': Op.eq,
        '!=': Op.ne,
        '<': Op.lt,
        '<=': Op.lte,
        '>': Op.gt,
        '>=': Op.gte,
      }[operatorLC];
      return {
        [field]:
          valueIsField && operatorLC === '='
            ? { [Op.col]: value }
            : {
                [sequelizeOperator]: valueIsField
                  ? col!(value)
                  : shouldRenderAsNumber(value, parseNumbers)
                    ? parseNumber(value, { parseNumbers: 'strict' })
                    : value,
              },
      };
    }

    case 'contains':
      return { [field]: { [Op.substring]: valueIsField ? col!(value) : `${value}` } };

    case 'beginswith':
      return { [field]: { [Op.startsWith]: valueIsField ? col!(value) : `${value}` } };

    case 'endswith':
      return { [field]: { [Op.endsWith]: valueIsField ? col!(value) : `${value}` } };

    case 'doesnotcontain':
      return {
        [field]: {
          [Op.notLike]: valueIsField ? fn!('CONCAT', '%', col!(value), '%') : `%${value}%`,
        },
      };

    case 'doesnotbeginwith':
      return {
        [field]: { [Op.notLike]: valueIsField ? fn!('CONCAT', col!(value), '%') : `${value}%` },
      };

    case 'doesnotendwith':
      return {
        [field]: { [Op.notLike]: valueIsField ? fn!('CONCAT', '%', col!(value)) : `%${value}` },
      };

    case 'null':
      return { [field]: { [Op.is]: null } };

    case 'notnull':
      return { [field]: { [Op.not]: null } };

    case 'in':
    case 'notin': {
      const valueAsArray = toArray(value);
      return {
        [field]: {
          [operatorLC === 'in' ? Op.in : Op.notIn]: valueAsArray.map(val =>
            valueIsField
              ? col!(val)
              : shouldRenderAsNumber(val, parseNumbers)
                ? parseNumber(val, { parseNumbers: 'strict' })
                : val
          ),
        },
      };
    }

    case 'between':
    case 'notbetween': {
      const valueAsArray = toArray(value, { retainEmptyStrings: true });
      if (
        valueAsArray.length < 2 ||
        !isValidValue(valueAsArray[0]) ||
        !isValidValue(valueAsArray[1])
      ) {
        return;
      }

      const [first, second] = valueAsArray;

      const firstNum = shouldRenderAsNumber(first, parseNumbers)
        ? parseNumber(first, { parseNumbers: 'strict' })
        : Number.NaN;
      const secondNum = shouldRenderAsNumber(second, parseNumbers)
        ? parseNumber(second, { parseNumbers: 'strict' })
        : Number.NaN;
      const firstValue = Number.isNaN(firstNum) ? first : firstNum;
      const secondValue = Number.isNaN(secondNum) ? second : secondNum;
      const valsOneAndTwoOnly = [firstValue, secondValue];
      if (
        !preserveValueOrder &&
        firstValue === firstNum &&
        secondValue === secondNum &&
        secondNum < firstNum
      ) {
        valsOneAndTwoOnly[0] = secondNum;
        valsOneAndTwoOnly[1] = firstNum;
      }

      return {
        [field]: {
          [operatorLC === 'between' ? Op.between : Op.notBetween]: valueIsField
            ? valsOneAndTwoOnly.map(v => col!(v))
            : valsOneAndTwoOnly.every(v => shouldRenderAsNumber(v, parseNumbers))
              ? valsOneAndTwoOnly.map(v => parseNumber(v, { parseNumbers: 'strict' }))
              : valsOneAndTwoOnly,
        },
      };
    }
  }
  return;
};
