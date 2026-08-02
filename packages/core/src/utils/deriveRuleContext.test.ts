import type {
  FullField,
  FullOperator,
  FullOption,
  OptionList,
  RuleType,
  ValueSourceFullOptions,
} from '../types';
import {
  deriveRuleContext,
  deriveRuleGroupContext,
  getRuleGroupCombinator,
  getFieldData,
  getParametersAsList,
  getRuleInputType,
  getRuleValidationResult,
  getRuleValueEditorType,
  getRuleValues,
  getRuleValueSourceOptions,
  hideValueControlsForOperator,
} from './deriveRuleContext';
import { toFullOptionList } from './optGroupUtils';

const f1: FullField = { name: 'f1', value: 'f1', label: 'Field 1' };
const f2: FullField = { name: 'f2', value: 'f2', label: 'Field 2' };
const fieldMap = { f1, f2 };
const fields = [f1, f2] as OptionList<FullField>;

const rule = (r: Partial<RuleType> = {}): RuleType => ({
  field: 'f1',
  operator: '=',
  value: '',
  ...r,
});

const resolvers = {
  fields,
  fieldMap,
  getInputType: () => null,
  getMatchModes: () => [],
  getOperators: () => toFullOptionList([{ name: '=', label: '=' }]),
  getParameters: () => [],
  getValueEditorType: () => 'text' as const,
  getValues: () => [],
  getValueSources: () => toFullOptionList(['value']) as ValueSourceFullOptions,
};

describe('getFieldData', () => {
  it('returns the configured field', () => {
    expect(getFieldData('f1', fieldMap)).toBe(f1);
  });

  it('falls back to a minimal option for unknown fields', () => {
    expect(getFieldData('nope', fieldMap)).toEqual({ name: 'nope', value: 'nope', label: 'nope' });
  });

  it('tolerates a nullish field map', () => {
    expect(getFieldData('f1', null as never)).toEqual({ name: 'f1', value: 'f1', label: 'f1' });
  });
});

describe('getRuleInputType', () => {
  it("prefers the field's own inputType", () => {
    expect(getRuleInputType('f1', '=', { ...f1, inputType: 'number' }, () => 'text')).toBe(
      'number'
    );
  });

  it('falls back to getInputType', () => {
    expect(getRuleInputType('f1', '=', f1, () => 'date')).toBe('date');
  });

  it('returns null when neither is available', () => {
    expect(getRuleInputType('f1', '=', f1, () => null)).toBeNull();
  });
});

describe('hideValueControlsForOperator', () => {
  it.each([
    ['unary arity', { name: 'null', value: 'null', label: 'null', arity: 'unary' }, true],
    ['binary arity', { name: '=', value: '=', label: '=', arity: 'binary' }, false],
    ['numeric arity below 2', { name: 'null', value: 'null', label: 'null', arity: 1 }, true],
    ['numeric arity of 2', { name: '=', value: '=', label: '=', arity: 2 }, false],
    ['no arity', { name: '=', value: '=', label: '=' }, false],
  ])('handles %s', (_label, operatorObject, expected) => {
    expect(hideValueControlsForOperator(operatorObject as never)).toBe(expected);
  });

  it('handles a missing operator object', () => {
    expect(hideValueControlsForOperator(undefined)).toBe(false);
  });
});

describe('getRuleValueSourceOptions', () => {
  it('returns the configured list', () => {
    const result = getRuleValueSourceOptions(rule(), f1, resolvers.getValueSources);
    expect(result.map(vs => vs.value)).toEqual(['value']);
  });

  it("appends the rule's value source when not configured", () => {
    const result = getRuleValueSourceOptions(
      rule({ valueSource: 'field' }),
      f1,
      resolvers.getValueSources
    );
    expect(result.map(vs => vs.value)).toEqual(['value', 'field']);
  });

  it('does not duplicate an already-configured value source', () => {
    const result = getRuleValueSourceOptions(
      rule({ valueSource: 'value' }),
      f1,
      resolvers.getValueSources
    );
    expect(result.map(vs => vs.value)).toEqual(['value']);
  });
});

