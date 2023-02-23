import type { Option, Schema, ValueEditorProps, ValueSelectorProps } from '@react-querybuilder/ts';
import { render, screen } from '@testing-library/react';
import { findSelect, userEventSetup } from './utils';

type ValueSelectorTestsToSkip = Partial<{
  multi: boolean;
  classOnParent: boolean;
}>;

export const defaultValueSelectorProps: ValueSelectorProps = {
  handleOnChange: () => {},
  options: [
    { name: 'foo', label: 'Foo' },
    { name: 'bar', label: 'Bar' },
    { name: 'baz', label: 'Baz' },
  ],
  level: 0,
  path: [],
  schema: {} as Schema,
};

export const testSelect = (
  title: string,
  Component: React.ComponentType<ValueEditorProps> | React.ComponentType<ValueSelectorProps>,
  props: any,
  skip: ValueSelectorTestsToSkip = {}
) => {
  const user = userEventSetup();
  const testValues: Option[] = props.values ?? props.options;
  const testVal = testValues[1];

  describe(title, () => {
    it('should have the options passed into the <select />', () => {
      render(<Component {...props} />);
      expect(screen.getByTitle(title).querySelectorAll('option')).toHaveLength(testValues.length);
    });

    it('should render the correct number of options', () => {
      render(<Component {...props} />);
      const getSelect = () => findSelect(screen.getByTitle(title));
      expect(getSelect).not.toThrow();
      expect(getSelect().querySelectorAll('option')).toHaveLength(testValues.length);
    });

    it('should render optgroups', () => {
      const optGroups = [
        { label: 'Test Option Group', options: 'values' in props ? props.values : props.options },
      ];
      const newProps =
        'values' in props ? { ...props, values: optGroups } : { ...props, options: optGroups };
      render(<Component {...newProps} />);
      const getSelect = () => findSelect(screen.getByTitle(title));
      expect(getSelect).not.toThrow();
      expect(getSelect().querySelectorAll('optgroup')).toHaveLength(optGroups.length);
      expect(getSelect().querySelectorAll('option')).toHaveLength(testValues.length);
    });

    // Test as multiselect for <ValueEditor type="multiselect" /> and <ValueSelector />
    if (
      !skip.multi &&
      (('values' in props && props.type === 'multiselect') || 'options' in props)
    ) {
      it('should have the values passed into the <select multiple />', () => {
        const onChange = jest.fn();
        const value = testValues.map(v => v.name).join(',');
        const multiselectProps = 'values' in props ? { type: 'multiselect' } : { multiple: true };
        render(
          <Component {...props} value={value} {...multiselectProps} handleOnChange={onChange} />
        );
        const select = findSelect(screen.getByTitle(title));
        expect(select).toHaveProperty('multiple', true);
        expect(select.selectedOptions).toHaveLength(testValues.length);
      });

      it('should call the handleOnChange callback properly for <select multiple />', async () => {
        const onChange = jest.fn();
        const multiselectProps = 'values' in props ? { type: 'multiselect' } : { multiple: true };
        const allValuesExceptFirst = testValues.slice(1, 3).map(v => v.name);
        render(
          <Component
            {...props}
            {...multiselectProps}
            value={allValuesExceptFirst[0]}
            handleOnChange={onChange}
          />
        );
        const select = findSelect(screen.getByTitle(title));
        await user.selectOptions(select, allValuesExceptFirst);
        expect(onChange).toHaveBeenCalledWith(allValuesExceptFirst.join(','));
      });

      it('should respect the listsAsArrays option', async () => {
        const onChange = jest.fn();
        const multiselectProps = 'values' in props ? { type: 'multiselect' } : { multiple: true };
        render(
          <Component
            {...props}
            {...multiselectProps}
            handleOnChange={onChange}
            listsAsArrays
            value={[]}
          />
        );
        await user.selectOptions(findSelect(screen.getByTitle(title)), testVal.name);
        expect(onChange).toHaveBeenCalledWith([testVal.name]);
      });
    }

    // Test as single-value selector
    if (('values' in props && props.type !== 'multiselect') || 'options' in props) {
      it('should have the value passed into the <select />', () => {
        render(<Component {...props} value={testVal.name} />);
        expect(findSelect(screen.getByTitle(title))).toHaveValue(testVal.name);
      });
    }

    it('should have the className passed into the <select />', () => {
      render(<Component {...props} className="foo" />);
      if (skip.classOnParent) {
        expect(screen.getByTitle(title).parentElement).toHaveClass('foo');
      } else {
        expect(screen.getByTitle(title)).toHaveClass('foo');
      }
    });

    it('should call the onChange method passed in', async () => {
      const onChange = jest.fn();
      render(<Component {...props} handleOnChange={onChange} />);
      await user.selectOptions(findSelect(screen.getByTitle(title)), testVal.name);
      expect(onChange).toHaveBeenCalledWith(testVal.name);
    });

    it('should be disabled by the disabled prop', async () => {
      const onChange = jest.fn();
      render(<Component {...props} handleOnChange={onChange} disabled />);
      expect(findSelect(screen.getByTitle(title))).toBeDisabled();
      await user.selectOptions(findSelect(screen.getByTitle(title)), testVal.name);
      expect(onChange).not.toHaveBeenCalled();
    });
  });
};

export const testValueSelector = (
  ValueSelector: React.ComponentType<ValueSelectorProps>,
  skip: ValueSelectorTestsToSkip = {}
) => {
  const title = ValueSelector.displayName ?? 'ValueSelector';
  const props = { ...defaultValueSelectorProps, title };

  testSelect(title, ValueSelector, props, skip);
};
