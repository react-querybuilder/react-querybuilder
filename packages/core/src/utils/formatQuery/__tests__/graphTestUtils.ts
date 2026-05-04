/**
 * Custom ruleProcessor functions demonstrating graph-database-specific query patterns.
 *
 * These extend the default rule processors for Cypher, SPARQL, and Gremlin with
 * operators not in DefaultOperatorName: regex matching, typed literals, list
 * containment, and case-insensitive matching.
 */

import type { RuleGroupType, RuleProcessor } from '../../../types';
import { defaultRuleProcessorCypher } from '../defaultRuleProcessorCypher';
import { defaultRuleProcessorGremlin } from '../defaultRuleProcessorGremlin';
import { defaultRuleProcessorSPARQL } from '../defaultRuleProcessorSPARQL';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const escapeSingleQuotes = (v: string) => v.replaceAll("'", "\\'");
const escapeDoubleQuotes = (v: string) => v.replaceAll('"', '\\"');

// ─── Cypher Custom Processors ─────────────────────────────────────────────────

/**
 * Extends default Cypher rule processor with:
 * - matchesRegex / doesNotMatchRegex
 * - listContains / listDoesNotContain
 * - equalsIgnoreCase / containsIgnoreCase / beginsWithIgnoreCase
 */
export const cypherGraphProcessor: RuleProcessor = (rule, opts) => {
  const { field, operator, value } = rule;
  const operatorTL = operator.toLowerCase();
  const escVal = (v: string) => `'${escapeSingleQuotes(v)}'`;

  switch (operatorTL) {
    case 'matchesregex':
      return `${field} =~ ${escVal(value)}`;
    case 'doesnotmatchregex':
      return `NOT ${field} =~ ${escVal(value)}`;
    case 'listcontains':
      return `${escVal(value)} IN ${field}`;
    case 'listdoesnotcontain':
      return `NOT ${escVal(value)} IN ${field}`;
    case 'equalsignorecase':
      return `toLower(${field}) = toLower(${escVal(value)})`;
    case 'containsignorecase':
      return `toLower(${field}) CONTAINS toLower(${escVal(value)})`;
    case 'beginswithignorecase':
      return `toLower(${field}) STARTS WITH toLower(${escVal(value)})`;
    default:
      return defaultRuleProcessorCypher(rule, opts);
  }
};

// ─── SPARQL Custom Processors ─────────────────────────────────────────────────

/**
 * Extends default SPARQL rule processor with:
 * - matchesRegex / doesNotMatchRegex
 * - equalsIgnoreCase / containsIgnoreCase / beginsWithIgnoreCase
 */
export const sparqlGraphProcessor: RuleProcessor = (rule, opts) => {
  const { field, operator, value } = rule;
  const operatorTL = operator.toLowerCase();
  const escVal = (v: string) => `"${escapeDoubleQuotes(v)}"`;

  switch (operatorTL) {
    case 'matchesregex':
      return `REGEX(${field}, ${escVal(value)})`;
    case 'doesnotmatchregex':
      return `!REGEX(${field}, ${escVal(value)})`;
    case 'equalsignorecase':
      return `LCASE(${field}) = LCASE(${escVal(value)})`;
    case 'containsignorecase':
      return `CONTAINS(LCASE(${field}), LCASE(${escVal(value)}))`;
    case 'beginswithignorecase':
      return `STRSTARTS(LCASE(${field}), LCASE(${escVal(value)}))`;
    default:
      return defaultRuleProcessorSPARQL(rule, opts);
  }
};

/**
 * Extends default SPARQL rule processor with typed literal support.
 * Emits xsd:integer, xsd:decimal, xsd:date, xsd:dateTime based on fieldData.inputType.
 */
