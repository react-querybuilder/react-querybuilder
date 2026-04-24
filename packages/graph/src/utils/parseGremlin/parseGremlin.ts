import type { RuleGroupType, RuleType } from '@react-querybuilder/core';
import type { GremlinFilterMeta, GremlinPatternMeta } from '../../types';

/**
 * Parses a Gremlin traversal string into a `RuleGroupType` with graph `meta` on rules.
 *
 * Handles:
 * - `.V()` — vertex traversal source
 * - `.hasLabel('Label')` — label predicates
 * - `.has('prop', value)` — property predicates
 * - `.has('prop', predicate(value))` — predicate-based comparisons
 * - `.out('edge')`, `.in('edge')`, `.both('edge')` — edge traversals
 * - `.as('alias')` — step labels
 * - `.hasNot('prop')` — null checks
 *
 * This is a basic parser. It does not handle the full Gremlin grammar
 * (e.g., anonymous traversals, lambda steps, repeat/until).
 */
export const parseGremlin = (gremlin: string): RuleGroupType => {
  const rules: RuleGroupType['rules'] = [];
  const steps = tokenizeGremlinSteps(gremlin);

  let currentStepLabel: string | undefined;

  for (const step of steps) {
    // .hasLabel('Label')
    const hasLabelMatch = step.match(/^hasLabel\('([^']+)'\)$/);
    if (hasLabelMatch) {
      const meta: GremlinPatternMeta = {
        graphRole: 'pattern',
        graphLang: 'gremlin',
        ...(currentStepLabel && { stepLabel: currentStepLabel }),
      };
      rules.push({
        field: '_label',
        operator: 'hasLabel',
        value: hasLabelMatch[1],
        meta,
      });
      continue;
    }

    // .as('alias')
    const asMatch = step.match(/^as\('([^']+)'\)$/);
    if (asMatch) {
      currentStepLabel = asMatch[1];
      continue;
    }

    // .out('edge'), .in('edge'), .both('edge')
    const traversalMatch = step.match(/^(out|in|both)\('([^']+)'\)$/);
    if (traversalMatch) {
      const [, direction, edgeLabel] = traversalMatch;
      const meta: GremlinPatternMeta = {
        graphRole: 'pattern',
        graphLang: 'gremlin',
        edgeLabel,
        direction: direction as 'out' | 'in' | 'both',
        ...(currentStepLabel && { stepLabel: currentStepLabel }),
      };
      rules.push({
        field: edgeLabel,
        operator: 'traverses',
        value: direction,
        meta,
      });
      currentStepLabel = undefined;
      continue;
    }

    // .hasNot('prop')
    const hasNotMatch = step.match(/^hasNot\('([^']+)'\)$/);
    if (hasNotMatch) {
      const meta: GremlinFilterMeta = { graphRole: 'filter', graphLang: 'gremlin' };
      rules.push({
        field: hasNotMatch[1],
        operator: 'null',
        value: null,
        meta,
      });
      continue;
    }

    // .has('prop') — property exists
    const hasExistsMatch = step.match(/^has\('([^']+)'\)$/);
    if (hasExistsMatch) {
      const meta: GremlinFilterMeta = { graphRole: 'filter', graphLang: 'gremlin' };
      rules.push({
        field: hasExistsMatch[1],
        operator: 'notNull',
        value: null,
        meta,
      });
      continue;
    }

    // .has('prop', value) — equality
    const hasEqMatch = step.match(/^has\('([^']+)',\s*(.+)\)$/);
    if (hasEqMatch) {
      const [, prop, rawValue] = hasEqMatch;
      const parsed = parseGremlinPredicate(prop, rawValue.trim());
      if (parsed) {
        rules.push(parsed);
      }
      continue;
    }
  }

  return { combinator: 'and', rules };
};

/** Tokenizes a Gremlin traversal string into individual step strings. */
const tokenizeGremlinSteps = (gremlin: string): string[] => {
  const steps: string[] = [];

  // Remove leading source (e.g., "g.V().")
  let str = gremlin.trim();
  const sourceMatch = str.match(/^\w+\.V\(\)\./);
  if (sourceMatch) {
    str = str.slice(sourceMatch[0].length);
  }

  // Split on top-level dots
  let depth = 0;
  let current = '';

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;

    if (ch === '.' && depth === 0) {
      if (current.trim()) steps.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) steps.push(current.trim());

  return steps;
};

/** Parses a Gremlin predicate (the second argument of `.has()`). */
const parseGremlinPredicate = (prop: string, rawValue: string): RuleType | null => {
  const meta: GremlinFilterMeta = { graphRole: 'filter', graphLang: 'gremlin' };

  // Predicate functions: gt(), lt(), gte(), lte(), neq(), within(), without(), between(), outside()
  const predicateMatch = rawValue.match(/^(\w+)\((.+)\)$/);
  if (predicateMatch) {
    const [, predName, args] = predicateMatch;
    const parsedArgs = parseGremlinArgs(args);

    switch (predName) {
      case 'gt':
        return { field: prop, operator: '>', value: parsedArgs[0], meta };
      case 'lt':
        return { field: prop, operator: '<', value: parsedArgs[0], meta };
      case 'gte':
        return { field: prop, operator: '>=', value: parsedArgs[0], meta };
      case 'lte':
        return { field: prop, operator: '<=', value: parsedArgs[0], meta };
      case 'neq':
        return { field: prop, operator: '!=', value: parsedArgs[0], meta };
      case 'within':
        return { field: prop, operator: 'in', value: parsedArgs, meta };
      case 'without':
        return { field: prop, operator: 'notIn', value: parsedArgs, meta };
      case 'between':
        return { field: prop, operator: 'between', value: parsedArgs.slice(0, 2), meta };
      case 'outside':
        return { field: prop, operator: 'notBetween', value: parsedArgs.slice(0, 2), meta };
      case 'containing':
        return { field: prop, operator: 'contains', value: parsedArgs[0], meta };
      case 'notContaining':
        return { field: prop, operator: 'doesNotContain', value: parsedArgs[0], meta };
      case 'startingWith':
        return { field: prop, operator: 'beginsWith', value: parsedArgs[0], meta };
      case 'notStartingWith':
        return { field: prop, operator: 'doesNotBeginWith', value: parsedArgs[0], meta };
      case 'endingWith':
        return { field: prop, operator: 'endsWith', value: parsedArgs[0], meta };
      case 'notEndingWith':
        return { field: prop, operator: 'doesNotEndWith', value: parsedArgs[0], meta };
      default:
        return null;
    }
  }

  // Plain value — equality
  return { field: prop, operator: '=', value: parseGremlinLiteral(rawValue), meta };
};

/** Parses a comma-separated argument list. */
const parseGremlinArgs = (args: string): unknown[] => {
  const result: unknown[] = [];
  let depth = 0;
  let current = '';

  for (const ch of args) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      result.push(parseGremlinLiteral(current.trim()));
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) result.push(parseGremlinLiteral(current.trim()));
  return result;
};

/** Parses a Gremlin literal value. */
const parseGremlinLiteral = (raw: string): unknown => {
  if (raw.startsWith("'") && raw.endsWith("'")) {
    return raw.slice(1, -1).replace(/\\'/g, "'");
  }
  if (raw === 'null') return null;
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  const num = Number(raw);
  if (!Number.isNaN(num)) return num;
  return raw;
};
