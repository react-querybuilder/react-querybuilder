import { isRuleGroup } from '.';

const mapOperator = (op) => {
  switch (op.toLowerCase()) {
    case 'null':
      return 'is null';
    case 'notnull':
      return 'is not null';
    case 'notin':
      return 'not in';
    case 'contains':
    case 'beginswith':
    case 'endswith':
      return 'like';
    case 'doesnotcontain':
    case 'doesnotbeginwith':
    case 'doesnotendwith':
      return 'not like';
    default:
      return op;
  }
};

/**
 * Formats a query in the requested output format.  The optional
 * `valueProcessor` argument can be used to format the values differently
 * based on a given field, operator, and value.  By default, values are
 * processed assuming the default operators are being used.
 * @param {RuleGroup} ruleGroup
 * @param {"json"|"sql"|"json_without_ids"|"parameterized"} format
 * @param {Function} valueProcessor
 */
const formatQuery = (ruleGroup, format, valueProcessor) => {
  if (format.toLowerCase() === 'json') {
    return JSON.stringify(ruleGroup, null, 2);
  } else if (format.toLowerCase() === 'sql' || format.toLowerCase() === 'parameterized') {
    const parameterized = format.toLowerCase() === 'parameterized';
    const params = [];

    const valueProc =
      valueProcessor ||
      ((field, operator, value) => {
        let val = `"${value}"`;
        if (operator.toLowerCase() === 'null' || operator.toLowerCase() === 'notnull') {
          val = '';
        } else if (operator.toLowerCase() === 'in' || operator.toLowerCase() === 'notin') {
          val = `(${value
            .split(',')
            .map((v) => `"${v.trim()}"`)
            .join(', ')})`;
        } else if (
          operator.toLowerCase() === 'contains' ||
          operator.toLowerCase() === 'doesnotcontain'
        ) {
          val = `"%${value}%"`;
        } else if (
          operator.toLowerCase() === 'beginswith' ||
          operator.toLowerCase() === 'doesnotbeginwith'
        ) {
          val = `"${value}%"`;
        } else if (
          operator.toLowerCase() === 'endswith' ||
          operator.toLowerCase() === 'doesnotendwith'
        ) {
          val = `"%${value}"`;
        } else if (typeof value === 'boolean') {
          val = `${value}`.toUpperCase();
        }
        return val;
      });

    const processRule = (rule) => {
      const value = valueProc(rule.field, rule.operator, rule.value);
      const operator = mapOperator(rule.operator);

      if (parameterized && value) {

        if (operator.toLowerCase() === 'in' || operator.toLowerCase() === 'not in') {
          const splitValue = rule.value.split(',').map((v) => v.trim());
          splitValue.forEach((v) => params.push(v));
          return `${rule.field} ${operator} (${splitValue.map((v) => '?').join(', ')})`;
        }

        params.push(value.match(/^"?(.*?)"?$/)[1]);
      }
      return `${rule.field} ${operator} ${parameterized && value ? '?' : value}`.trim();
    };

    const processRuleGroup = (rg) => {
      const processedRules = rg.rules.map((rule) => {
        if (isRuleGroup(rule)) {
          return processRuleGroup(rule);
        }
        return processRule(rule);
      });
      return `${rg.not ? 'NOT ' : ''}(${processedRules.join(` ${rg.combinator} `)})`;
    };

    if (parameterized) {
      return { sql: processRuleGroup(ruleGroup), params };
    } else {
      return processRuleGroup(ruleGroup);
    }
  } else if (format.toLowerCase() === 'json_without_ids') {
    return JSON.stringify(removeIdsFromRuleGroup(ruleGroup));
  } else {
    return '';
  }
};

const removeIdsFromRuleGroup = (ruleGroup) => {
  const ruleGroupCopy = { ...ruleGroup };
  delete ruleGroupCopy.id;
  if (ruleGroupCopy.rules) {
    ruleGroupCopy.rules = ruleGroupCopy.rules.map((rule) => removeIdsFromRuleGroup(rule));
  }
  return ruleGroupCopy;
};

export default formatQuery;
