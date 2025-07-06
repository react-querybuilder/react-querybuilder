import type {
  FormatQueryFinalOptions,
  RuleGroupType,
  RuleProcessor,
} from '../../types/index.noReact';
import { toArray, trimIfString } from '../arrayUtils';
import { lc, nullOrUndefinedOrEmpty } from '../misc';
import { parseNumber } from '../parseNumber';
import { transformQuery } from '../transformQuery';
import { defaultRuleGroupProcessorJSONata } from './defaultRuleGroupProcessorJSONata';
import { getQuotedFieldName, processMatchMode, shouldRenderAsNumber } from './utils';

const shouldNegate = (op: string) => op.startsWith('not') || op.startsWith('doesnot');

const quote = (v: string | number | boolean | object | null, escapeQuotes?: boolean) =>
  `"${typeof v !== 'string' || !escapeQuotes ? v : v.replaceAll(`"`, `\\"`)}"`;

const negate = (clause: string, negate: boolean) => (negate ? `$not(${clause})` : `${clause}`);

const escapeStringRegex = (s: string) =>
  `${s}`.replaceAll(/[/$()*+.?[\\\]^{|}]/g, String.raw`\$&`).replaceAll('-', String.raw`\x2d`);

/**
 * Default rule processor used by {@link formatQuery} for "jsonata" format.
 *
 * @group Export
 */
export const defaultRuleProcessorJSONata: RuleProcessor = (
  rule,
  // istanbul ignore next
  options = {}
) => {
  const { field, operator, value, valueSource } = rule;
  const {
    escapeQuotes,
    parseNumbers = true,
    preserveValueOrder,
    quoteFieldNamesWith = ['', ''] as [string, string],
    fieldIdentifierSeparator = '',
  } = options;

  const valueIsField = valueSource === 'field';
  const useBareValue =
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint' ||
    shouldRenderAsNumber(value, parseNumbers);

  const qfn = (f: string) =>
    getQuotedFieldName(f, { quoteFieldNamesWith, fieldIdentifierSeparator });

  const matchEval = processMatchMode(rule);

  if (matchEval === false) {
    return;
  } else if (matchEval) {
    const { mode, threshold } = matchEval;

    const totalCount = `$count(${qfn(field)})`;
    const filteredCount = `$count($filter(${qfn(field)}, function($v) {${defaultRuleGroupProcessorJSONata(
      transformQuery(value as RuleGroupType, {
        ruleProcessor: r => ({ ...r, field: r.field ? `$v.${r.field}` : '$v' }),
      }),
      options as FormatQueryFinalOptions
    )}}))`;

    switch (mode) {
      case 'all':
        return `${filteredCount} = ${totalCount}`;

      case 'none':
        return `${filteredCount} = 0`;

      case 'some':
        return `${filteredCount} > 0`;

      case 'atleast':
      case 'atmost':
      case 'exactly': {
        const op = mode === 'atleast' ? '>=' : mode === 'atmost' ? '<=' : '=';

        if (threshold > 0 && threshold < 1) {
          return `${filteredCount} ${op} (${totalCount} * ${threshold})`;
        }
        return `${filteredCount} ${op} ${threshold}`;
      }
    }
  }

  const operatorLC = lc(operator);
  switch (operatorLC) {
    case '<':
    case '<=':
    case '=':
    case '!=':
    case '>':
    case '>=':
      return `${qfn(field)} ${operatorLC} ${
        valueIsField
          ? qfn(trimIfString(value))
          : useBareValue
            ? trimIfString(value)
            : quote(value, escapeQuotes)
      }`;

    case 'contains':
    case 'doesnotcontain':
      return negate(
        `$contains(${qfn(field)}, ${valueIsField ? qfn(trimIfString(value)) : quote(value, escapeQuotes)})`,
        shouldNegate(operatorLC)
      );

    case 'beginswith':
    case 'doesnotbeginwith':
      return negate(
        valueIsField
          ? `$substring(${qfn(field)}, 0, $length(${qfn(trimIfString(value))})) = ${qfn(trimIfString(value))}`
          : `$contains(${qfn(field)}, /^${escapeStringRegex(value)}/)`,
        shouldNegate(operatorLC)
      );

    case 'endswith':
    case 'doesnotendwith':
      return negate(
        valueIsField
          ? `$substring(${qfn(field)}, $length(${qfn(field)}) - $length(${qfn(trimIfString(value))})) = ${qfn(trimIfString(value))}`
          : `$contains(${qfn(field)}, /${escapeStringRegex(value)}$/)`,
        shouldNegate(operatorLC)
      );

    case 'null':
      return `${qfn(field)} = null`;

    case 'notnull':
      return `${qfn(field)} != null`;

    case 'in':
    case 'notin': {
      const valueAsArray = toArray(value);
      return negate(
        `${qfn(field)} in [${valueAsArray
          .map(val =>
            valueIsField
              ? `${qfn(trimIfString(val))}`
              : shouldRenderAsNumber(val, parseNumbers)
                ? `${trimIfString(val)}`
                : quote(val, escapeQuotes)
          )
          .join(', ')}]`,
        shouldNegate(operatorLC)
      );
    }

    case 'between':
    case 'notbetween': {
      const valueAsArray = toArray(value);
      if (
        valueAsArray.length < 2 ||
        nullOrUndefinedOrEmpty(valueAsArray[0]) ||
        nullOrUndefinedOrEmpty(valueAsArray[1])
      ) {
        return '';
      }

      const [first, second] = valueAsArray;
      const firstNum = shouldRenderAsNumber(first, true)
        ? parseNumber(first, { parseNumbers: true })
        : Number.NaN;
      const secondNum = shouldRenderAsNumber(second, true)
        ? parseNumber(second, { parseNumbers: true })
        : Number.NaN;
      let firstValue = Number.isNaN(firstNum) ? (valueIsField ? `${first}` : first) : firstNum;
      let secondValue = Number.isNaN(secondNum) ? (valueIsField ? `${second}` : second) : secondNum;

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

      const renderAsNumbers =
        shouldRenderAsNumber(first, parseNumbers) && shouldRenderAsNumber(second, parseNumbers);

      const expression = `${qfn(field)} >= ${valueIsField ? qfn(first) : renderAsNumbers ? firstValue : quote(firstValue, escapeQuotes)} and ${qfn(field)} <= ${valueIsField ? qfn(second) : renderAsNumbers ? secondValue : quote(secondValue, escapeQuotes)}`;

      return operatorLC === 'between' ? `(${expression})` : negate(expression, true);
    }
  }

  return '';
};
