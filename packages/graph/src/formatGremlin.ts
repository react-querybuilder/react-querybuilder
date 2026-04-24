import type { RuleGroupType, RuleGroupTypeAny, RuleType } from '@react-querybuilder/core';
import { isRuleGroup } from '@react-querybuilder/core';
import type { GremlinFormatOptions, GraphRuleGroupProcessorOptions } from './types';
import { isGremlinPatternMeta, isPatternMeta } from './types';

/**
 * Default rule processor for Gremlin. Formats a single filter rule
 * as a Gremlin `.has()` step.
 *
 * @group Export
 */
export const defaultRuleProcessorGremlin = (rule: RuleType): string => {
  const { field, operator, value } = rule;
  const prop = field.includes('.') ? field.split('.').pop()! : field;

  switch (operator) {
    case '=':
      return `.has('${prop}', ${gremlinValue(value)})`;
    case '!=':
    case '<>':
      return `.has('${prop}', neq(${gremlinValue(value)}))`;
    case '<':
      return `.has('${prop}', lt(${gremlinValue(value)}))`;
    case '>':
      return `.has('${prop}', gt(${gremlinValue(value)}))`;
    case '<=':
      return `.has('${prop}', lte(${gremlinValue(value)}))`;
    case '>=':
      return `.has('${prop}', gte(${gremlinValue(value)}))`;
    case 'contains':
      return `.has('${prop}', containing(${gremlinValue(value)}))`;
    case 'doesNotContain':
      return `.has('${prop}', notContaining(${gremlinValue(value)}))`;
    case 'beginsWith':
      return `.has('${prop}', startingWith(${gremlinValue(value)}))`;
    case 'doesNotBeginWith':
      return `.has('${prop}', notStartingWith(${gremlinValue(value)}))`;
    case 'endsWith':
      return `.has('${prop}', endingWith(${gremlinValue(value)}))`;
    case 'doesNotEndWith':
      return `.has('${prop}', notEndingWith(${gremlinValue(value)}))`;
    case 'null':
      return `.hasNot('${prop}')`;
    case 'notNull':
      return `.has('${prop}')`;
    case 'in': {
      const items = Array.isArray(value)
        ? value
        : String(value)
            .split(',')
            .map(s => s.trim());
      return `.has('${prop}', within(${items.map(gremlinValue).join(', ')}))`;
    }
    case 'notIn': {
      const items = Array.isArray(value)
        ? value
        : String(value)
            .split(',')
            .map(s => s.trim());
      return `.has('${prop}', without(${items.map(gremlinValue).join(', ')}))`;
    }
    case 'between': {
      const vals = Array.isArray(value)
        ? value
        : String(value)
            .split(',')
            .map(s => s.trim());
      return `.has('${prop}', between(${gremlinValue(vals[0])}, ${gremlinValue(vals[1])}))`;
    }
    case 'notBetween': {
      const vals = Array.isArray(value)
        ? value
        : String(value)
            .split(',')
            .map(s => s.trim());
      return `.has('${prop}', outside(${gremlinValue(vals[0])}, ${gremlinValue(vals[1])}))`;
    }
    default:
      return `.has('${prop}', ${gremlinValue(value)})`;
  }
};

/**
 * Default rule group processor for Gremlin. At the top level, filter rules
 * produce chained `.has()` steps (implicit AND). Nested groups use
 * `.and()` / `.or()` / `.not()` compound predicates.
 *
 * @group Export
 */
export const defaultRuleGroupProcessorGremlin = (
  rg: RuleGroupTypeAny,
  { ruleProcessor, ruleGroupProcessor: _ruleGroupProcessor }: GraphRuleGroupProcessorOptions
): string => {
  const processNested = (nestedRg: RuleGroupTypeAny): string => {
    const predicates: string[] = [];

    for (const r of nestedRg.rules) {
      if (typeof r === 'string') continue;
      if (isRuleGroup(r)) {
        const nested = processNested(r);
        if (nested) predicates.push(nested);
      } else {
        const meta = r.meta as Record<string, unknown> | undefined;
        if (meta && isPatternMeta(meta)) continue;
        const formatted = ruleProcessor(r);
        if (formatted) predicates.push(formatted);
      }
    }

    if (predicates.length === 0) return '';

    const combinator = (nestedRg as RuleGroupType).combinator ?? 'and';
    const prefix = nestedRg.not ? 'not' : combinator;
    if (predicates.length === 1 && !nestedRg.not) return predicates[0];

    return `.${prefix}(${predicates.map(p => (p.startsWith('.') ? `__${p}` : p)).join(', ')})`;
  };

  // Top level: chain steps directly (implicit AND for the outermost group)
  const steps: string[] = [];

  for (const r of rg.rules) {
    if (typeof r === 'string') continue;
    if (isRuleGroup(r)) {
      const compound = processNested(r);
      if (compound) steps.push(compound);
    } else {
      const meta = r.meta as Record<string, unknown> | undefined;
      if (meta && isPatternMeta(meta)) continue;
      const formatted = ruleProcessor(r);
      if (formatted) steps.push(formatted);
    }
  }

  return steps.join('');
};

/** Builds traversal steps from pattern rules. */
export const buildGremlinPatternSteps = (rg: RuleGroupTypeAny): string[] => {
  const steps: string[] = [];

  for (const r of rg.rules) {
    if (typeof r === 'string') continue;
    if (isRuleGroup(r)) continue;
    const meta = r.meta as Record<string, unknown> | undefined;
    if (!meta || !isPatternMeta(meta)) continue;

    if (isGremlinPatternMeta(meta)) {
      const gMeta = meta;

      // Node label
      if (r.operator === 'hasLabel' || r.operator === 'is') {
        steps.push(`.hasLabel('${String(r.value)}')`);
      }

      // Step label (.as())
      if (gMeta.stepLabel) {
        steps.push(`.as('${gMeta.stepLabel}')`);
      }

      // Edge traversal
      if (gMeta.edgeLabel) {
        const dir = gMeta.direction ?? 'out';
        steps.push(`.${dir}('${gMeta.edgeLabel}')`);
      }
    } else {
      // Generic pattern rule — treat as hasLabel if operator is 'is'
      if (r.operator === 'is' || r.operator === 'hasLabel') {
        steps.push(`.hasLabel('${String(r.value)}')`);
      }
    }
  }

  return steps;
};

/**
 * Formats a `RuleGroupType` (with graph `meta` on rules) as a Gremlin traversal string.
 *
 * Pattern rules produce traversal steps (`.V()`, `.hasLabel()`, `.out()`, `.in()`, `.as()`).
 * Filter rules produce `.has()` predicates.
 * Nested sub-groups produce `.and()` / `.or()` compound predicates.
 */
export const formatGremlin = (
  query: RuleGroupTypeAny,
  options: GremlinFormatOptions = {}
): string => {
  const { traversalSource = 'g' } = options;

  const steps: string[] = [`${traversalSource}.V()`];
  const patternSteps = buildGremlinPatternSteps(query);
  const filterSteps = defaultRuleGroupProcessorGremlin(query, {
    ruleProcessor: defaultRuleProcessorGremlin,
    ruleGroupProcessor: defaultRuleGroupProcessorGremlin,
  });

  steps.push(...patternSteps);
  if (filterSteps) steps.push(filterSteps);

  return steps.join('');
};

const gremlinValue = (value: unknown): string => {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return String(value);
  const s = typeof value === 'string' ? value : (JSON.stringify(value) ?? '');
  return `'${s.replace(/'/g, "\\'")}'`;
};
