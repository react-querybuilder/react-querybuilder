import {
  coerceBigIntValue,
  coerceInputType,
  getMultiValueUpdate,
  getValueEditorReset,
  getValueSelectorUpdate,
  isBetweenOperator,
  normalizeValueSelectorValue,
} from './deriveValueEditor';

describe('isBetweenOperator', () => {
  it.each([
    ['between', true],
    ['notBetween', true],
    ['in', false],
    ['=', false],
  ])('%s', (operator, expected) => {
    expect(isBetweenOperator(operator)).toBe(expected);
  });
});

describe('getValueEditorReset', () => {
  it('collapses an array to its first element', () => {
    expect(getValueEditorReset({ operator: '=', value: ['a', 'b'] })).toEqual({
      reset: true,
      value: 'a',
    });
  });

  it('collapses a comma-containing string for number inputs', () => {
    expect(getValueEditorReset({ operator: '=', value: '12,14', inputType: 'number' })).toEqual({
      reset: true,
      value: '12',
    });
  });

  it('leaves a comma-containing string alone for other input types', () => {
    expect(getValueEditorReset({ operator: '=', value: '12,14', inputType: 'text' })).toEqual({
      reset: false,
      value: '12,14',
    });
  });

  it('falls back to an empty string for an empty array', () => {
    expect(getValueEditorReset({ operator: '=', value: [] })).toEqual({ reset: true, value: '' });
  });

  it.each(['between', 'notBetween', 'in', 'notIn'])(
    'does not reset for the "%s" operator',
    operator => {
      expect(getValueEditorReset({ operator, value: ['a', 'b'] }).reset).toBe(false);
    }
  );

  it('does not reset for multiselect editors', () => {
    expect(getValueEditorReset({ operator: '=', value: ['a'], type: 'multiselect' }).reset).toBe(
      false
    );
  });

  it('does not reset when skipHook is set', () => {
    expect(getValueEditorReset({ operator: '=', value: ['a'], skipHook: true }).reset).toBe(false);
  });

  it('does not reset a scalar value', () => {
    expect(getValueEditorReset({ operator: '=', value: 'a' })).toEqual({
      reset: false,
      value: 'a',
    });
  });
});

describe('getMultiValueUpdate', () => {
  const base = { valueAsArray: ['a', 'b'], operator: 'in' as string };

  it('replaces the element at the index', () => {
    expect(getMultiValueUpdate({ ...base, value: 'x', index: 1 })).toBe('a,x');
  });

  it('returns an array when listsAsArrays is set', () => {
    expect(getMultiValueUpdate({ ...base, value: 'x', index: 1, listsAsArrays: true })).toEqual([
      'a',
      'x',
    ]);
  });

  it('returns the list unchanged when the value is identical', () => {
    expect(getMultiValueUpdate({ ...base, value: 'a', index: 0 })).toBe('a,b');
  });

  it('returns the array as-is when unchanged and listsAsArrays is set', () => {
    // Reference identity: the same array is handed back, not a copy.
    expect(getMultiValueUpdate({ ...base, value: 'a', index: 0, listsAsArrays: true })).toBe(
      base.valueAsArray
    );
  });

  it('parses numbers when a method is supplied', () => {
    expect(
      getMultiValueUpdate({
        valueAsArray: ['1', '2'],
        operator: 'in',
        value: '3',
        index: 1,
        parseNumberMethod: 'strict',
        listsAsArrays: true,
      })
    ).toEqual(['1', 3]);
  });

  describe('between/notBetween', () => {
    it('backfills a missing second bound from the first option', () => {
      expect(
        getMultiValueUpdate({
          valueAsArray: ['a'],
          operator: 'between',
          value: 'x',
          index: 0,
          values: [{ name: 'opt1', value: 'opt1', label: 'Option 1' }],
          listsAsArrays: true,
        })
      ).toEqual(['x', 'opt1']);
    });

    it('backfills when the second bound is undefined', () => {
      expect(
        getMultiValueUpdate({
          valueAsArray: ['a', undefined],
          operator: 'notBetween',
          value: 'x',
          index: 0,
          values: [{ name: 'opt1', value: 'opt1', label: 'Option 1' }],
          listsAsArrays: true,
        })
      ).toEqual(['x', 'opt1']);
    });

    it('backfills even when the first bound is unchanged', () => {
      expect(
        getMultiValueUpdate({
          valueAsArray: ['a'],
          operator: 'between',
          value: 'a',
          index: 0,
          values: [{ name: 'opt1', value: 'opt1', label: 'Option 1' }],
          listsAsArrays: true,
        })
      ).toEqual(['a', 'opt1']);
    });

    it('seeds an empty string when no values are available', () => {
      expect(
        getMultiValueUpdate({
          valueAsArray: ['a'],
          operator: 'between',
          value: 'x',
          index: 0,
          listsAsArrays: true,
        })
      ).toEqual(['x', '']);
    });

    it('produces a trailing empty segment when joined', () => {
      expect(
        getMultiValueUpdate({ valueAsArray: ['a'], operator: 'between', value: 'x', index: 0 })
      ).toBe('x,');
    });

    it('does not backfill when editing the second bound', () => {
      expect(
        getMultiValueUpdate({
          valueAsArray: ['a'],
          operator: 'between',
          value: 'x',
          index: 1,
          listsAsArrays: true,
        })
      ).toEqual(['a', 'x']);
    });

    it('does not backfill when both bounds are present', () => {
      expect(
        getMultiValueUpdate({
          valueAsArray: ['a', 'b'],
          operator: 'between',
          value: 'x',
          index: 0,
          listsAsArrays: true,
        })
      ).toEqual(['x', 'b']);
    });
  });
});

