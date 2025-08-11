import type {
  FormatQueryFinalOptions,
  RuleGroupType,
  RuleProcessor,
} from '../../types/index.noReact';
import { toArray, trimIfString } from '../arrayUtils';
import { lc, nullOrUndefinedOrEmpty } from '../misc';
import { parseNumber } from '../parseNumber';
import { transformQuery } from '../transformQuery';
import { defaultRuleGroupProcessorCEL } from './defaultRuleGroupProcessorCEL';
import { processMatchMode, shouldRenderAsNumber } from './utils';

const shouldNegate = (op: string) => op.startsWith('not') || op.startsWith('doesnot');

const escapeDoubleQuotes = (
  v: string | number | boolean | object | null,
  escapeQuotes?: boolean
) => (typeof v !== 'string' || !escapeQuotes ? v : v.replaceAll(`"`, `\\"`));

/**
 * Default rule processor used by {@link formatQuery} for "cel" format.
 *
 * @group Export
 */
export const defaultRuleProcessorCEL: RuleProcessor = (
  rule,
  // istanbul ignore next
  opts = {}
) => {
  const { escapeQuotes, parseNumbers, preserveValueOrder } = opts;
  const { field, operator, value, valueSource } = rule;
  const valueIsField = valueSource === 'field';
  const operatorTL = lc(operator === '=' ? '==' : operator);
  const useBareValue =
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint' ||
    shouldRenderAsNumber(value, parseNumbers);

  const matchEval = processMatchMode(rule);

  if (matchEval === false) {
    return '';
  } else if (matchEval) {
    const { mode, threshold } = matchEval;

    // TODO?: Randomize this alias
    const arrayElementAlias = 'elem_alias';

    const celQuery = transformQuery(rule.value as RuleGroupType, {
      ruleProcessor: r => ({ ...r, field: `${arrayElementAlias}${r.field ? `.${r.field}` : ''}` }),
    });
    const nestedArrayFilter = defaultRuleGroupProcessorCEL(
      celQuery,
      opts as FormatQueryFinalOptions
    );

    switch (mode) {
      case 'all':
        return `${field}.all(${arrayElementAlias}, ${nestedArrayFilter})`;

      case 'none':
      case 'some':
        return `${mode === 'none' ? '!' : ''}${field}.exists(${arrayElementAlias}, ${nestedArrayFilter})`;

      case 'atleast':
      case 'atmost':
      case 'exactly': {
        const totalCount = `double(${field}.size())`;
        const filteredCount = `${field}.filter(${arrayElementAlias}, ${nestedArrayFilter}).size()`;

        const op = mode === 'atleast' ? '>=' : mode === 'atmost' ? '<=' : '==';

        if (threshold > 0 && threshold < 1) {
          return `${filteredCount} ${op} (${totalCount} * ${threshold})`;
        }
        return `${filteredCount} ${op} ${threshold}`;
      }
    }
  }

  switch (operatorTL) {
    case '<':
    case '<=':
    case '==':
    case '!=':
    case '>':
    case '>=':
      return `${field} ${operatorTL} ${
        valueIsField || useBareValue
          ? trimIfString(value)
          : `"${escapeDoubleQuotes(value, escapeQuotes)}"`
      }`;

    case 'contains':
    case 'doesnotcontain': {
      const negate = shouldNegate(operatorTL) ? '!' : '';
      return `${negate}${field}.contains(${
        valueIsField ? trimIfString(value) : `"${escapeDoubleQuotes(value, escapeQuotes)}"`
      })`;
    }

    case 'beginswith':
    case 'doesnotbeginwith': {
      const negate = shouldNegate(operatorTL) ? '!' : '';
      return `${negate}${field}.startsWith(${
        valueIsField ? trimIfString(value) : `"${escapeDoubleQuotes(value, escapeQuotes)}"`
      })`;
    }

    case 'endswith':
    case 'doesnotendwith': {
      const negate = shouldNegate(operatorTL) ? '!' : '';
      return `${negate}${field}.endsWith(${
        valueIsField ? trimIfString(value) : `"${escapeDoubleQuotes(value, escapeQuotes)}"`
      })`;
    }

    case 'null':
      return `${field} == null`;

    case 'notnull':
      return `${field} != null`;

    case 'in':
    case 'notin': {
      const [prefix, suffix] = shouldNegate(operatorTL) ? ['!(', ')'] : ['', ''];
      const valueAsArray = toArray(value);
      return `${prefix}${field} in [${valueAsArray
        .map(val =>
          valueIsField || shouldRenderAsNumber(val, parseNumbers)
            ? `${trimIfString(val)}`
            : `"${escapeDoubleQuotes(val, escapeQuotes)}"`
        )
        .join(', ')}]${suffix}`;
    }

    case 'between':
    case 'notbetween': {
      const valueAsArray = toArray(value);
      if (
        valueAsArray.length >= 2 &&
        !nullOrUndefinedOrEmpty(valueAsArray[0]) &&
        !nullOrUndefinedOrEmpty(valueAsArray[1])
      ) {
        const [first, second] = valueAsArray;
        // For backwards compatibility, default to parsing numbers for between operators
        // unless parseNumbers is explicitly set to false
        const shouldParseNumbers = !(parseNumbers === false);
        const firstNum = shouldRenderAsNumber(first, shouldParseNumbers)
          ? parseNumber(first, { parseNumbers: shouldParseNumbers })
          : Number.NaN;
        const secondNum = shouldRenderAsNumber(second, shouldParseNumbers)
          ? parseNumber(second, { parseNumbers: shouldParseNumbers })
          : Number.NaN;
        let firstValue = Number.isNaN(firstNum)
          ? valueIsField
            ? `${first}`
            : `"${escapeDoubleQuotes(first, escapeQuotes)}"`
          : firstNum;
        let secondValue = Number.isNaN(secondNum)
          ? valueIsField
            ? `${second}`
            : `"${escapeDoubleQuotes(second, escapeQuotes)}"`
          : secondNum;

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

        return operatorTL === 'between'
          ? `(${field} >= ${firstValue} && ${field} <= ${secondValue})`
          : `(${field} < ${firstValue} || ${field} > ${secondValue})`;
      } else {
        return '';
      }
    }
  }
  return '';
};
