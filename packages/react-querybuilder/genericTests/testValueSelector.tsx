import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { NameLabelPair, ValueEditorProps, ValueSelectorProps } from '../src/types';
import { findSelect } from './utils';

export const defaultValueSelectorProps: ValueSelectorProps = {
  handleOnChange: () => {},
  options: [
    { name: 'foo', label: 'Foo' },
    { name: 'bar', label: 'Bar' },
  ],
  level: 0,
  path: [],
};

export const testSelect = (
  title: string,
  Component: React.ComponentType<ValueEditorProps> | React.ComponentType<ValueSelectorProps>,
  props: any
) => {
  const testValues: NameLabelPair[] = props.values ?? props.options;
  const testVal = testValues[1];

  describe(title, () => {
    it('should have the options passed into the <select />', () => {
      const { getByTitle } = render(<Component {...props} />);
      expect(getByTitle(title).querySelectorAll('option')).toHaveLength(2);
    });

    it('should render the correct number of options', () => {
      const { getByTitle } = render(<Component {...props} />);
      const getSelect = () => findSelect(getByTitle(title));
      expect(getSelect).not.toThrow();
      expect(getSelect().querySelectorAll('option')).toHaveLength(testValues.length);
    });

    it('should render optgroups', () => {
      const optGroups = [
        { label: 'Test Option Group', options: 'values' in props ? props.values : props.options },
      ];
      const newProps =
        'values' in props ? { ...props, values: optGroups } : { ...props, options: optGroups };
      const { getByTitle } = render(<Component {...newProps} />);
      const getSelect = () => findSelect(getByTitle(title));
      expect(getSelect).not.toThrow();
      expect(getSelect().querySelectorAll('optgroup')).toHaveLength(optGroups.length);
      expect(getSelect().querySelectorAll('option')).toHaveLength(testValues.length);
    });

    it('should have the value passed into the <select />', () => {
      const { getByTitle } = render(<Component {...props} value={testVal.name} />);
      expect(findSelect(getByTitle(title))).toHaveValue(testVal.name);
    });

    it('should have the className passed into the <select />', () => {
      const { getByTitle } = render(<Component {...props} className="foo" />);
      expect(getByTitle(title)).toHaveClass('foo');
    });

    it('should call the onChange method passed in', () => {
      const onChange = jest.fn();
      const { getByTitle } = render(<Component {...props} handleOnChange={onChange} />);
      userEvent.selectOptions(findSelect(getByTitle(title)), testVal.name);
      expect(onChange).toHaveBeenCalledWith(testVal.name);
    });

    it('should be disabled by the disabled prop', () => {
      const onChange = jest.fn();
      const { getByTitle } = render(<Component {...props} handleOnChange={onChange} disabled />);
      expect(findSelect(getByTitle(title))).toBeDisabled();
      userEvent.selectOptions(findSelect(getByTitle(title)), testVal.name);
      expect(onChange).not.toHaveBeenCalled();
    });
  });
};

export const testValueSelector = (ValueSelector: React.ComponentType<ValueSelectorProps>) => {
  const title = ValueSelector.displayName ?? 'ValueSelector';
  const props = { ...defaultValueSelectorProps, title };

  testSelect(title, ValueSelector, props);
};
