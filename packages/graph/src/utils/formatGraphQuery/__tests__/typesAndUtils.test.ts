import type { RuleGroupType, RuleType } from '@react-querybuilder/core';
import { describe, expect, it } from 'vitest';
import {
  isPatternMeta,
  isFilterMeta,
  isCypherPatternMeta,
  isSparqlPatternMeta,
  isGremlinPatternMeta,
  hasGraphMeta,
} from '../../../types';
import {
  extractPatternRules,
  extractFilterElements,
  groupByNodeAlias,
  groupBySubject,
  flattenRules,
  buildCypherMatchPatterns,
} from '../utils';

describe('type guards', () => {
  it('isPatternMeta', () => {
    expect(isPatternMeta({ graphRole: 'pattern' })).toBe(true);
    expect(isPatternMeta({ graphRole: 'filter' })).toBe(false);
    expect(isPatternMeta(undefined)).toBe(false);
    expect(isPatternMeta({})).toBe(false);
  });

  it('isFilterMeta', () => {
    expect(isFilterMeta({ graphRole: 'filter' })).toBe(true);
    expect(isFilterMeta({ graphRole: 'pattern' })).toBe(false);
  });

  it('isCypherPatternMeta', () => {
    expect(isCypherPatternMeta({ graphRole: 'pattern', nodeAlias: 'a' })).toBe(true);
    expect(isCypherPatternMeta({ graphRole: 'pattern', subject: '?x' })).toBe(false);
    expect(isCypherPatternMeta({ graphRole: 'filter' })).toBe(false);
  });

  it('isSparqlPatternMeta', () => {
    expect(isSparqlPatternMeta({ graphRole: 'pattern', subject: '?person' })).toBe(true);
    expect(isSparqlPatternMeta({ graphRole: 'pattern', nodeAlias: 'a' })).toBe(false);
  });

  it('isGremlinPatternMeta', () => {
    expect(isGremlinPatternMeta({ graphRole: 'pattern', stepLabel: 'a' })).toBe(true);
    expect(isGremlinPatternMeta({ graphRole: 'pattern', edgeLabel: 'knows' })).toBe(true);
    expect(isGremlinPatternMeta({ graphRole: 'pattern', nodeAlias: 'a' })).toBe(false);
  });

  it('hasGraphMeta', () => {
    expect(
      hasGraphMeta({ field: 'f', operator: '=', value: 'v', meta: { graphRole: 'pattern' } })
    ).toBe(true);
    expect(hasGraphMeta({ field: 'f', operator: '=', value: 'v' })).toBe(false);
    expect(hasGraphMeta({ field: 'f', operator: '=', value: 'v', meta: {} })).toBe(false);
  });
});

describe('utils', () => {
  const patternRule: RuleType = {
    field: 'rdf:type',
    operator: 'is',
    value: 'Person',
    meta: { graphRole: 'pattern', nodeAlias: 'a', nodeLabel: 'Person' },
  };
  const filterRule: RuleType = {
    field: 'a.age',
    operator: '>',
    value: 30,
    meta: { graphRole: 'filter' },
  };
  const plainRule: RuleType = { field: 'name', operator: '=', value: 'Alice' };

  describe('flattenRules', () => {
    it('should flatten nested groups', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [patternRule, { combinator: 'or', rules: [filterRule, plainRule] }],
      };
      const flat = flattenRules(query);
      expect(flat).toHaveLength(3);
    });
  });

  describe('extractPatternRules', () => {
    it('should only extract pattern rules from top level', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [patternRule, filterRule, plainRule],
      };
      const result = extractPatternRules(query);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(patternRule);
    });
  });

  describe('extractFilterElements', () => {
    it('should extract filter rules and sub-groups', () => {
      const subGroup: RuleGroupType = { combinator: 'or', rules: [filterRule] };
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [patternRule, filterRule, plainRule, subGroup],
      };
      const result = extractFilterElements(query);
      expect(result).toHaveLength(3); // filterRule + plainRule + subGroup
    });
  });

  describe('groupByNodeAlias', () => {
    it('should group by nodeAlias', () => {
      const rules: RuleType[] = [
        {
          field: '_type',
          operator: 'is',
          value: 'Person',
          meta: { graphRole: 'pattern', nodeAlias: 'a', nodeLabel: 'Person' },
        },
        {
          field: 'name',
          operator: 'binds',
          value: '?name',
          meta: { graphRole: 'pattern', nodeAlias: 'a' },
        },
        {
          field: '_type',
          operator: 'is',
          value: 'Company',
          meta: { graphRole: 'pattern', nodeAlias: 'b', nodeLabel: 'Company' },
        },
      ];
      const groups = groupByNodeAlias(rules);
      expect(groups.size).toBe(2);
      expect(groups.get('a')).toHaveLength(2);
      expect(groups.get('b')).toHaveLength(1);
    });
  });

  describe('groupBySubject', () => {
    it('should group by subject', () => {
      const rules: RuleType[] = [
        {
          field: 'rdf:type',
          operator: 'binds',
          value: 'foaf:Person',
          meta: { graphRole: 'pattern', subject: '?person' },
        },
        {
          field: 'foaf:name',
          operator: 'binds',
          value: '?name',
          meta: { graphRole: 'pattern', subject: '?person' },
        },
        {
          field: 'foaf:name',
          operator: 'binds',
          value: '?friendName',
          meta: { graphRole: 'pattern', subject: '?friend' },
        },
      ];
      const groups = groupBySubject(rules);
      expect(groups.size).toBe(2);
      expect(groups.get('?person')).toHaveLength(2);
      expect(groups.get('?friend')).toHaveLength(1);
    });
  });

  describe('buildCypherMatchPatterns', () => {
    it('should build node patterns', () => {
      const rules: RuleType[] = [
        {
          field: '_type',
          operator: 'is',
          value: 'Person',
          meta: { graphRole: 'pattern', nodeAlias: 'a', nodeLabel: 'Person' },
        },
      ];
      const { required, optional } = buildCypherMatchPatterns(rules);
      expect(required).toEqual(['(a:Person)']);
      expect(optional).toEqual([]);
    });

    it('should build relationship patterns', () => {
      const rules: RuleType[] = [
        {
          field: 'KNOWS',
          operator: 'binds',
          value: 'b',
          meta: {
            graphRole: 'pattern',
            nodeAlias: 'a',
            nodeLabel: 'Person',
            relType: 'KNOWS',
            targetAlias: 'b',
            targetLabel: 'Person',
            direction: 'outgoing',
          },
        },
      ];
      const { required } = buildCypherMatchPatterns(rules);
      expect(required[0]).toBe('(a:Person)-[:KNOWS]->(b:Person)');
    });

    it('should separate optional patterns', () => {
      const rules: RuleType[] = [
        {
          field: '_type',
          operator: 'is',
          value: 'Person',
          meta: { graphRole: 'pattern', nodeAlias: 'a', nodeLabel: 'Person' },
        },
        {
          field: 'HAS_EMAIL',
          operator: 'binds',
          value: 'e',
          meta: {
            graphRole: 'pattern',
            nodeAlias: 'a',
            relType: 'HAS_EMAIL',
            targetAlias: 'e',
            targetLabel: 'Email',
            direction: 'outgoing',
            optional: true,
          },
        },
      ];
      const { required, optional } = buildCypherMatchPatterns(rules);
      expect(required).toHaveLength(1);
      expect(optional).toHaveLength(1);
      expect(optional[0]).toContain('HAS_EMAIL');
    });
  });
});
