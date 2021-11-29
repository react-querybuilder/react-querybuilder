import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ValueEditor from '../ValueEditor';
import type { ValueEditorProps } from '../../types';

describe('<ValueEditor />', () => {
  const props: ValueEditorProps = {
    title: 'ValueEditor',
    field: 'TEST',
    fieldData: { name: 'TEST', label: 'Test' },
    operator: '=',
    handleOnChange: () => {},
    level: 0
  };

  describe('when using default rendering', () => {
    it('should have the value passed into the <input />', () => {
      const { getByTitle } = render(<ValueEditor {...props} value="test" />);
      expect((getByTitle('ValueEditor') as HTMLInputElement).value).toBe('test');
    });

    it('should render nothing for operator "null"', () => {
      const { getByTitle } = render(<ValueEditor {...props} operator="null" />);
      expect(() => getByTitle('ValueEditor')).toThrow();
    });

    it('should render nothing for operator "notNull"', () => {
      const { getByTitle } = render(<ValueEditor {...props} operator="notNull" />);
      expect(() => getByTitle('ValueEditor')).toThrow();
    });

    it('should call the onChange method passed in', () => {
      const onChange = jest.fn();
      const { getByTitle } = render(<ValueEditor {...props} handleOnChange={onChange} />);
      userEvent.type(getByTitle('ValueEditor'), 'foo');
      expect(onChange).toHaveBeenCalledWith('foo');
    });

    it('should make the inputType "text" if operator is "between" or "notBetween"', () => {
      const { getByTitle } = render(
        <ValueEditor {...props} inputType="number" operator="between" />
      );
      expect(getByTitle('ValueEditor').attributes.getNamedItem('type').value).toBe('text');
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

      expect(getByTitle('ValueEditor').tagName).toBe('SELECT');

      expect(getByTitle('ValueEditor').querySelectorAll('option')).toHaveLength(1);
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

      userEvent.selectOptions(getByTitle('ValueEditor'), 'test');
      expect(handleOnChange).toHaveBeenCalledWith('test');
    });
  });

  describe('when rendering a checkbox', () => {
    it('should render the checkbox and react to changes', () => {
      const handleOnChange = jest.fn();
      const { getByTitle } = render(
        <ValueEditor {...props} type="checkbox" handleOnChange={handleOnChange} />
      );

      expect(getByTitle('ValueEditor').tagName).toBe('INPUT');
      expect(getByTitle('ValueEditor').attributes.getNamedItem('type').value).toBe('checkbox');

      userEvent.click(getByTitle('ValueEditor'));
      expect(handleOnChange).toHaveBeenCalledWith(true);
    });
  });

  describe('when rendering a radio button set', () => {
    it('should render the radio buttons with labels', () => {
      const { getByTitle } = render(
        <ValueEditor {...props} type="radio" values={[{ name: 'test', label: 'Test' }]} />
      );

      expect(getByTitle('ValueEditor').querySelectorAll('input')).toHaveLength(1);
      expect(
        getByTitle('ValueEditor')
          .querySelector('input[type="radio"]')
          .attributes.getNamedItem('type').value
      ).toBe('radio');
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

      userEvent.click(getByTitle('ValueEditor').querySelector('input[type="radio"]'));
      expect(handleOnChange).toHaveBeenCalledWith('test');
    });
  });
});
