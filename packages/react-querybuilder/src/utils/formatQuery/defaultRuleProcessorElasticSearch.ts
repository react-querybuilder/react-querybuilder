import type { DefaultOperatorName, RuleProcessor } from '../../types/index.noReact';
import { toArray } from '../arrayUtils';
import { parseNumber } from '../parseNumber';
import { isValidValue, shouldRenderAsNumber } from './utils';

type RangeOperator = 'gt' | 'gte' | 'lt' | 'lte';
type RangeRule = (
  | { gt: string | number }
  | { gte: string | number }
  | { lt: string | number }
  | { lte: string | number }
) & { [k in RangeOperator]?: string | number };
type ElasticSearchRule =
  | { range: Record<string, RangeRule> }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | { term: Record<string, any> }
  | { exists: { field: string } }
  | { regexp: { [k: string]: { value: string } } };
type ElasticSearchQuery = {
  bool:
    | { filter: { script: { script: string } } }
    | { must: ElasticSearchRule | ElasticSearchQuery | (ElasticSearchRule | ElasticSearchQuery)[] }
    | {
        must_not:
          | ElasticSearchRule
          | ElasticSearchQuery
          | (ElasticSearchRule | ElasticSearchQuery)[];
      }
    | {
        should: ElasticSearchRule | ElasticSearchQuery | (ElasticSearchRule | ElasticSearchQuery)[];
      };
};

const rangeOperatorMap = { '<': 'lt', '<=': 'lte', '>': 'gt', '>=': 'gte' } satisfies Record<
  '<' | '<=' | '>' | '>=',
  RangeOperator
>;

const negateIfNotOp = (
  op: string,
  elasticSearchRule: ElasticSearchRule
): ElasticSearchQuery | ElasticSearchRule =>
  op.startsWith('not') || op.startsWith('doesnot')
    ? { bool: { must_not: elasticSearchRule } }
    : elasticSearchRule;

const escapeSQ = (s: string) => s?.replace(/('|\\)/g, `\\$1`);

const textFunctionMap: Partial<Record<Lowercase<DefaultOperatorName>, string>> = {
  beginswith: 'startsWith',
  doesnotbeginwith: 'startsWith',
  doesnotcontain: 'contains',
  doesnotendwith: 'endsWith',
  endswith: 'endsWith',
};
const getTextScript = (f: string, o: Lowercase<DefaultOperatorName>, v: string) => {
  const script = `doc['${f}'].value.${textFunctionMap[o] ?? o}(doc['${v}'].value)`;
  return o.startsWith('d') ? `!${script}` : script;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const valueRenderer = (v: any, parseNumbers?: boolean) =>
  typeof v === 'boolean'
    ? v
    : shouldRenderAsNumber(v, parseNumbers)
      ? parseNumber(v, { parseNumbers })
      : v;

/**
 * Default rule processor used by {@link formatQuery} for "elasticsearch" format.
 */
export const defaultRuleProcessorElasticSearch: RuleProcessor = (
  { field, operator, value, valueSource },
  { parseNumbers } = {}
): ElasticSearchQuery | ElasticSearchRule | false => {
  const operatorLC = operator.toLowerCase() as Lowercase<DefaultOperatorName>;

  if (valueSource === 'field') {
    // Bail out if not all values are strings
    if (toArray(value).some(v => typeof v !== 'string')) return false;

    const fieldForScript = escapeSQ(field);

    switch (operatorLC) {
      case '=':
      case '!=':
      case '>':
      case '>=':
      case '<':
      case '<=': {
        const operatorForScript = operatorLC === '=' ? '==' : operatorLC;
        const valueForScript = escapeSQ(value);
        return valueForScript
          ? {
              bool: {
                filter: {
                  script: {
                    script: `doc['${fieldForScript}'].value ${operatorForScript} doc['${valueForScript}'].value`,
                  },
                },
              },
            }
          : false;
      }

      case 'in':
      case 'notin': {
        const valueAsArray = toArray(value);
        if (valueAsArray.length > 0) {
          const arr = valueAsArray.map(v => ({
            bool: {
              filter: { script: { script: `doc['${fieldForScript}'].value == doc['${v}'].value` } },
            },
          }));
          return { bool: operatorLC === 'in' ? { should: arr } : { must_not: arr } };
        }
        return false;
      }

      case 'between':
      case 'notbetween': {
        const valueAsArray = toArray(value);
        if (valueAsArray.length >= 2 && valueAsArray[0] && valueAsArray[1]) {
          const script = `doc['${fieldForScript}'].value >= doc['${valueAsArray[0]}'].value && doc['${fieldForScript}'].value <= doc['${valueAsArray[1]}'].value`;
          return {
            bool: {
              filter: { script: { script: operatorLC === 'notbetween' ? `!(${script})` : script } },
            },
          };
        }
        return false;
      }

      case 'contains':
      case 'doesnotcontain':
      case 'beginswith':
      case 'doesnotbeginwith':
      case 'endswith':
      case 'doesnotendwith': {
        const valueForScript = escapeSQ(value);
        if (!valueForScript) return false;
        const script = getTextScript(fieldForScript, operatorLC, valueForScript);
        return {
          bool: {
            filter: {
              script: {
                script,
              },
            },
          },
        };
      }
    }
  }

  switch (operatorLC) {
    case '<':
    case '<=':
    case '>':
    case '>=':
      return {
        range: {
          [field]: {
            [rangeOperatorMap[operatorLC]]: valueRenderer(value, parseNumbers),
          } as RangeRule,
        },
      };

    case '=':
      return { term: { [field]: valueRenderer(value, parseNumbers) } };

    case '!=':
      return { bool: { must_not: { term: { [field]: valueRenderer(value, parseNumbers) } } } };

    case 'null':
      return { bool: { must_not: { exists: { field } } } };

    case 'notnull':
      return { exists: { field } };

    case 'in':
    case 'notin': {
      const valueAsArray = toArray(value).map(v => valueRenderer(v, parseNumbers));
      if (valueAsArray.length > 0) {
        const arr = valueAsArray.map(v => ({ term: { [field]: valueRenderer(v, parseNumbers) } }));
        return { bool: operatorLC === 'in' ? { should: arr } : { must_not: arr } };
      }
      return false;
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
        if (shouldRenderAsNumber(first, true) && shouldRenderAsNumber(second, true)) {
          const firstNum = parseNumber(first, { parseNumbers: true });
          const secondNum = parseNumber(second, { parseNumbers: true });
          if (secondNum < firstNum) {
            const tempNum = secondNum;
            second = firstNum;
            first = tempNum;
          } else {
            first = firstNum;
            second = secondNum;
          }
        }
        return negateIfNotOp(operatorLC, { range: { [field]: { gte: first, lte: second } } });
      }
      return false;
    }

    case 'contains':
    case 'doesnotcontain':
      return negateIfNotOp(operatorLC, { regexp: { [field]: { value: `.*${value}.*` } } });

    case 'beginswith':
    case 'doesnotbeginwith':
      return negateIfNotOp(operatorLC, { regexp: { [field]: { value: `${value}.*` } } });

    case 'endswith':
    case 'doesnotendwith':
      return negateIfNotOp(operatorLC, { regexp: { [field]: { value: `.*${value}` } } });
  }
  return false;
};
