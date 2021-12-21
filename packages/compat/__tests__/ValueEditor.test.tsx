import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ValueEditorProps } from 'react-querybuilder';
import { findInput, findSelect } from './utils';

const defaultProps: ValueEditorProps = {
  field: 'TEST',
  fieldData: { name: 'TEST', label: 'Test' },
  operator: '=',
  handleOnChange: () => {},
  level: 0,
  path: [],
};

export const testValueEditor = (ValueEditor: React.ComponentType<ValueEditorProps>) => {
  const title = ValueEditor.displayName ?? 'ValueEditor';
  const props = { ...defaultProps, title };

  describe(title, () => {
    describe('when using default rendering', () => {
      it('should have the value passed into the <input />', () => {
        const { getByTitle } = render(<ValueEditor {...props} value="test" />);
        expect((getByTitle(title) as HTMLInputElement).value).toBe('test');
      });

      it('should render nothing for operator "null"', () => {
        const { getByTitle } = render(<ValueEditor {...props} operator="null" />);
        expect(() => getByTitle(title)).toThrow();
      });

      it('should render nothing for operator "notNull"', () => {
        const { getByTitle } = render(<ValueEditor {...props} operator="notNull" />);
        expect(() => getByTitle(title)).toThrow();
      });

      it('should call the onChange method passed in', () => {
        const onChange = jest.fn();
        const { getByTitle } = render(<ValueEditor {...props} handleOnChange={onChange} />);
        userEvent.type(findInput(getByTitle(title)), 'foo');
        expect(onChange).toHaveBeenCalledWith('foo');
      });

      it('should make the inputType "text" if operator is "between" or "notBetween"', () => {
        const { getByTitle } = render(
          <ValueEditor {...props} inputType="number" operator="between" />
        );
        expect(findInput(getByTitle(title)).getAttribute('type')).toBe('text');
      });

      it('should set the value to "" if operator is not "between" or "notBetween" and inputType is "number" and value contains a comma', () => {
        const handleOnChange = jest.fn();
        const { rerender } = render(
          <ValueEditor
            {...props}
            inputType="number"
            operator="between"
            value="12,14"
            handleOnChange={handleOnChange}
          />
        );
        rerender(
          <ValueEditor
            {...props}
            inputType="number"
            operator="notBetween"
            value="12,14"
            handleOnChange={handleOnChange}
          />
        );
        expect(handleOnChange).not.toHaveBeenCalledWith('');
        rerender(
          <ValueEditor
            {...props}
            inputType="number"
            operator="="
            value="12,14"
            handleOnChange={handleOnChange}
          />
        );
        expect(handleOnChange).toHaveBeenCalledWith('');
      });
    });

    describe('when rendering a select', () => {
      it('should render the correct number of options', () => {
        const { getByTitle } = render(
          <ValueEditor {...props} type="select" values={[{ name: 'test', label: 'Test' }]} />
        );
        expect(() => findSelect(getByTitle(title))).not.toThrow();
        expect(findSelect(getByTitle(title)).querySelectorAll('option')).toHaveLength(1);
      });

      it('should call the onChange method passed in', () => {
        const handleOnChange = jest.fn();
        const { getByTitle } = render(
          <ValueEditor
            {...props}
            type="select"
            handleOnChange={handleOnChange}
            values={[{ name: 'test', label: 'Test' }]}
          />
        );
        userEvent.selectOptions(findSelect(getByTitle(title)), 'test');
        expect(handleOnChange).toHaveBeenCalledWith('test');
      });

      it('should be disabled by the disabled prop', () => {
        const handleOnChange = jest.fn();
        const { getByTitle } = render(
          <ValueEditor
            {...props}
            type="select"
            handleOnChange={handleOnChange}
            values={[{ name: 'test', label: 'Test' }]}
            disabled
          />
        );
        userEvent.selectOptions(findSelect(getByTitle(title)), 'test');
        expect(handleOnChange).not.toHaveBeenCalled();
      });
    });

    describe('when rendering a checkbox', () => {
      it('should render the checkbox and react to changes', () => {
        const handleOnChange = jest.fn();
        const { getByTitle } = render(
          <ValueEditor {...props} type="checkbox" handleOnChange={handleOnChange} />
        );
        expect(() => findInput(getByTitle(title))).not.toThrow();
        expect(findInput(getByTitle(title)).getAttribute('type')).toBe('checkbox');
        userEvent.click(findInput(getByTitle(title)));
        expect(handleOnChange).toHaveBeenCalledWith(true);
      });

      it('should be disabled by the disabled prop', () => {
        const handleOnChange = jest.fn();
        const { getByTitle } = render(
          <ValueEditor {...props} type="checkbox" handleOnChange={handleOnChange} disabled />
        );
        userEvent.click(findInput(getByTitle(title)));
        expect(handleOnChange).not.toHaveBeenCalled();
      });
    });

    describe('when rendering a radio button set', () => {
      it('should render the radio buttons with labels', () => {
        const { getByTitle } = render(
          <ValueEditor {...props} type="radio" values={[{ name: 'test', label: 'Test' }]} />
        );
        expect(getByTitle(title).querySelectorAll('input')).toHaveLength(1);
        expect(getByTitle(title).querySelector('input[type="radio"]')!.getAttribute('type')).toBe(
          'radio'
        );
      });

      it('should call the onChange handler', () => {
        const handleOnChange = jest.fn();
        const { getByTitle } = render(
          <ValueEditor
            {...props}
            type="radio"
            handleOnChange={handleOnChange}
            values={[{ name: 'test', label: 'Test' }]}
          />
        );
        userEvent.click(getByTitle(title).querySelector('input[type="radio"]')!);
        expect(handleOnChange).toHaveBeenCalledWith('test');
      });

      it('should be disabled by the disabled prop', () => {
        const handleOnChange = jest.fn();
        const { getByTitle } = render(
          <ValueEditor
            {...props}
            type="radio"
            handleOnChange={handleOnChange}
            values={[{ name: 'test', label: 'Test' }]}
            disabled
          />
        );
        userEvent.click(getByTitle(title).querySelector('input[type="radio"]')!);
        expect(handleOnChange).not.toHaveBeenCalled();
      });
    });
  });
};