export const sparqlTypedLiteralProcessor: RuleProcessor = (rule, opts) => {
  const { field, operator, value } = rule;
  const operatorTL = operator.toLowerCase();
  const inputType = opts?.fieldData?.inputType;

  // Only handle comparison operators with typed values
  if (['=', '!=', '<', '>', '<=', '>='].includes(operatorTL) && inputType && value != null) {
    let typedValue: string;
    const strVal = String(value);

    switch (inputType) {
      case 'number': {
        const xsdType = strVal.includes('.') ? 'xsd:decimal' : 'xsd:integer';
        typedValue = `"${strVal}"^^${xsdType}`;
        break;
      }
      case 'date':
        typedValue = `"${strVal}"^^xsd:date`;
        break;
      case 'datetime-local':
        typedValue = `"${strVal}"^^xsd:dateTime`;
        break;
      default:
        return defaultRuleProcessorSPARQL(rule, opts);
    }

    const op = operatorTL === '<>' ? '!=' : operatorTL;
    return `${field} ${op} ${typedValue}`;
  }

  return defaultRuleProcessorSPARQL(rule, opts);
};

// ─── Gremlin Custom Processors ────────────────────────────────────────────────

/**
 * Extends default Gremlin rule processor with:
 * - matchesRegex / doesNotMatchRegex
 * - listContains / listDoesNotContain
 * - equalsIgnoreCase / containsIgnoreCase / beginsWithIgnoreCase
 */
export const gremlinGraphProcessor: RuleProcessor = (rule, opts) => {
  const { field, operator, value } = rule;
  const operatorTL = operator.toLowerCase();
  const prop = field.includes('.') ? field.split('.').pop()! : field;
  const escVal = (v: string) => `'${escapeSingleQuotes(v)}'`;

  switch (operatorTL) {
    case 'matchesregex':
      return `.has('${prop}', regex(${escVal(value)}))`;
    case 'doesnotmatchregex':
      return `.has('${prop}', notRegex(${escVal(value)}))`;
    case 'listcontains':
      return `.has('${prop}', containing(${escVal(value)}))`;
    case 'listdoesnotcontain':
      return `.has('${prop}', notContaining(${escVal(value)}))`;
    case 'equalsignorecase':
      return `.has('${prop}', eq(${escVal(value)}).ignoreCase())`;
    case 'containsignorecase':
      return `.has('${prop}', containing(${escVal(value)}).ignoreCase())`;
    case 'beginswithignorecase':
      return `.has('${prop}', startingWith(${escVal(value)}).ignoreCase())`;
    default:
      return defaultRuleProcessorGremlin(rule, opts);
  }
};

// ─── Test Queries ─────────────────────────────────────────────────────────────

/** Regex: match madeUpName ending in "man" */
export const regexQuery = (fieldPrefix = ''): RuleGroupType => ({
  combinator: 'and',
  rules: [{ field: `${fieldPrefix}madeUpName`, operator: 'matchesRegex', value: '.*man$' }],
});

/** Regex negation: madeUpName does NOT start with "S" */
export const regexNegationQuery = (fieldPrefix = ''): RuleGroupType => ({
  combinator: 'and',
  rules: [{ field: `${fieldPrefix}madeUpName`, operator: 'doesNotMatchRegex', value: '^S.*' }],
});

/** List containment: nicknames contains 'Cap' */
export const listContainsQuery = (fieldPrefix = ''): RuleGroupType => ({
  combinator: 'and',
  rules: [{ field: `${fieldPrefix}nicknames`, operator: 'listContains', value: 'Cap' }],
});

/** List does not contain: nicknames does not contain 'Spidey' */
export const listDoesNotContainQuery = (fieldPrefix = ''): RuleGroupType => ({
  combinator: 'and',
  rules: [{ field: `${fieldPrefix}nicknames`, operator: 'listDoesNotContain', value: 'Spidey' }],
});

/** Case-insensitive equals */
export const caseInsensitiveEqualsQuery = (fieldPrefix = ''): RuleGroupType => ({
  combinator: 'and',
  rules: [{ field: `${fieldPrefix}firstName`, operator: 'equalsIgnoreCase', value: 'steve' }],
});

/** Case-insensitive contains */
export const caseInsensitiveContainsQuery = (fieldPrefix = ''): RuleGroupType => ({
  combinator: 'and',
  rules: [{ field: `${fieldPrefix}madeUpName`, operator: 'containsIgnoreCase', value: 'spider' }],
});

/** Case-insensitive beginsWith */
export const caseInsensitiveBeginsWithQuery = (fieldPrefix = ''): RuleGroupType => ({
  combinator: 'and',
  rules: [{ field: `${fieldPrefix}madeUpName`, operator: 'beginsWithIgnoreCase', value: 'super' }],
});