describe('getParametersAsList', () => {
  it('returns null for an empty list', () => {
    expect(getParametersAsList([])).toBeNull();
  });

  it('returns the list when non-empty', () => {
    const params = [{ name: 'p1', value: 'p1', label: 'p1' }];
    expect(getParametersAsList(params)).toBe(params);
  });
});

describe('getRuleValueEditorType', () => {
  const params = [{ name: 'p1', value: 'p1', label: 'p1' }];

  it('uses a select for the "field" value source', () => {
    expect(getRuleValueEditorType(rule({ valueSource: 'field' }), f1, null, () => 'text')).toBe(
      'select'
    );
  });

  it('uses a select for the "parameter" value source', () => {
    expect(
      getRuleValueEditorType(rule({ valueSource: 'parameter' }), f1, params, () => 'text')
    ).toBe('select');
  });

  it.each(['in', 'notIn', 'IN', 'NOTIN'])(
    'uses a multiselect for the "parameter" value source with the "%s" operator',
    operator => {
      expect(
        getRuleValueEditorType(
          rule({ valueSource: 'parameter', operator }),
          f1,
          params,
          () => 'text'
        )
      ).toBe('multiselect');
    }
  );

  it('falls back to text when no parameters are available', () => {
    expect(
      getRuleValueEditorType(rule({ valueSource: 'parameter' }), f1, null, () => 'select')
    ).toBe('text');
  });

  it('delegates for other value sources', () => {
    expect(getRuleValueEditorType(rule(), f1, null, () => 'checkbox')).toBe('checkbox');
  });
});

describe('getRuleValues', () => {
  it('filters fields for the "field" value source', () => {
    const result = getRuleValues(
      rule({ valueSource: 'field' }),
      f1,
      fields,
      null,
      resolvers.getValues
    );
    // The rule's own field is excluded from the comparison list.
    expect((result as FullOption[]).map(o => o.value)).toEqual(['f2']);
  });

  it('uses the parameter list for the "parameter" value source', () => {
    const params = [{ name: 'p1', value: 'p1', label: 'p1' }];
    const result = getRuleValues(
      rule({ valueSource: 'parameter' }),
      f1,
      fields,
      params,
      resolvers.getValues
    );
    expect(result).toEqual(params);
  });

  it('returns an empty list when the "parameter" value source has no parameters', () => {
    const result = getRuleValues(
      rule({ valueSource: 'parameter' }),
      f1,
      fields,
      null,
      resolvers.getValues
    );
    expect(result).toEqual([]);
  });

  it('delegates to getValues otherwise, normalizing to a full option list', () => {
    const result = getRuleValues(rule(), f1, fields, null, () => [{ name: 'a', label: 'A' }]);
    expect(result).toEqual([{ name: 'a', value: 'a', label: 'A' }]);
  });

  it('passes through a list that is already normalized', () => {
    const result = getRuleValues(rule(), f1, fields, null, () => ['a', 'b'] as never);
    expect(result).toEqual(['a', 'b']);
  });
});

describe('getRuleValidationResult', () => {
  it('prefers the validation map entry', () => {
    expect(getRuleValidationResult(rule({ id: 'r1' }), f1, { r1: false })).toBe(false);
  });

  it("falls back to the field's validator", () => {
    const fieldWithValidator = { ...f1, validator: () => true };
    expect(getRuleValidationResult(rule({ id: 'r1' }), fieldWithValidator, {})).toBe(true);
  });

  it('returns null when neither applies', () => {
    expect(getRuleValidationResult(rule({ id: 'r1' }), f1, {})).toBeNull();
  });

  it('defaults the validation map and derives the id from the rule', () => {
    expect(getRuleValidationResult(rule({ id: 'r1' }), f1)).toBeNull();
  });

  it('tolerates a rule with no id', () => {
    expect(getRuleValidationResult(rule(), f1, {})).toBeNull();
  });
});

