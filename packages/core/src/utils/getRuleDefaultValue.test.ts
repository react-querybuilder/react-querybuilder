import type { FullField, FullOptionList, Option, RuleType } from '../types';
import type { GetRuleDefaultValueOptions } from './getRuleDefaultValue';
import { getRuleDefaultValue } from './getRuleDefaultValue';
import { toFullOption } from './optGroupUtils';

const fieldA: FullField = toFullOption({ name: 'fieldA', label: 'Field A' });
const fieldB: FullField = toFullOption({ name: 'fieldB', label: 'Field B' });
const fields: FullOptionList<FullField> = [fieldA, fieldB];

const optionList: FullOptionList<Option> = [
  toFullOption({ name: 'opt1', label: 'Option 1' }),
  toFullOption({ name: 'opt2', label: 'Option 2' }),
];

const rule = (overrides: Partial<RuleType> = {}): RuleType => ({
  field: 'fieldA',
  operator: '=',
  value: '',
  ...overrides,
});

const makeOptions = (o: Partial<GetRuleDefaultValueOptions> = {}): GetRuleDefaultValueOptions => ({
  fieldData: o.fieldData ?? fieldA,
  fields: o.fields ?? fields,
  getValueEditorType: o.getValueEditorType ?? (() => 'text'),
  getValues: o.getValues ?? (() => []),
  getDefaultValue: o.getDefaultValue,
  getParameters: o.getParameters ?? (() => []),
  listsAsArrays: o.listsAsArrays,
});

describe('precedence', () => {
  it("returns the field's defaultValue when present", () => {
    const fieldData = toFullOption({ name: 'fieldA', label: 'Field A', defaultValue: 'preset' });
    expect(getRuleDefaultValue(rule(), makeOptions({ fieldData }))).toBe('preset');
  });

  it('falls back to getDefaultValue when defaultValue is null', () => {
    const fieldData = toFullOption({ name: 'fieldA', label: 'Field A', defaultValue: null });
    const getDefaultValue = vi.fn(() => 'fromGetter');
    expect(getRuleDefaultValue(rule(), makeOptions({ fieldData, getDefaultValue }))).toBe(
      'fromGetter'
    );
    expect(getDefaultValue).toHaveBeenCalledWith(rule(), { fieldData });
  });

  it('tolerates undefined fieldData', () => {
    expect(
      getRuleDefaultValue(rule(), {
        // @ts-expect-error In practice, fieldData can be undefined
        fieldData: undefined,
        fields,
        getValueEditorType: () => 'text',
        getValues: () => [],
      })
    ).toBe('');
  });
});

describe('valueSource "field"', () => {
  it('seeds the first comparator-valid field', () => {
    expect(getRuleDefaultValue(rule({ valueSource: 'field' }), makeOptions())).toBe('fieldB');
  });

  it('returns an empty string when no other field matches', () => {
    expect(
      getRuleDefaultValue(rule({ valueSource: 'field' }), makeOptions({ fields: [fieldA] }))
    ).toBe('');
  });
});

describe('valueSource "parameter"', () => {
  const getParameters = () => optionList;

  it('seeds the first parameter when a non-empty list is provided', () => {
    expect(
      getRuleDefaultValue(rule({ valueSource: 'parameter' }), makeOptions({ getParameters }))
    ).toBe('opt1');
  });

  it('returns an empty string when parameters is empty or nullish', () => {
    expect(
      getRuleDefaultValue(
        rule({ valueSource: 'parameter' }),
        makeOptions({ getParameters: () => [] })
      )
    ).toBe('');
    expect(getRuleDefaultValue(rule({ valueSource: 'parameter' }), makeOptions())).toBe('');
  });
});

describe('value lists', () => {
  const getValues = () => optionList;

  it('seeds the first option for a select editor', () => {
    expect(
      getRuleDefaultValue(rule(), makeOptions({ getValues, getValueEditorType: () => 'select' }))
    ).toBe('opt1');
  });

  it('joins the first option twice for between operators', () => {
    expect(
      getRuleDefaultValue(
        rule({ operator: 'between' }),
        makeOptions({ getValues, getValueEditorType: () => 'select' })
      )
    ).toBe('opt1,opt1');
  });

  it('returns paired arrays for between when listsAsArrays is set', () => {
    expect(
      getRuleDefaultValue(
        rule({ operator: 'between' }),
        makeOptions({ getValues, getValueEditorType: () => 'select', listsAsArrays: true })
      )
    ).toEqual(['opt1', 'opt1']);
  });

  it('handles radio editors and notBetween operators', () => {
    expect(
      getRuleDefaultValue(
        rule({ operator: 'notBetween' }),
        makeOptions({ getValues, getValueEditorType: () => 'radio' })
      )
    ).toBe('opt1,opt1');
  });

  it('returns an empty array for multiselect when listsAsArrays is set', () => {
    expect(
      getRuleDefaultValue(
        rule(),
        makeOptions({ getValues, getValueEditorType: () => 'multiselect', listsAsArrays: true })
      )
    ).toEqual([]);
  });

  it('returns an empty string for multiselect otherwise', () => {
    expect(
      getRuleDefaultValue(
        rule(),
        makeOptions({ getValues, getValueEditorType: () => 'multiselect' })
      )
    ).toBe('');
  });

  it('returns an empty string for other editors even with values', () => {
    expect(
      getRuleDefaultValue(rule(), makeOptions({ getValues, getValueEditorType: () => 'text' }))
    ).toBe('');
  });
});

describe('empty value lists', () => {
  it('returns false for checkbox editors', () => {
    expect(getRuleDefaultValue(rule(), makeOptions({ getValueEditorType: () => 'checkbox' }))).toBe(
      false
    );
  });

  it('returns an empty string for other editors', () => {
    expect(getRuleDefaultValue(rule(), makeOptions({ getValueEditorType: () => 'text' }))).toBe('');
  });
});
