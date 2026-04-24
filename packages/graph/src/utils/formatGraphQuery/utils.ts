import type { RuleGroupType, RuleGroupTypeAny, RuleType } from '@react-querybuilder/core';
import { isRuleGroup } from '@react-querybuilder/core';
import type { CypherPatternMeta } from '../../types';
import { isCypherPatternMeta, isFilterMeta, isPatternMeta, isSparqlPatternMeta } from '../../types';

/**
 * Recursively collects all rules from a rule group (flattening nested groups).
 */
export const flattenRules = (rg: RuleGroupTypeAny): RuleType[] => {
  const rules: RuleType[] = [];
  for (const r of rg.rules) {
    if (typeof r === 'string') continue;
    if (isRuleGroup(r)) {
      rules.push(...flattenRules(r));
    } else {
      rules.push(r);
    }
  }
  return rules;
};

/**
 * Extracts rules whose `meta.graphRole` is `'pattern'` from the top level of a query.
 * Does not recurse into nested groups (pattern rules are typically top-level).
 */
export const extractPatternRules = (rg: RuleGroupTypeAny): RuleType[] =>
  rg.rules.filter(
    (r): r is RuleType =>
      typeof r !== 'string' && !isRuleGroup(r) && isPatternMeta(r.meta as Record<string, unknown>)
  );

/**
 * Extracts all filter elements (rules and sub-groups) from the top level of a query.
 * Rules without `meta` are treated as filter rules (backward compatibility).
 */
export const extractFilterElements = (rg: RuleGroupTypeAny): (RuleType | RuleGroupType)[] =>
  rg.rules.filter((r): r is RuleType | RuleGroupType => {
    if (typeof r === 'string') return false;
    if (isRuleGroup(r)) return true;
    const meta = r.meta as Record<string, unknown> | undefined;
    return !meta || isFilterMeta(meta) || !('graphRole' in meta);
  });

/**
 * Groups Cypher/GQL pattern rules by their `nodeAlias`.
 * Returns a Map from alias → array of pattern rules for that node.
 */
export const groupByNodeAlias = (rules: RuleType[]): Map<string, RuleType[]> => {
  const groups = new Map<string, RuleType[]>();
  for (const rule of rules) {
    const meta = rule.meta as Record<string, unknown> | undefined;
    if (!isCypherPatternMeta(meta)) continue;
    const alias = meta.nodeAlias;
    const existing = groups.get(alias);
    if (existing) {
      existing.push(rule);
    } else {
      groups.set(alias, [rule]);
    }
  }
  return groups;
};

/**
 * Groups SPARQL pattern rules by their `subject`.
 * Returns a Map from subject → array of pattern rules for that subject.
 */
export const groupBySubject = (rules: RuleType[]): Map<string, RuleType[]> => {
  const groups = new Map<string, RuleType[]>();
  for (const rule of rules) {
    const meta = rule.meta as Record<string, unknown> | undefined;
    if (!isSparqlPatternMeta(meta)) continue;
    const subject = meta.subject;
    const existing = groups.get(subject);
    if (existing) {
      existing.push(rule);
    } else {
      groups.set(subject, [rule]);
    }
  }
  return groups;
};

/**
 * Builds a set of MATCH clause fragments from Cypher pattern rules.
 * Groups by nodeAlias and creates `(alias:Label)` node patterns and
 * `(alias)-[:REL]->(target)` relationship patterns.
 */
export const buildCypherMatchPatterns = (
  patternRules: RuleType[]
): { required: string[]; optional: string[] } => {
  const required: string[] = [];
  const optional: string[] = [];
  const nodesDeclared = new Set<string>();
  const grouped = groupByNodeAlias(patternRules);

  for (const [alias, rules] of grouped) {
    for (const rule of rules) {
      const meta = rule.meta as CypherPatternMeta;

      if (meta.relType && meta.targetAlias) {
        const sourceNode = nodesDeclared.has(alias)
          ? `(${alias})`
          : formatCypherNode(alias, meta.nodeLabel);
        const targetNode = formatCypherNode(meta.targetAlias, meta.targetLabel);
        const rel = formatCypherRelationship(meta.relType, meta.direction);
        const pattern = `${sourceNode}${rel}${targetNode}`;

        if (meta.optional) {
          optional.push(pattern);
        } else {
          required.push(pattern);
        }

        nodesDeclared.add(alias);
        nodesDeclared.add(meta.targetAlias);
      } else if (!nodesDeclared.has(alias)) {
        const pattern = formatCypherNode(alias, meta.nodeLabel);
        if (meta.optional) {
          optional.push(pattern);
        } else {
          required.push(pattern);
        }
        nodesDeclared.add(alias);
      }
    }
  }

  return { required, optional };
};

const formatCypherNode = (alias: string, label?: string): string =>
  label ? `(${alias}:${label})` : `(${alias})`;

const formatCypherRelationship = (
  relType: string,
  direction?: 'incoming' | 'outgoing' | 'undirected'
): string => {
  const rel = `[:${relType}]`;
  switch (direction) {
    case 'incoming':
      return `<-${rel}-`;
    case 'undirected':
      return `-${rel}-`;
    default:
      return `-${rel}->`;
  }
};
