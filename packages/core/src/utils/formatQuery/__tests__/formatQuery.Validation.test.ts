import { defaultPlaceholderFieldName, defaultPlaceholderOperatorName } from '../../../defaults';
import type {
  DefaultOperatorName,
  DefaultRuleGroupType,
  DefaultRuleGroupTypeIC,
  RuleGroupICValidationResult,
  RuleGroupValidationResult,
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

describe('formatQuery("validation")', () => {
  it('marks a valid query as valid', () => {
    const result = formatQuery(validQuery, 'validation') as RuleGroupValidationResult;
    expect(result.valid).toBe(true);
    expect(result.rules).toHaveLength(2);
    expect(result.rules[0]).toMatchObject({ valid: true, field: 'firstName' });
    expect(result.rules[1]).toMatchObject({ valid: true, field: 'age' });
    expect(result).not.toHaveProperty('reasons');
    expect(result.rules[0]).not.toHaveProperty('reasons');
  });

  it('accepts format as an option object', () => {
    const result = formatQuery(validQuery, { format: 'validation' }) as RuleGroupValidationResult;
    expect(result.valid).toBe(true);
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
    const result = formatQuery(query, 'validation') as RuleGroupValidationResult;
    expect(result.valid).toBe(false);
    expect(result.rules[0]).toMatchObject({ valid: false });
    expect(result.rules[1]).toMatchObject({ valid: true });
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
    const result = formatQuery(query, 'validation') as RuleGroupValidationResult;
    expect(result.valid).toBe(false);
    expect(result.rules[0]).toMatchObject({ valid: false });
  });

  it('marks placeholder values as invalid when placeholderValueName is set', () => {
    const query: DefaultRuleGroupType = {
      id: 'g-root',
      combinator: 'and',
      rules: [{ id: 'r-1', field: 'firstName', operator: '=', value: '~' }],
    };
    const result = formatQuery(query, {
      format: 'validation',
      placeholderValueName: '~',
    }) as RuleGroupValidationResult;
    expect(result.valid).toBe(false);
    expect(result.rules[0]).toMatchObject({ valid: false });
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
    const result = formatQuery(query, 'validation') as RuleGroupValidationResult;
    expect(result.valid).toBe(false);
    expect(result.rules[0]).toMatchObject({ valid: false, muted: true });
    expect(result.rules[1]).toMatchObject({ valid: true });
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
    const result = formatQuery(query, 'validation') as RuleGroupValidationResult;
    expect(result.valid).toBe(false);
    const subGroup = result.rules[0] as RuleGroupValidationResult;
    expect(subGroup.valid).toBe(false);
  });

  it('handles empty groups', () => {
    const query: DefaultRuleGroupType = { id: 'g-root', combinator: 'and', rules: [] };
    const result = formatQuery(query, 'validation') as RuleGroupValidationResult;
    expect(result.valid).toBe(true);
    expect(result.rules).toHaveLength(0);
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
          rules: [{ id: 'r-2', field: defaultPlaceholderFieldName, operator: '=', value: 'test' }],
        },
      ],
    };
    const result = formatQuery(query, 'validation') as RuleGroupValidationResult;
    expect(result.valid).toBe(false);
    expect(result.rules[0]).toMatchObject({ valid: true });
    const subGroup = result.rules[1] as RuleGroupValidationResult;
    expect(subGroup.valid).toBe(false);
    expect(subGroup.rules[0]).toMatchObject({ valid: false });
  });

  it('preserves original rule properties', () => {
    const result = formatQuery(nestedQuery, 'validation') as RuleGroupValidationResult;
    expect(result.id).toBe('g-root');
    expect(result.combinator).toBe('and');
    expect(result.rules[0]).toMatchObject({
      id: 'r-1',
      field: 'firstName',
      operator: '=',
      value: 'Steve',
    });
    const subGroup = result.rules[1] as RuleGroupValidationResult;
    expect(subGroup.id).toBe('g-sub');
    expect(subGroup.combinator).toBe('or');
  });

  describe('query-level validator', () => {
    it('uses validationMap entries', () => {
      const validator = (): ValidationMap => ({
        'r-1': { valid: false, reasons: ['Name is required'] },
        'r-2': true,
      });
      const result = formatQuery(validQuery, {
        format: 'validation',
        validator,
      }) as RuleGroupValidationResult;
      expect(result.valid).toBe(false);
      expect(result.rules[0]).toMatchObject({ valid: false, reasons: ['Name is required'] });
      expect(result.rules[1]).toMatchObject({ valid: true });
      expect(result.rules[1]).not.toHaveProperty('reasons');
    });

    it('handles validator returning false for group IDs', () => {
      const validator = (): ValidationMap => ({ 'g-sub': false });
      const result = formatQuery(nestedQuery, {
        format: 'validation',
        validator,
      }) as RuleGroupValidationResult;
      expect(result.valid).toBe(false);
      const subGroup = result.rules[1] as RuleGroupValidationResult;
      expect(subGroup.valid).toBe(false);
    });

    it('still annotates every rule when validator returns boolean false', () => {
      const validator = () => false;
      const result = formatQuery(validQuery, {
        format: 'validation',
        validator,
      }) as RuleGroupValidationResult;
      expect(result.valid).toBe(true);
      expect(result.rules).toHaveLength(2);
      expect(result.rules[0]).toMatchObject({ valid: true, field: 'firstName' });
    });
  });

  describe('field-level validator', () => {
    it('marks rules invalid based on field validator', () => {
      const result = formatQuery(validQuery, {
        format: 'validation',
        fields: [
          { name: 'firstName', label: 'First Name', validator: () => false },
          { name: 'age', label: 'Age' },
        ],
      }) as RuleGroupValidationResult;
      expect(result.valid).toBe(false);
      expect(result.rules[0]).toMatchObject({ valid: false });
      expect(result.rules[1]).toMatchObject({ valid: true });
    });

    it('passes through reasons from field validator', () => {
      const result = formatQuery(validQuery, {
        format: 'validation',
        fields: [
          {
            name: 'firstName',
            label: 'First Name',
            validator: () => ({ valid: false, reasons: ['Must be longer than 5 chars'] }),
          },
          { name: 'age', label: 'Age' },
        ],
      }) as RuleGroupValidationResult;
      expect(result.rules[0]).toMatchObject({
        valid: false,
        reasons: ['Must be longer than 5 chars'],
      });
    });
  });

  describe('independent combinators', () => {
    it('handles IC queries with valid rules', () => {
      const icQuery: DefaultRuleGroupTypeIC = convertToIC(validQuery);
      const result = formatQuery(icQuery, 'validation') as RuleGroupICValidationResult;
      expect(result.valid).toBe(true);
      expect(result.rules).toHaveLength(3);
      expect(result.rules[0]).toMatchObject({ valid: true, field: 'firstName' });
      expect(result.rules[1]).toBe('and');
      expect(result.rules[2]).toMatchObject({ valid: true, field: 'age' });
    });

    it('handles IC queries with invalid rules', () => {
      const icQuery: DefaultRuleGroupTypeIC = {
        rules: [
          { id: 'r-1', field: defaultPlaceholderFieldName, operator: '=', value: 'test' },
          'and',
          { id: 'r-2', field: 'age', operator: '>', value: 26 },
        ],
      };
      const result = formatQuery(icQuery, 'validation') as RuleGroupICValidationResult;
      expect(result.valid).toBe(false);
      expect(result.rules[0]).toMatchObject({ valid: false });
      expect(result.rules[1]).toBe('and');
      expect(result.rules[2]).toMatchObject({ valid: true });
    });

    it('handles nested IC groups', () => {
      const icQuery: DefaultRuleGroupTypeIC = convertToIC(nestedQuery);
      const result = formatQuery(icQuery, 'validation') as RuleGroupICValidationResult;
      expect(result.valid).toBe(true);
      const subGroup = result.rules.find(
        r => typeof r !== 'string' && 'rules' in r
      ) as RuleGroupICValidationResult;
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
      const result = formatQuery(icQuery, {
        format: 'validation',
        validator,
      }) as RuleGroupICValidationResult;
      expect(result.valid).toBe(false);
      expect(result.reasons).toEqual(['IC group invalid']);
    });
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
    const result = formatQuery(query, 'validation') as RuleGroupValidationResult;
    expect(result.valid).toBe(false);
    expect(result.rules[0]).toMatchObject({ valid: true });
    expect(result.rules[1]).toMatchObject({ valid: false });
    expect(result.rules[2]).toMatchObject({ valid: true });
    expect(result.rules[3]).toMatchObject({ valid: false });
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
    const result = formatQuery(query, 'validation') as RuleGroupValidationResult;
    expect(result.valid).toBe(false);
    const g1 = result.rules[0] as RuleGroupValidationResult;
    expect(g1.valid).toBe(false);
    const g2 = g1.rules[0] as RuleGroupValidationResult;
    expect(g2.valid).toBe(false);
    expect(g2.rules[0]).toMatchObject({ valid: true });
    expect(g2.rules[1]).toMatchObject({ valid: false });
  });

  it('handles the not property on groups', () => {
    const query: DefaultRuleGroupType = {
      id: 'g-root',
      combinator: 'and',
      not: true,
      rules: [{ id: 'r-1', field: 'firstName', operator: '=', value: 'Steve' }],
    };
    const result = formatQuery(query, 'validation') as RuleGroupValidationResult;
    expect(result.valid).toBe(true);
    expect(result.not).toBe(true);
  });

  it('handles validationMap with reasons on groups', () => {
    const validator = (): ValidationMap => ({
      'g-root': { valid: false, reasons: ['Group needs at least 2 rules'] },
      'r-1': true,
    });
    const result = formatQuery(validQuery, {
      format: 'validation',
      validator,
    }) as RuleGroupValidationResult;
    expect(result.valid).toBe(false);
    expect(result.reasons).toEqual(['Group needs at least 2 rules']);
  });

  it('does not include reasons when validationMap entry is a bare false', () => {
    const validator = (): ValidationMap => ({ 'r-1': false });
    const result = formatQuery(validQuery, {
      format: 'validation',
      validator,
    }) as RuleGroupValidationResult;
    expect(result.rules[0]).toMatchObject({ valid: false });
    expect(result.rules[0]).not.toHaveProperty('reasons');
  });
});
