import { defaultPlaceholderFieldName, defaultPlaceholderOperatorName } from '../../../defaults';
import type {
  DefaultOperatorName,
  DefaultRuleGroupType,
  DefaultRuleGroupTypeIC,
  RuleGroupDiagnosticsResult,
  RuleGroupICDiagnosticsResult,
  RuleDiagnosticsResult,
  ValidationMap,
} from '../../../types';
import { convertToIC } from '../../convertQuery';
import { formatQuery } from '../formatQuery';

const validQuery: DefaultRuleGroupType = {
  id: 'g-root',
  combinator: 'and',
  rules: [
    { id: 'r-1', field: 'firstName', operator: '=', value: 'Steve' },
    { id: 'r-2', field: 'age', operator: '>', value: 26 },
  ],
};

const nestedQuery: DefaultRuleGroupType = {
  id: 'g-root',
  combinator: 'and',
  rules: [
    { id: 'r-1', field: 'firstName', operator: '=', value: 'Steve' },
    {
      id: 'g-sub',
      combinator: 'or',
      rules: [
        { id: 'r-2', field: 'age', operator: '>', value: 26 },
        { id: 'r-3', field: 'job', operator: '=', value: 'Programmer' },
      ],
    },
  ],
};

describe('formatQuery("diagnostics")', () => {
  describe('top-level shape', () => {
    it('returns query, diagnostics, stats, and fieldSummary', () => {
      const result = formatQuery(validQuery, 'diagnostics');
      expect(result).toHaveProperty('query');
      expect(result).toHaveProperty('diagnostics');
      expect(result).toHaveProperty('stats');
      expect(result).toHaveProperty('fieldSummary');
    });

    it('accepts format as an option object', () => {
      const result = formatQuery(validQuery, { format: 'diagnostics' });
      expect(result.query.valid).toBe(true);
    });
  });

  describe('query annotation', () => {
    it('marks a valid query as valid', () => {
      const result = formatQuery(validQuery, 'diagnostics');
      expect(result.query.valid).toBe(true);
      expect(result.query.rules).toHaveLength(2);
      expect(result.query.rules[0]).toMatchObject({ valid: true, field: 'firstName' });
      expect(result.query.rules[1]).toMatchObject({ valid: true, field: 'age' });
      expect(result.query).not.toHaveProperty('reasons');
      expect(result.query.rules[0]).not.toHaveProperty('reasons');
    });

    it('marks placeholder fields as invalid', () => {
      const query: DefaultRuleGroupType = {
        id: 'g-root',
        combinator: 'and',
        rules: [
          { id: 'r-1', field: defaultPlaceholderFieldName, operator: '=', value: 'test' },
          { id: 'r-2', field: 'firstName', operator: '=', value: 'Steve' },
        ],
      };
      const result = formatQuery(query, 'diagnostics');
      expect(result.query.valid).toBe(false);
      expect(result.query.rules[0]).toMatchObject({ valid: false });
      expect(result.query.rules[1]).toMatchObject({ valid: true });
    });

    it('marks placeholder operators as invalid', () => {
      const query: DefaultRuleGroupType = {
        id: 'g-root',
        combinator: 'and',
        rules: [
          {
            id: 'r-1',
            field: 'firstName',
            operator: defaultPlaceholderOperatorName as unknown as DefaultOperatorName,
            value: 'test',
          },
        ],
      };
      const result = formatQuery(query, 'diagnostics');
      expect(result.query.valid).toBe(false);
      expect(result.query.rules[0]).toMatchObject({ valid: false });
    });

    it('marks placeholder values as invalid when placeholderValueName is set', () => {
      const query: DefaultRuleGroupType = {
        id: 'g-root',
        combinator: 'and',
        rules: [{ id: 'r-1', field: 'firstName', operator: '=', value: '~' }],
      };
      const result = formatQuery(query, { format: 'diagnostics', placeholderValueName: '~' });
      expect(result.query.valid).toBe(false);
      expect(result.query.rules[0]).toMatchObject({ valid: false });
    });

    it('marks muted rules as invalid', () => {
      const query: DefaultRuleGroupType = {
        id: 'g-root',
        combinator: 'and',
        rules: [
          { id: 'r-1', field: 'firstName', operator: '=', value: 'Steve', muted: true },
          { id: 'r-2', field: 'age', operator: '>', value: 26 },
        ],
      };
      const result = formatQuery(query, 'diagnostics');
      expect(result.query.valid).toBe(false);
      expect(result.query.rules[0]).toMatchObject({ valid: false, muted: true });
      expect(result.query.rules[1]).toMatchObject({ valid: true });
    });

    it('marks muted groups as invalid', () => {
      const query: DefaultRuleGroupType = {
        id: 'g-root',
        combinator: 'and',
        rules: [
          {
            id: 'g-sub',
            combinator: 'or',
            rules: [{ id: 'r-1', field: 'age', operator: '>', value: 26 }],
            muted: true,
          },
        ],
      };
      const result = formatQuery(query, 'diagnostics');
      expect(result.query.valid).toBe(false);
      const subGroup = result.query.rules[0] as RuleGroupDiagnosticsResult;
      expect(subGroup.valid).toBe(false);
    });

    it('handles empty groups', () => {
      const query: DefaultRuleGroupType = { id: 'g-root', combinator: 'and', rules: [] };
      const result = formatQuery(query, 'diagnostics');
      expect(result.query.valid).toBe(true);
      expect(result.query.rules).toHaveLength(0);
    });

    it('bubbles validity up through nested groups', () => {
      const query: DefaultRuleGroupType = {
        id: 'g-root',
        combinator: 'and',
        rules: [
          { id: 'r-1', field: 'firstName', operator: '=', value: 'Steve' },
          {
            id: 'g-sub',
            combinator: 'or',
            rules: [
              { id: 'r-2', field: defaultPlaceholderFieldName, operator: '=', value: 'test' },
            ],
          },
        ],
      };
      const result = formatQuery(query, 'diagnostics');
      expect(result.query.valid).toBe(false);
      expect(result.query.rules[0]).toMatchObject({ valid: true });
      const subGroup = result.query.rules[1] as RuleGroupDiagnosticsResult;
      expect(subGroup.valid).toBe(false);
      expect(subGroup.rules[0]).toMatchObject({ valid: false });
    });

    it('preserves original rule properties', () => {
      const result = formatQuery(nestedQuery, 'diagnostics');
      expect(result.query.id).toBe('g-root');
      expect(result.query.combinator).toBe('and');
      expect(result.query.rules[0]).toMatchObject({
        id: 'r-1',
        field: 'firstName',
        operator: '=',
        value: 'Steve',
      });
      const subGroup = result.query.rules[1] as RuleGroupDiagnosticsResult;
      expect(subGroup.id).toBe('g-sub');
      expect(subGroup.combinator).toBe('or');
    });

    it('handles the not property on groups', () => {
      const query: DefaultRuleGroupType = {
        id: 'g-root',
        combinator: 'and',
        not: true,
        rules: [{ id: 'r-1', field: 'firstName', operator: '=', value: 'Steve' }],
      };
      const result = formatQuery(query, 'diagnostics');
      expect(result.query.valid).toBe(true);
      expect(result.query.not).toBe(true);
    });

    it('handles mixed valid and invalid rules', () => {
      const query: DefaultRuleGroupType = {
        id: 'g-root',
        combinator: 'and',
        rules: [
          { id: 'r-1', field: 'firstName', operator: '=', value: 'Steve' },
          { id: 'r-2', field: defaultPlaceholderFieldName, operator: '=', value: '' },
          { id: 'r-3', field: 'age', operator: '>', value: 26 },
          { id: 'r-4', field: 'job', operator: '=', value: 'Dev', muted: true },
        ],
      };
      const result = formatQuery(query, 'diagnostics');
      expect(result.query.valid).toBe(false);
      expect(result.query.rules[0]).toMatchObject({ valid: true });
      expect(result.query.rules[1]).toMatchObject({ valid: false });
      expect(result.query.rules[2]).toMatchObject({ valid: true });
      expect(result.query.rules[3]).toMatchObject({ valid: false });
    });

    it('handles deeply nested groups', () => {
      const query: DefaultRuleGroupType = {
        id: 'g-root',
        combinator: 'and',
        rules: [
          {
            id: 'g-1',
            combinator: 'or',
            rules: [
              {
                id: 'g-2',
                combinator: 'and',
                rules: [
                  { id: 'r-1', field: 'firstName', operator: '=', value: 'Steve' },
                  { id: 'r-2', field: defaultPlaceholderFieldName, operator: '=', value: '' },
                ],
              },
            ],
          },
        ],
      };
      const result = formatQuery(query, 'diagnostics');
      expect(result.query.valid).toBe(false);
      const g1 = result.query.rules[0] as RuleGroupDiagnosticsResult;
      expect(g1.valid).toBe(false);
      const g2 = g1.rules[0] as RuleGroupDiagnosticsResult;
      expect(g2.valid).toBe(false);
      expect(g2.rules[0]).toMatchObject({ valid: true });
      expect(g2.rules[1]).toMatchObject({ valid: false });
    });

    it('handles groups without id', () => {
      const query: DefaultRuleGroupType = {
        combinator: 'and',
        rules: [{ field: 'firstName', operator: '=', value: 'Steve', muted: true }],
      } as DefaultRuleGroupType;
      const result = formatQuery(query, 'diagnostics');
      expect(result.query.valid).toBe(false);
      const mutedDiag = result.diagnostics.find(d => d.code === 'MUTED');
      expect(mutedDiag).toBeDefined();
      expect(mutedDiag!.id).toBe('');
    });

    it('handles muted groups without id', () => {
      const query = {
        combinator: 'and',
        rules: [
          { combinator: 'or', muted: true, rules: [{ field: 'age', operator: '>', value: 26 }] },
        ],
      } as DefaultRuleGroupType;
      const result = formatQuery(query, 'diagnostics');
      expect(result.query.valid).toBe(false);
      const mutedGroupDiag = result.diagnostics.find(
        d => d.code === 'MUTED' && d.message === 'Group is muted'
      );
      expect(mutedGroupDiag).toBeDefined();
      expect(mutedGroupDiag!.id).toBe('');
    });

    it('handles group-level validator returning bare false (no reasons)', () => {
      const validator = (): ValidationMap => ({ 'g-sub': false });
      const result = formatQuery(nestedQuery, { format: 'diagnostics', validator });
      expect(result.query.valid).toBe(false);
      const groupDiag = result.diagnostics.find(
        d => d.id === 'g-sub' && d.code === 'CUSTOM_VALIDATOR'
      );
      expect(groupDiag).toBeDefined();
      expect(groupDiag!.message).toBe('Group failed validation');
    });

    it('handles group-level validator returning { valid: false } without reasons on an id-less group', () => {
      const query = {
        combinator: 'and',
        rules: [{ field: 'firstName', operator: '=', value: 'Steve' }],
      } as DefaultRuleGroupType;
      const validator = (): ValidationMap => ({ '': { valid: false } });
      const result = formatQuery(query, { format: 'diagnostics', validator });
      const groupDiag = result.diagnostics.find(
        d => d.code === 'CUSTOM_VALIDATOR' && d.message === 'Group failed validation'
      );
      expect(groupDiag).toBeDefined();
      expect(groupDiag!.id).toBe('');
    });

    it('handles query-level validator returning bare false for a rule (no reasons)', () => {
      const validator = (): ValidationMap => ({ 'r-1': false });
      const result = formatQuery(validQuery, { format: 'diagnostics', validator });
      const ruleDiag = result.diagnostics.find(
        d => d.id === 'r-1' && d.code === 'CUSTOM_VALIDATOR'
      );
      expect(ruleDiag).toBeDefined();
      expect(ruleDiag!.message).toBe('Rule failed validation');
    });

    it('handles query-level validator returning { valid: false } without reasons for a rule', () => {
      const validator = (): ValidationMap => ({ 'r-1': { valid: false } });
      const result = formatQuery(validQuery, { format: 'diagnostics', validator });
      const ruleDiag = result.diagnostics.find(
        d => d.id === 'r-1' && d.code === 'CUSTOM_VALIDATOR'
      );
      expect(ruleDiag).toBeDefined();
      expect(ruleDiag!.message).toBe('Rule failed validation');
    });
  });

  describe('path and level', () => {
    it('assigns path [] and level 0 to the root group', () => {
      const result = formatQuery(validQuery, 'diagnostics');
      expect(result.query.path).toEqual([]);
      expect(result.query.level).toBe(0);
    });

    it('assigns correct path and level to rules', () => {
      const result = formatQuery(validQuery, 'diagnostics');
      const r1 = result.query.rules[0] as RuleDiagnosticsResult;
      const r2 = result.query.rules[1] as RuleDiagnosticsResult;
      expect(r1.path).toEqual([0]);
      expect(r1.level).toBe(1);
      expect(r2.path).toEqual([1]);
      expect(r2.level).toBe(1);
    });

    it('assigns correct path and level in nested groups', () => {
      const result = formatQuery(nestedQuery, 'diagnostics');
      const subGroup = result.query.rules[1] as RuleGroupDiagnosticsResult;
      expect(subGroup.path).toEqual([1]);
      expect(subGroup.level).toBe(1);
      const r2 = subGroup.rules[0] as RuleDiagnosticsResult;
      expect(r2.path).toEqual([1, 0]);
      expect(r2.level).toBe(2);
      const r3 = subGroup.rules[1] as RuleDiagnosticsResult;
      expect(r3.path).toEqual([1, 1]);
      expect(r3.level).toBe(2);
    });

    it('assigns correct path with independent combinators', () => {
      const icQuery: DefaultRuleGroupTypeIC = convertToIC(validQuery);
      const result = formatQuery(icQuery, 'diagnostics');
      const r1 = result.query.rules[0] as RuleDiagnosticsResult;
      expect(r1.path).toEqual([0]);
      expect(result.query.rules[1]).toBe('and');
      const r2 = result.query.rules[2] as RuleDiagnosticsResult;
      expect(r2.path).toEqual([2]);
      expect(r2.level).toBe(1);
    });
  });

  describe('diagnostics array', () => {
    it('returns empty diagnostics for a valid query', () => {
      const result = formatQuery(validQuery, 'diagnostics');
      expect(result.diagnostics).toEqual([]);
    });

    it('includes PLACEHOLDER_FIELD diagnostic', () => {
      const query: DefaultRuleGroupType = {
        id: 'g-root',
        combinator: 'and',
        rules: [{ id: 'r-1', field: defaultPlaceholderFieldName, operator: '=', value: 'test' }],
      };
      const result = formatQuery(query, 'diagnostics');
      expect(result.diagnostics).toContainEqual(
        expect.objectContaining({ id: 'r-1', code: 'PLACEHOLDER_FIELD', source: 'placeholder' })
      );
    });

    it('includes PLACEHOLDER_OPERATOR diagnostic', () => {
      const query: DefaultRuleGroupType = {
        id: 'g-root',
        combinator: 'and',
        rules: [
          {
            id: 'r-1',
            field: 'firstName',
            operator: defaultPlaceholderOperatorName as unknown as DefaultOperatorName,
            value: 'test',
          },
        ],
      };
      const result = formatQuery(query, 'diagnostics');
      expect(result.diagnostics).toContainEqual(
        expect.objectContaining({ id: 'r-1', code: 'PLACEHOLDER_OPERATOR', source: 'placeholder' })
      );
    });

    it('includes PLACEHOLDER_VALUE diagnostic', () => {
      const query: DefaultRuleGroupType = {
        id: 'g-root',
        combinator: 'and',
        rules: [{ id: 'r-1', field: 'firstName', operator: '=', value: '~' }],
      };
      const result = formatQuery(query, { format: 'diagnostics', placeholderValueName: '~' });
      expect(result.diagnostics).toContainEqual(
        expect.objectContaining({ id: 'r-1', code: 'PLACEHOLDER_VALUE', source: 'placeholder' })
      );
    });

    it('includes MUTED diagnostic for rules', () => {
      const query: DefaultRuleGroupType = {
        id: 'g-root',
        combinator: 'and',
        rules: [{ id: 'r-1', field: 'firstName', operator: '=', value: 'Steve', muted: true }],
      };
      const result = formatQuery(query, 'diagnostics');
      expect(result.diagnostics).toContainEqual(
        expect.objectContaining({ id: 'r-1', code: 'MUTED', source: 'muted' })
      );
    });

    it('includes MUTED diagnostic for groups', () => {
      const query: DefaultRuleGroupType = {
        id: 'g-root',
        combinator: 'and',
        rules: [
          {
            id: 'g-sub',
            combinator: 'or',
            rules: [{ id: 'r-1', field: 'age', operator: '>', value: 26 }],
            muted: true,
          },
        ],
      };
      const result = formatQuery(query, 'diagnostics');
      expect(result.diagnostics).toContainEqual(
        expect.objectContaining({ id: 'g-sub', code: 'MUTED', source: 'muted' })
      );
    });

    it('includes CUSTOM_VALIDATOR diagnostics from query-level validator', () => {
      const validator = (): ValidationMap => ({
        'r-1': { valid: false, reasons: ['Name is required'] },
        'r-2': true,
      });
      const result = formatQuery(validQuery, { format: 'diagnostics', validator });
      expect(result.diagnostics).toContainEqual(
        expect.objectContaining({ id: 'r-1', code: 'CUSTOM_VALIDATOR', source: 'query-validator' })
      );
    });

    it('includes CUSTOM_VALIDATOR diagnostics from field-level validator', () => {
      const result = formatQuery(validQuery, {
        format: 'diagnostics',
        fields: [
          { name: 'firstName', label: 'First Name', validator: () => false },
          { name: 'age', label: 'Age' },
        ],
      });
      expect(result.diagnostics).toContainEqual(
        expect.objectContaining({ id: 'r-1', code: 'CUSTOM_VALIDATOR', source: 'field-validator' })
      );
    });

    it('includes path in diagnostic entries', () => {
      const query: DefaultRuleGroupType = {
        id: 'g-root',
        combinator: 'and',
        rules: [
          { id: 'r-1', field: 'firstName', operator: '=', value: 'Steve' },
          {
            id: 'g-sub',
            combinator: 'or',
            rules: [
              { id: 'r-2', field: defaultPlaceholderFieldName, operator: '=', value: 'test' },
            ],
          },
        ],
      };
      const result = formatQuery(query, 'diagnostics');
      const diagnostic = result.diagnostics.find(d => d.id === 'r-2');
      expect(diagnostic).toBeDefined();
      expect(diagnostic!.path).toEqual([1, 0]);
    });
  });

  describe('stats', () => {
    it('counts rules and groups correctly', () => {
      const result = formatQuery(nestedQuery, 'diagnostics');
      expect(result.stats).toEqual({
        totalRules: 3,
        totalGroups: 2,
        validRules: 3,
        invalidRules: 0,
        validGroups: 2,
        invalidGroups: 0,
      });
    });

    it('counts invalid rules and groups', () => {
      const query: DefaultRuleGroupType = {
        id: 'g-root',
        combinator: 'and',
        rules: [
          { id: 'r-1', field: defaultPlaceholderFieldName, operator: '=', value: 'test' },
          { id: 'r-2', field: 'age', operator: '>', value: 26 },
        ],
      };
      const result = formatQuery(query, 'diagnostics');
      expect(result.stats.totalRules).toBe(2);
      expect(result.stats.validRules).toBe(1);
      expect(result.stats.invalidRules).toBe(1);
      expect(result.stats.invalidGroups).toBe(1);
    });

    it('returns zero counts for empty groups', () => {
      const query: DefaultRuleGroupType = { id: 'g-root', combinator: 'and', rules: [] };
      const result = formatQuery(query, 'diagnostics');
      expect(result.stats).toEqual({
        totalRules: 0,
        totalGroups: 1,
        validRules: 0,
        invalidRules: 0,
        validGroups: 1,
        invalidGroups: 0,
      });
    });
  });

  describe('fieldSummary', () => {
    it('counts rules per field', () => {
      const result = formatQuery(nestedQuery, 'diagnostics');
      expect(result.fieldSummary).toEqual({
        firstName: { ruleCount: 1, invalidCount: 0 },
        age: { ruleCount: 1, invalidCount: 0 },
        job: { ruleCount: 1, invalidCount: 0 },
      });
    });

    it('counts invalid rules per field', () => {
      const query: DefaultRuleGroupType = {
        id: 'g-root',
        combinator: 'and',
        rules: [
          { id: 'r-1', field: 'firstName', operator: '=', value: 'Steve' },
          { id: 'r-2', field: 'firstName', operator: '=', value: 'Bob', muted: true },
          { id: 'r-3', field: 'age', operator: '>', value: 26 },
        ],
      };
      const result = formatQuery(query, 'diagnostics');
      expect(result.fieldSummary.firstName).toEqual({ ruleCount: 2, invalidCount: 1 });
      expect(result.fieldSummary.age).toEqual({ ruleCount: 1, invalidCount: 0 });
    });

    it('includes placeholder field names in the summary', () => {
      const query: DefaultRuleGroupType = {
        id: 'g-root',
        combinator: 'and',
        rules: [{ id: 'r-1', field: defaultPlaceholderFieldName, operator: '=', value: 'test' }],
      };
      const result = formatQuery(query, 'diagnostics');
      expect(result.fieldSummary[defaultPlaceholderFieldName]).toEqual({
        ruleCount: 1,
        invalidCount: 1,
      });
    });
  });

  describe('query-level validator', () => {
    it('uses validationMap entries', () => {
      const validator = (): ValidationMap => ({
        'r-1': { valid: false, reasons: ['Name is required'] },
        'r-2': true,
      });
      const result = formatQuery(validQuery, { format: 'diagnostics', validator });
      expect(result.query.valid).toBe(false);
      expect(result.query.rules[0]).toMatchObject({ valid: false, reasons: ['Name is required'] });
      expect(result.query.rules[1]).toMatchObject({ valid: true });
      expect(result.query.rules[1]).not.toHaveProperty('reasons');
    });

    it('handles validator returning false for group IDs', () => {
      const validator = (): ValidationMap => ({ 'g-sub': false });
      const result = formatQuery(nestedQuery, { format: 'diagnostics', validator });
      expect(result.query.valid).toBe(false);
      const subGroup = result.query.rules[1] as RuleGroupDiagnosticsResult;
      expect(subGroup.valid).toBe(false);
    });

    it('still annotates every rule when validator returns boolean false', () => {
      const validator = () => false;
      const result = formatQuery(validQuery, { format: 'diagnostics', validator });
      expect(result.query.valid).toBe(true);
      expect(result.query.rules).toHaveLength(2);
      expect(result.query.rules[0]).toMatchObject({ valid: true, field: 'firstName' });
    });

    it('handles validationMap with reasons on groups', () => {
      const validator = (): ValidationMap => ({
        'g-root': { valid: false, reasons: ['Group needs at least 2 rules'] },
        'r-1': true,
      });
      const result = formatQuery(validQuery, { format: 'diagnostics', validator });
      expect(result.query.valid).toBe(false);
      expect(result.query.reasons).toEqual(['Group needs at least 2 rules']);
    });

    it('does not include reasons when validationMap entry is a bare false', () => {
      const validator = (): ValidationMap => ({ 'r-1': false });
      const result = formatQuery(validQuery, { format: 'diagnostics', validator });
      expect(result.query.rules[0]).toMatchObject({ valid: false });
      expect(result.query.rules[0]).not.toHaveProperty('reasons');
    });
  });

  describe('field-level validator', () => {
    it('marks rules invalid based on field validator', () => {
      const result = formatQuery(validQuery, {
        format: 'diagnostics',
        fields: [
          { name: 'firstName', label: 'First Name', validator: () => false },
          { name: 'age', label: 'Age' },
        ],
      });
      expect(result.query.valid).toBe(false);
      expect(result.query.rules[0]).toMatchObject({ valid: false });
      expect(result.query.rules[1]).toMatchObject({ valid: true });
    });

    it('passes through reasons from field validator', () => {
      const result = formatQuery(validQuery, {
        format: 'diagnostics',
        fields: [
          {
            name: 'firstName',
            label: 'First Name',
            validator: () => ({ valid: false, reasons: ['Must be longer than 5 chars'] }),
          },
          { name: 'age', label: 'Age' },
        ],
      });
      expect(result.query.rules[0]).toMatchObject({
        valid: false,
        reasons: ['Must be longer than 5 chars'],
      });
    });
  });

  describe('independent combinators', () => {
    it('handles IC queries with valid rules', () => {
      const icQuery: DefaultRuleGroupTypeIC = convertToIC(validQuery);
      const result = formatQuery(icQuery, 'diagnostics');
      expect(result.query.valid).toBe(true);
      expect(result.query.rules).toHaveLength(3);
      expect(result.query.rules[0]).toMatchObject({ valid: true, field: 'firstName' });
      expect(result.query.rules[1]).toBe('and');
      expect(result.query.rules[2]).toMatchObject({ valid: true, field: 'age' });
    });

    it('handles IC queries with invalid rules', () => {
      const icQuery: DefaultRuleGroupTypeIC = {
        rules: [
          { id: 'r-1', field: defaultPlaceholderFieldName, operator: '=', value: 'test' },
          'and',
          { id: 'r-2', field: 'age', operator: '>', value: 26 },
        ],
      };
      const result = formatQuery(icQuery, 'diagnostics');
      expect(result.query.valid).toBe(false);
      expect(result.query.rules[0]).toMatchObject({ valid: false });
      expect(result.query.rules[1]).toBe('and');
      expect(result.query.rules[2]).toMatchObject({ valid: true });
    });

    it('handles nested IC groups', () => {
      const icQuery: DefaultRuleGroupTypeIC = convertToIC(nestedQuery);
      const result = formatQuery(icQuery, 'diagnostics');
      expect(result.query.valid).toBe(true);
      const subGroup = result.query.rules.find(
        r => typeof r !== 'string' && 'rules' in r
      ) as RuleGroupICDiagnosticsResult;
      expect(subGroup).toBeDefined();
      expect(subGroup.valid).toBe(true);
    });

    it('passes through reasons on IC groups', () => {
      const icQuery: DefaultRuleGroupTypeIC = {
        id: 'g-ic',
        rules: [{ id: 'r-1', field: 'firstName', operator: '=', value: 'Steve' }],
      };
      const validator = (): ValidationMap => ({
        'g-ic': { valid: false, reasons: ['IC group invalid'] },
      });
      const result = formatQuery(icQuery, { format: 'diagnostics', validator });
      expect(result.query.valid).toBe(false);
      expect(result.query.reasons).toEqual(['IC group invalid']);
    });
  });

  describe('value/type mismatch', () => {
    it('flags non-numeric values for number fields', () => {
      const query: DefaultRuleGroupType = {
        id: 'g-root',
        combinator: 'and',
        rules: [{ id: 'r-1', field: 'age', operator: '>', value: 'abc' }],
      };
      const result = formatQuery(query, {
        format: 'diagnostics',
        fields: [{ name: 'age', label: 'Age', inputType: 'number' }],
      });
      expect(result.diagnostics).toContainEqual(
        expect.objectContaining({ id: 'r-1', code: 'VALUE_TYPE_MISMATCH', source: 'type-check' })
      );
    });

    it('does not flag numeric values for number fields', () => {
      const query: DefaultRuleGroupType = {
        id: 'g-root',
        combinator: 'and',
        rules: [{ id: 'r-1', field: 'age', operator: '>', value: 26 }],
      };
      const result = formatQuery(query, {
        format: 'diagnostics',
        fields: [{ name: 'age', label: 'Age', inputType: 'number' }],
      });
      expect(result.diagnostics.filter(d => d.code === 'VALUE_TYPE_MISMATCH')).toHaveLength(0);
    });

    it('does not flag numeric string values for number fields', () => {
      const query: DefaultRuleGroupType = {
        id: 'g-root',
        combinator: 'and',
        rules: [{ id: 'r-1', field: 'age', operator: '>', value: '26' }],
      };
      const result = formatQuery(query, {
        format: 'diagnostics',
        fields: [{ name: 'age', label: 'Age', inputType: 'number' }],
      });
      expect(result.diagnostics.filter(d => d.code === 'VALUE_TYPE_MISMATCH')).toHaveLength(0);
    });

    it('flags non-numeric values for range fields', () => {
      const query: DefaultRuleGroupType = {
        id: 'g-root',
        combinator: 'and',
        rules: [{ id: 'r-1', field: 'score', operator: '=', value: 'abc' }],
      };
      const result = formatQuery(query, {
        format: 'diagnostics',
        fields: [{ name: 'score', label: 'Score', inputType: 'range' }],
      });
      expect(result.diagnostics).toContainEqual(
        expect.objectContaining({ code: 'VALUE_TYPE_MISMATCH' })
      );
    });

    it('does not flag empty values for number fields', () => {
      const query: DefaultRuleGroupType = {
        id: 'g-root',
        combinator: 'and',
        rules: [{ id: 'r-1', field: 'age', operator: '>', value: '' }],
      };
      const result = formatQuery(query, {
        format: 'diagnostics',
        fields: [{ name: 'age', label: 'Age', inputType: 'number' }],
      });
      expect(result.diagnostics.filter(d => d.code === 'VALUE_TYPE_MISMATCH')).toHaveLength(0);
    });

    it('does not produce type-check diagnostics when no fields config is provided', () => {
      const query: DefaultRuleGroupType = {
        id: 'g-root',
        combinator: 'and',
        rules: [{ id: 'r-1', field: 'age', operator: '>', value: 'abc' }],
      };
      const result = formatQuery(query, 'diagnostics');
      expect(result.diagnostics.filter(d => d.source === 'type-check')).toHaveLength(0);
    });

    it('does not produce type-check diagnostics for text fields', () => {
      const query: DefaultRuleGroupType = {
        id: 'g-root',
        combinator: 'and',
        rules: [{ id: 'r-1', field: 'firstName', operator: '=', value: 'Steve' }],
      };
      const result = formatQuery(query, {
        format: 'diagnostics',
        fields: [{ name: 'firstName', label: 'First Name', inputType: 'text' }],
      });
      expect(result.diagnostics.filter(d => d.source === 'type-check')).toHaveLength(0);
    });
  });

  describe('undefined fields', () => {
    it('flags fields in the query that are not in the fields config', () => {
      const query: DefaultRuleGroupType = {
        id: 'g-root',
        combinator: 'and',
        rules: [{ id: 'r-1', field: 'unknownField', operator: '=', value: 'test' }],
      };
      const result = formatQuery(query, {
        format: 'diagnostics',
        fields: [{ name: 'firstName', label: 'First Name' }],
      });
      expect(result.diagnostics).toContainEqual(
        expect.objectContaining({ id: 'r-1', code: 'UNDEFINED_FIELD', source: 'field-check' })
      );
    });

    it('does not flag fields that are in the config', () => {
      const result = formatQuery(validQuery, {
        format: 'diagnostics',
        fields: [
          { name: 'firstName', label: 'First Name' },
          { name: 'age', label: 'Age' },
        ],
      });
      expect(result.diagnostics.filter(d => d.code === 'UNDEFINED_FIELD')).toHaveLength(0);
    });

    it('flags fields defined in config but not used in the query', () => {
      const result = formatQuery(validQuery, {
        format: 'diagnostics',
        fields: [
          { name: 'firstName', label: 'First Name' },
          { name: 'age', label: 'Age' },
          { name: 'unusedField', label: 'Unused' },
        ],
      });
      expect(result.diagnostics).toContainEqual(
        expect.objectContaining({ code: 'UNREFERENCED_FIELD', source: 'field-check' })
      );
      const unreferenced = result.diagnostics.find(d => d.code === 'UNREFERENCED_FIELD');
      expect(unreferenced!.message).toContain('unusedField');
    });

    it('does not produce field-check diagnostics when no fields config is provided', () => {
      const query: DefaultRuleGroupType = {
        id: 'g-root',
        combinator: 'and',
        rules: [{ id: 'r-1', field: 'anything', operator: '=', value: 'test' }],
      };
      const result = formatQuery(query, 'diagnostics');
      expect(result.diagnostics.filter(d => d.source === 'field-check')).toHaveLength(0);
    });

    it('does not flag placeholder fields as undefined', () => {
      const query: DefaultRuleGroupType = {
        id: 'g-root',
        combinator: 'and',
        rules: [{ id: 'r-1', field: defaultPlaceholderFieldName, operator: '=', value: 'test' }],
      };
      const result = formatQuery(query, {
        format: 'diagnostics',
        fields: [{ name: 'firstName', label: 'First Name' }],
      });
      expect(result.diagnostics.filter(d => d.code === 'UNDEFINED_FIELD')).toHaveLength(0);
    });
  });
});
