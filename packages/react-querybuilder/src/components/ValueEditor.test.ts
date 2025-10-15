import type {
  FullField,
  ParseNumberMethod,
  ParseNumbersPropConfig,
} from '@react-querybuilder/core';
import { testValueEditor } from '@rqb-testing';
import { renderHook } from '@testing-library/react';
import type { Schema, ValueEditorProps } from '../types';
import { useValueEditor, ValueEditor } from './ValueEditor';

testValueEditor(ValueEditor);

const baseValueEditorProps: ValueEditorProps = {
  field: 'f',
  operator: '=',
  valueSource: 'value',
  fieldData: { name: 'f', value: 'f', label: 'F' },
  schema: { classNames: {} } as unknown as Schema<FullField, string>,
  handleOnChange: () => {},
  path: [],
  level: 0,
  rule: { field: 'f', operator: '=', value: '' },
  value: '',
};

it('calls handleOnChange when operator is not "between"/"in" and value is an array', () => {
  const handleOnChange = jest.fn();
  renderHook(() =>
    useValueEditor({
      ...baseValueEditorProps,
      handleOnChange,
      operator: '=',
      value: ['twelve', 'fourteen'],
    })
  );
  expect(handleOnChange).toHaveBeenCalledWith('twelve');
});

it('calls handleOnChange when inputType is number, operator is not "between"/"in", and value is an array', () => {
  const handleOnChange = jest.fn();
  renderHook(() =>
    useValueEditor({
      ...baseValueEditorProps,
      handleOnChange,
      operator: '=',
      inputType: 'number',
      value: [12, 14],
    })
  );
  expect(handleOnChange).toHaveBeenCalledWith(12);
});

it('calls handleOnChange when inputType is number, operator is not "between"/"in", and value is a string with a comma', () => {
  const handleOnChange = jest.fn();
  const hr = renderHook(() =>
    useValueEditor({
      ...baseValueEditorProps,
      handleOnChange,
      operator: '=',
      inputType: 'number',
      value: '12, 14',
    })
  );
  expect(handleOnChange).toHaveBeenCalledWith('12');
  expect(hr.result.current.valueAsArray).toEqual(['12', '14']);
});

it('sets valueAsArray when operator is "between"', () => {
  const handleOnChange = jest.fn();
  const hr = renderHook(() =>
    useValueEditor({
      ...baseValueEditorProps,
      handleOnChange,
      operator: 'between',
      inputType: 'number',
      value: [12, 14],
      type: 'text',
    })
  );
  expect(hr.result.current.valueAsArray).toEqual([12, 14]);
});

describe('parseNumbers', () => {
  it.each([
    { pn: true, text: 'strict', number: 'strict' },
    { pn: false, text: false, number: false },
    { pn: 'enhanced', text: 'enhanced', number: 'enhanced' },
    { pn: 'enhanced-limited', text: false, number: 'enhanced' },
    { pn: 'native', text: 'native', number: 'native' },
    { pn: 'native-limited', text: false, number: 'native' },
    { pn: 'strict', text: 'strict', number: 'strict' },
    { pn: 'strict-limited', text: false, number: 'strict' },
  ] satisfies {
    pn: ParseNumbersPropConfig;
    text: ParseNumberMethod;
    number: ParseNumberMethod;
  }[])('processes $pn correctly', ({ pn, number, text }) => {
    const handleOnChangeText = jest.fn();
    const hrText = renderHook(() =>
      useValueEditor({
        ...baseValueEditorProps,
        handleOnChange: handleOnChangeText,
        operator: '=',
        inputType: 'text',
        parseNumbers: pn,
      })
    );
    expect(hrText.result.current.parseNumberMethod).toBe(text);

    const handleOnChangeNumber = jest.fn();
    const hrNumber = renderHook(() =>
      useValueEditor({
        ...baseValueEditorProps,
        handleOnChange: handleOnChangeNumber,
        operator: '=',
        inputType: 'number',
        parseNumbers: pn,
      })
    );
    expect(hrNumber.result.current.parseNumberMethod).toBe(number);
  });
});

it('does not call handleOnChange when type is "multiselect"', () => {
  const handleOnChange = jest.fn();
  renderHook(() =>
    useValueEditor({
      ...baseValueEditorProps,
      handleOnChange,
      type: 'multiselect',
      operator: 'custom',
      value: ['twelve', 'fourteen'],
    })
  );
  expect(handleOnChange).not.toHaveBeenCalled();
});

it('does not call handleOnChange when skipHook is true', () => {
  const handleOnChange = jest.fn();
  const hr = renderHook(() =>
    useValueEditor({
      ...baseValueEditorProps,
      handleOnChange,
      operator: '=',
      inputType: 'number',
      value: [12, 14],
      skipHook: true,
    })
  );
  expect(handleOnChange).not.toHaveBeenCalled();
  expect(hr.result.current.valueAsArray).toEqual([12, 14]);
  hr.result.current.multiValueHandler('2', 0);
  expect(handleOnChange).toHaveBeenCalledWith('2,14');
});
