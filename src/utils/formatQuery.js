import { isRuleGroup } from '.';

/**
 * Formats a query in the requested output format.  The optional
 * `valueProcessor` argument can be used to format the values differently
 * based on a given field, operator, and value.  By default, values are
 * processed assuming the default operators are being used.
 * @param {RuleGroup} ruleGroup
 * @param {"json"|"sql"|"json_without_ids"} format
 * @param {Function} valueProcessor
 */
const formatQuery = (ruleGroup, format, valueProcessor) => {
  if (format.toLowerCase() === 'json') {
    return JSON.stringify(ruleGroup, null, 2);
  } else if (format.toLowerCase() === 'sql') {
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
        } else if(operator.toLowerCase() === 'contains' || operator.toLowerCase() === 'doesnotcontain') {
          val = `"%${value}%"`;
        } else if(operator.toLowerCase() === 'beginswith' || operator.toLowerCase() === 'doesnotbeginwith') {
          val = `"${value}%"`;
        } else if(operator.toLowerCase() === 'endswith' || operator.toLowerCase() === 'doesnotendwith') {
          val = `"%${value}"`;
        } else if (typeof value === 'boolean') {
          val = `${value}`.toUpperCase();
        }
        return val;
      });

    const processRule = (rule) => {
      const value = valueProc(rule.field, rule.operator, rule.value);

      let operator = rule.operator;
      switch(rule.operator.toLowerCase()) {
        case 'null':
          operator = 'is null';
          break;
        case 'notnull':
          operator = 'is not null';
          break;
        case 'notin':
          operator = 'not in';
          break;
        case 'contains':
        case 'beginswith':
        case 'endswith':
          operator = 'like';
          break;
        case 'doesnotcontain':
        case 'doesnotbeginwith':
        case 'doesnotendwith':
          operator = 'not like';
          break;
        default:
          break;
      }

      return `${rule.field} ${operator} ${value}`.trim();
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

    return processRuleGroup(ruleGroup);
  } else if (format.toLowerCase() === 'json_without_ids') {
    return JSON.stringify(removeIdsFromRuleGroup(ruleGroup))
  } else {
    return '';
  }
};

const removeIdsFromRuleGroup = ruleGroup => {
  const ruleGroupCopy = { ...ruleGroup };
  delete ruleGroupCopy.id;
  if (ruleGroupCopy.rules) {
    ruleGroupCopy.rules = ruleGroupCopy.rules.map(rule => removeIdsFromRuleGroup(rule));
  }
  return ruleGroupCopy;
}

export default formatQuery;
