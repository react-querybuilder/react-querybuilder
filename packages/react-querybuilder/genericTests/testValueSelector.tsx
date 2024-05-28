import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { toFullOption, toFullOptionList } from '../src';
import type { FullOption, ValueEditorProps, ValueSelectorProps } from '../src/types';
import { basicSchema, findSelect, hasOrInheritsClass, userEventSetup } from './utils';

type ValueSelectorTestsToSkip = Partial<{
  multi: boolean;
  optgroup: boolean;
  disabledOptions: boolean;
}>;

export const defaultValueSelectorProps = {
  handleOnChange: () => {},
  options: [
    { name: 'foo', label: 'Foo' },
    { name: 'bar', label: 'Bar' },
    { name: 'baz', label: 'Baz' },
  ].map(o => toFullOption(o)),
  level: 0,
  path: [],
  schema: basicSchema,
} satisfies ValueSelectorProps;

export const testSelect = (
  title: string,
  Component: React.ComponentType<ValueEditorProps> | React.ComponentType<ValueSelectorProps>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any,
  skip: ValueSelectorTestsToSkip = {}
) => {
  const user = userEventSetup();
  const testValues = toFullOptionList(props.values ?? props.options) as FullOption[];
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

    if (!skip.optgroup) {
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
    }

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
      expect(hasOrInheritsClass(screen.getByTitle(title), 'foo')).toBe(true);
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

    if (!skip.disabledOptions) {
      it('should disable individual options', async () => {
        const onChange = jest.fn();
        const disabledOption = { name: 'disabled', label: 'Disabled', disabled: true };
        const newValues = [...testValues, disabledOption];
        const propsWithDisabledOption =
          'values' in props ? { ...props, values: newValues } : { ...props, options: newValues };
        render(<Component {...propsWithDisabledOption} handleOnChange={onChange} />);
        await user.selectOptions(findSelect(screen.getByTitle(title)), 'disabled');
        expect(onChange).not.toHaveBeenCalled();
      });
    }
  });
};

export const testValueSelector = (
  ValueSelector: React.ComponentType<ValueSelectorProps>,
  skip: ValueSelectorTestsToSkip = {}
) => {
  const title = ValueSelector.name ?? 'ValueSelector';
  const props = { ...defaultValueSelectorProps, title };

  testSelect(title, ValueSelector, props, skip);
};
