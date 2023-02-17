import { renderHook } from '@testing-library/react';
import { useValueEditor } from './useValueEditor';

it('calls handleOnChange when inputType is number, operator is not "between"/"in", and value is an array', async () => {
  const handleOnChange = jest.fn();
  renderHook(() =>
    useValueEditor({ handleOnChange, operator: '=', inputType: 'number', value: [12, 14] })
  );
  expect(handleOnChange).toHaveBeenCalledWith(12);
});

it('calls handleOnChange when inputType is number, operator is not "between"/"in", and value is a string with a comma', async () => {
  const handleOnChange = jest.fn();
  const hr = renderHook(() =>
    useValueEditor({ handleOnChange, operator: '=', inputType: 'number', value: '12, 14' })
  );
  expect(handleOnChange).toHaveBeenCalledWith('12');
  expect(hr.result.current.valueAsArray).toEqual(['12', '14']);
});

it('sets valueAsArray when operator is "between"', async () => {
  const handleOnChange = jest.fn();
  const hr = renderHook(() =>
    useValueEditor({
      handleOnChange,
      operator: 'between',
      inputType: 'number',
      value: [12, 14],
      type: 'text',
    })
  );
  expect(hr.result.current.valueAsArray).toEqual([12, 14]);
});

it('does not call handleOnChange when skipHook is true', async () => {
  const handleOnChange = jest.fn();
  const hr = renderHook(() =>
    useValueEditor({
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
