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
  /^(does)?not/i.test(op) ? { bool: { must_not: elasticSearchRule } } : elasticSearchRule;

const escapeSQ = (s: string) => s?.replace(/('|\\)/g, `\\$1`);

const textFunctionMap: Partial<Record<DefaultOperatorName, string>> = {
  beginsWith: 'startsWith',
  doesNotContain: 'contains',
  doesNotBeginWith: 'startsWith',
  doesNotEndWith: 'endsWith',
};
const getTextScript = (f: string, o: DefaultOperatorName, v: string) => {
  const script = `doc['${f}'].${textFunctionMap[o] ?? o}(doc['${v}'])`;
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
  if (valueSource === 'field') {
    // Bail out if not all values are strings
    if (toArray(value).some(v => typeof v !== 'string')) return false;

    const fieldForScript = escapeSQ(field);

    switch (operator) {
      case '=':
      case '!=':
      case '>':
      case '>=':
      case '<':
      case '<=': {
        const operatorForScript = operator === '=' ? '==' : operator;
        const valueForScript = escapeSQ(value);
        return !valueForScript
          ? false
          : {
              bool: {
                filter: {
                  script: {
                    script: `doc['${fieldForScript}'] ${operatorForScript} doc['${valueForScript}']`,
                  },
                },
              },
            };
      }

      case 'in':
      case 'notIn': {
        const valueAsArray = toArray(value);
        if (valueAsArray.length > 0) {
          const arr = valueAsArray.map(v => ({
            bool: { filter: { script: { script: `doc['${fieldForScript}'] == doc['${v}']` } } },
          }));
          return { bool: operator === 'in' ? { should: arr } : { must_not: arr } };
        }
        return false;
      }

      case 'between':
      case 'notBetween': {
        const valueAsArray = toArray(value);
        if (valueAsArray.length >= 2 && valueAsArray[0] && valueAsArray[1]) {
          const script = `doc['${fieldForScript}'] >= doc['${valueAsArray[0]}'] && doc['${fieldForScript}'] <= doc['${valueAsArray[1]}']`;
          return {
            bool: {
              filter: { script: { script: operator === 'notBetween' ? `!(${script})` : script } },
            },
          };
        }
        return false;
      }

      case 'contains':
      case 'doesNotContain':
      case 'beginsWith':
      case 'doesNotBeginWith':
      case 'endsWith':
      case 'doesNotEndWith': {
        const valueForScript = escapeSQ(value);
        if (!valueForScript) return false;
        const script = getTextScript(fieldForScript, operator, valueForScript);
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

  switch (operator) {
    case '<':
    case '<=':
    case '>':
    case '>=':
      return {
        range: {
          [field]: {
            [rangeOperatorMap[operator]]: valueRenderer(value, parseNumbers),
          } as RangeRule,
        },
      };

    case '=':
      return { term: { [field]: valueRenderer(value, parseNumbers) } };

    case '!=':
      return { bool: { must_not: { term: { [field]: valueRenderer(value, parseNumbers) } } } };

    case 'null':
      return { bool: { must_not: { exists: { field } } } };

    case 'notNull':
      return { exists: { field } };

    case 'in':
    case 'notIn': {
      const valueAsArray = toArray(value).map(v => valueRenderer(v, parseNumbers));
      if (valueAsArray.length > 0) {
        const arr = valueAsArray.map(v => ({ term: { [field]: valueRenderer(v, parseNumbers) } }));
        return { bool: operator === 'in' ? { should: arr } : { must_not: arr } };
      }
      return false;
    }

    case 'between':
    case 'notBetween': {
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
        return negateIfNotOp(operator, { range: { [field]: { gte: first, lte: second } } });
      }
      return false;
    }

    case 'contains':
    case 'doesNotContain':
      return negateIfNotOp(operator, { regexp: { [field]: { value: `.*${value}.*` } } });

    case 'beginsWith':
    case 'doesNotBeginWith':
      return negateIfNotOp(operator, { regexp: { [field]: { value: `${value}.*` } } });

    case 'endsWith':
    case 'doesNotEndWith':
      return negateIfNotOp(operator, { regexp: { [field]: { value: `.*${value}` } } });
  }
  return false;
};