describe('deriveRuleContext', () => {
  it('resolves the full context', () => {
    const ctx = deriveRuleContext(rule({ id: 'r1' }), resolvers);

    expect(ctx.fieldData).toBe(f1);
    expect(ctx.inputType).toBeNull();
    expect(ctx.matchModes).toEqual([]);
    expect((ctx.operators as FullOperator[]).map(o => o.value)).toEqual(['=']);
    expect(ctx.operatorObject?.value).toBe('=');
    expect(ctx.hideValueControls).toBe(false);
    expect(ctx.parameters).toBeNull();
    expect(ctx.valueEditorType).toBe('text');
    expect(ctx.values).toEqual([]);
    expect(ctx.valueSources).toEqual(['value']);
    expect(ctx.validationResult).toBeNull();
  });

  it("prefers the field's own inputType", () => {
    const ctx = deriveRuleContext(rule(), {
      ...resolvers,
      fieldMap: { f1: { ...f1, inputType: 'number' } },
      getInputType: () => 'text',
    });
    expect(ctx.inputType).toBe('number');
  });

  it('falls back to getInputType', () => {
    const ctx = deriveRuleContext(rule(), { ...resolvers, getInputType: () => 'date' });
    expect(ctx.inputType).toBe('date');
  });

  it('passes the validation map through', () => {
    const ctx = deriveRuleContext(rule({ id: 'r1' }), resolvers, {
      validationMap: { r1: { valid: false, reasons: ['nope'] } },
      id: 'r1',
    });
    expect(ctx.validationResult).toEqual({ valid: false, reasons: ['nope'] });
  });
});

describe('getRuleGroupCombinator', () => {
  const combinators = toFullOptionList([
    { name: 'and', label: 'AND' },
    { name: 'or', label: 'OR' },
  ]);

  it("uses the group's own combinator", () => {
    expect(getRuleGroupCombinator({ combinator: 'or', rules: [] }, combinators)).toBe('or');
  });

  it('falls back to the first combinator for independent combinators', () => {
    expect(getRuleGroupCombinator({ rules: [] }, combinators)).toBe('and');
  });

  it('returns an empty string when no combinators are configured', () => {
    expect(getRuleGroupCombinator({ rules: [] }, toFullOptionList([]))).toBe('');
  });
});

describe('deriveRuleGroupContext', () => {
  const combinators = toFullOptionList([
    { name: 'and', label: 'AND', className: 'and-class' },
    { name: 'or', label: 'OR' },
  ]);

  it('resolves a standard group', () => {
    const ctx = deriveRuleGroupContext({ combinator: 'and', rules: [] }, combinators);
    expect(ctx.combinator).toBe('and');
    expect(ctx.combinatorObject?.value).toBe('and');
    expect(ctx.combinatorBasedClassName).toBe('and-class');
    expect(ctx.independentCombinators).toBe(false);
    expect(ctx.validationResult).toBeNull();
  });

  it('returns an empty class when the combinator has none', () => {
    const ctx = deriveRuleGroupContext({ combinator: 'or', rules: [] }, combinators);
    expect(ctx.combinatorBasedClassName).toBe('');
  });

  it('returns a null class for independent combinators', () => {
    const ctx = deriveRuleGroupContext({ rules: [] }, combinators);
    expect(ctx.independentCombinators).toBe(true);
    expect(ctx.combinatorBasedClassName).toBeNull();
  });

  it('reads the validation result from the map', () => {
    const ctx = deriveRuleGroupContext({ id: 'g1', combinator: 'and', rules: [] }, combinators, {
      validationMap: { g1: { valid: false, reasons: ['nope'] } },
    });
    expect(ctx.validationResult).toEqual({ valid: false, reasons: ['nope'] });
  });

  it('accepts an explicit id', () => {
    const ctx = deriveRuleGroupContext({ combinator: 'and', rules: [] }, combinators, {
      validationMap: { g1: false },
      id: 'g1',
    });
    expect(ctx.validationResult).toBe(false);
  });

  it('has no field-validator fallback, unlike rules', () => {
    const ctx = deriveRuleGroupContext({ id: 'g1', combinator: 'and', rules: [] }, combinators);
    expect(ctx.validationResult).toBeNull();
  });
});
