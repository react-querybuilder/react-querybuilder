import { render, screen } from '@testing-library/react';
import * as React from 'react';
import type { Option, ValueEditorProps, ValueSelectorProps } from 'react-querybuilder';
import { QueryBuilder, TestID } from 'react-querybuilder';
import {
  defaultValueEditorProps,
  defaultValueSelectorProps,
  findSelect,
  hasOrInheritsClass,
  testActionElement,
  testNotToggle,
  testValueEditor,
  userEventSetup,
} from 'react-querybuilder/genericTests';
import { BlueprintActionElement } from './BlueprintActionElement';
import { BlueprintNotToggle } from './BlueprintNotToggle';
import { BlueprintValueEditor } from './BlueprintValueEditor';
import { BlueprintValueSelector } from './BlueprintValueSelector';
import { QueryBuilderBlueprint } from './index';

testActionElement(BlueprintActionElement);
testNotToggle(BlueprintNotToggle);
testValueEditor(BlueprintValueEditor, {
  select: true,
  multiselect: true,
  radio: true,
  between: true,
});

it('renders with composition', () => {
  render(
    <QueryBuilderBlueprint>
      <QueryBuilder />
    </QueryBuilderBlueprint>
  );
  expect(screen.getByTestId(TestID.addRule)).toBeInTheDocument();
});

export const testBlueprintSelect = (
  title: string,
  Component: React.ComponentType<ValueEditorProps> | React.ComponentType<ValueSelectorProps>,
  props: any
) => {
  const user = userEventSetup();
  const testValues: Option[] = props.values ?? props.options;
  const testVal = testValues[1];

  describe(title, () => {
    it('should have the options passed into the <select />', () => {
      render(<Component {...props} />);
      expect(screen.getAllByRole('option')).toHaveLength(testValues.length);
    });

    it('should render the correct number of options', () => {
      render(<Component {...props} />);
      const select = findSelect(screen.getByRole('combobox'));
      expect(select).toHaveLength(testValues.length);
    });

    it('should render optgroups', () => {
      const optGroups = [
        { label: 'Test Option Group', options: 'values' in props ? props.values : props.options },
      ];
      const newProps =
        'values' in props ? { ...props, values: optGroups } : { ...props, options: optGroups };
      render(<Component {...newProps} />);
      expect(screen.getAllByRole('group')).toHaveLength(optGroups.length);
      expect(screen.getAllByRole('option')).toHaveLength(testValues.length);
    });

    // Test as multiselect for <ValueEditor type="multiselect" /> and <ValueSelector />
    if (('values' in props && props.type === 'multiselect') || 'options' in props) {
      it.skip('should have the values passed into the <select multiple />', () => {
        const onChange = jest.fn();
        const value = testValues.map(v => v.name).join(',');
        const multiselectProps = 'values' in props ? { type: 'multiselect' } : { multiple: true };
        render(
          <Component {...props} value={value} {...multiselectProps} handleOnChange={onChange} />
        );
        const select = screen.getByRole('combobox');
        expect(select).toHaveProperty('multiple', true);
        // expect(select.selectedOptions).toHaveLength(testValues.length);
      });

      it.skip('should call the handleOnChange callback properly for <select multiple />', async () => {
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
        const select = screen.getByRole('combobox');
        await user.selectOptions(select, allValuesExceptFirst);
        expect(onChange).toHaveBeenCalledWith(allValuesExceptFirst.join(','));
      });

      it.skip('should respect the listsAsArrays option', async () => {
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
        await user.selectOptions(screen.getByTitle(title), testVal.name);
        expect(onChange).toHaveBeenCalledWith([testVal.name]);
      });
    }

    // Test as single-value selector
    if (('values' in props && props.type !== 'multiselect') || 'options' in props) {
      it('should have the value passed into the <select />', () => {
        render(<Component {...props} value={testVal.name} />);
        expect(screen.getByRole('combobox')).toHaveValue(testVal.name);
      });
    }

    it('should have the className passed into the <select />', () => {
      render(<Component {...props} className="foo" />);
      expect(hasOrInheritsClass(screen.getByRole('combobox'), 'foo')).toBe(true);
    });

    it('should call the onChange method passed in', async () => {
      const onChange = jest.fn();
      render(<Component {...props} handleOnChange={onChange} />);
      await user.selectOptions(screen.getByRole('combobox'), testVal.name);
      expect(onChange).toHaveBeenCalledWith(testVal.name);
    });

    it('should be disabled by the disabled prop', async () => {
      const onChange = jest.fn();
      render(<Component {...props} handleOnChange={onChange} disabled />);
      expect(screen.getByRole('combobox')).toBeDisabled();
      await user.selectOptions(screen.getByRole('combobox'), testVal.name);
      expect(onChange).not.toHaveBeenCalled();
    });
  });
};

testBlueprintSelect('BlueprintValueSelector', BlueprintValueSelector, {
  ...defaultValueSelectorProps,
});
testBlueprintSelect('BlueprintValueEditor', BlueprintValueEditor, {
  ...defaultValueEditorProps,
  type: 'select',
  values: defaultValueSelectorProps.options,
});