describe('coerceBigIntValue', () => {
  it('produces a bigint', () => {
    expect(coerceBigIntValue('12')).toBe(12n);
  });

  it('falls back to the parsed value when not representable', () => {
    expect(coerceBigIntValue('not a number')).toBe('not a number');
  });

  it('falls back for decimals', () => {
    expect(coerceBigIntValue('1.5')).toBe('1.5');
  });

  it('retains precision beyond Number.MAX_SAFE_INTEGER', () => {
    expect(coerceBigIntValue('9007199254740993')).toBe(9007199254740993n);
  });
});

describe('coerceInputType', () => {
  it.each([
    ['bigint', '=', 'text'],
    ['number', 'in', 'text'],
    ['number', 'notIn', 'text'],
    ['number', '=', 'number'],
    ['date', '=', 'date'],
  ])('coerces %s/%s to %s', (inputType, operator, expected) => {
    expect(coerceInputType(inputType as never, operator)).toBe(expected);
  });

  it('defaults to text', () => {
    expect(coerceInputType(null, '=')).toBe('text');
    expect(coerceInputType(undefined, '=')).toBe('text');
  });
});

describe('getValueSelectorUpdate', () => {
  it('passes single-select values through', () => {
    expect(getValueSelectorUpdate('a')).toBe('a');
    expect(getValueSelectorUpdate('a', { multiple: false })).toBe('a');
  });

  it('joins multiselect values', () => {
    expect(getValueSelectorUpdate(['a', 'b'], { multiple: true })).toBe('a,b');
  });

  it('returns an array when listsAsArrays is set', () => {
    expect(getValueSelectorUpdate(['a', 'b'], { multiple: true, listsAsArrays: true })).toEqual([
      'a',
      'b',
    ]);
  });

  it('normalizes a single value to an array first', () => {
    expect(getValueSelectorUpdate('a', { multiple: true, listsAsArrays: true })).toEqual(['a']);
  });
});

describe('normalizeValueSelectorValue', () => {
  it('passes single-select values through', () => {
    expect(normalizeValueSelectorValue(42)).toBe(42);
  });

  it('stringifies multiselect values so they match option names', () => {
    expect(normalizeValueSelectorValue([42, 43], true)).toEqual(['42', '43']);
  });

  it('normalizes a comma-separated string', () => {
    expect(normalizeValueSelectorValue('a,b', true)).toEqual(['a', 'b']);
  });
});
