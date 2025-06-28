import type { RuleProcessor } from '../../types/index.noReact';
import { toArray, trimIfString } from '../arrayUtils';
import { lc, nullOrUndefinedOrEmpty } from '../misc';
import { parseNumber } from '../parseNumber';
import { processMatchMode, shouldRenderAsNumber } from './utils';

const negateIf = (clause: string, negate: boolean) => (negate ? `(!${clause})` : `${clause}`);

const ldapEscape = (s: unknown) =>
  `${trimIfString(s)}`.replaceAll(
    /[()&|=<>~*\\/]/g,
    (m: string) => `\\${m.codePointAt(0)!.toString(16)}`
  );

/**
 * Default rule processor used by {@link formatQuery} for "ldap" format.
 *
 * @group Export
 */
export const defaultRuleProcessorLDAP: RuleProcessor = (
  rule,
  // istanbul ignore next
  options = {}
) => {
  const { field, operator, value, valueSource } = rule;
  const { preserveValueOrder } = options;
  const operatorLC = lc(operator);

  // Bail out if...
  if (
    // This is a field comparison (which LDAP does not support), or
    valueSource === 'field' ||
    // `value` is null/undefined/empty and the operator is not unary, or
    (nullOrUndefinedOrEmpty(value) && operatorLC !== 'null' && operatorLC !== 'notnull') ||
    // a valid `match` property is found (match modes are not supported in this format)
    processMatchMode(rule)
  ) {
    return '';
  }

  switch (operatorLC) {
    case '=':
    case '!=':
      return negateIf(`(${field}=${ldapEscape(value)})`, operatorLC === '!=');

    case '>':
    case '>=':
      return `(${field}>=${ldapEscape(value)})`;

    case '<':
    case '<=':
      return `(${field}<=${ldapEscape(value)})`;

    case 'contains':
    case 'doesnotcontain':
      return negateIf(`(${field}=*${ldapEscape(value)}*)`, operatorLC === 'doesnotcontain');

    case 'beginswith':
    case 'doesnotbeginwith':
      return negateIf(`(${field}=${ldapEscape(value)}*)`, operatorLC === 'doesnotbeginwith');

    case 'endswith':
    case 'doesnotendwith':
      return negateIf(`(${field}=*${ldapEscape(value)})`, operatorLC === 'doesnotendwith');

    case 'null':
    case 'notnull':
      return negateIf(`(${field}=*)`, operatorLC === 'notnull');

    case 'in':
    case 'notin': {
      const valueAsArray = toArray(value);
      return negateIf(
        `(|${valueAsArray.map(val => `(${field}=${ldapEscape(val)})`).join('')})`,
        operatorLC === 'notin'
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
        : NaN;
      const secondNum = shouldRenderAsNumber(second, true)
        ? parseNumber(second, { parseNumbers: true })
        : NaN;
      let firstValue = isNaN(firstNum) ? first : firstNum;
      let secondValue = isNaN(secondNum) ? second : secondNum;

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

      return negateIf(
        `(&(${field}>=${ldapEscape(firstValue)})(${field}<=${ldapEscape(secondValue)}))`,
        operatorLC === 'notbetween'
      );
    }
  }

  // istanbul ignore next
  return '';
};
