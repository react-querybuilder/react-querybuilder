import { render, screen } from '@testing-library/react';
import * as React from 'react';
import type { Option, ValueEditorProps, ValueSelectorProps } from 'react-querybuilder';
import { QueryBuilder, TestID, toFullOption } from 'react-querybuilder';
import {
  basicSchema,
  testActionElement,
  testDragHandle,
  testNotToggle,
  testShiftActions,
  testValueEditor,
  testValueSelector,
  userEventSetup,
} from '@rqb-testing';
import { FluentActionElement } from './FluentActionElement';
import { FluentDragHandle } from './FluentDragHandle';
import { FluentNotToggle } from './FluentNotToggle';
import { FluentShiftActions } from './FluentShiftActions';
import { FluentValueEditor } from './FluentValueEditor';
import { FluentValueSelector } from './FluentValueSelector';
import { QueryBuilderFluent } from './index';

const user = userEventSetup();

testActionElement(FluentActionElement);
testDragHandle(FluentDragHandle);
testNotToggle(FluentNotToggle);
testShiftActions(FluentShiftActions);
testValueEditor(FluentValueEditor, { multiselect: true });
testValueSelector(FluentValueSelector, { multi: true });

const defaultValueSelectorProps: ValueSelectorProps = {
  handleOnChange: () => {},
  options: [
    { name: 'foo', label: 'Foo' },
    { name: 'bar', label: 'Bar' },
    { name: 'baz', label: 'Baz' },
  ].map(o => toFullOption(o)),
  level: 0,
  path: [],
  schema: basicSchema,
};

const valueEditorAsMultiselectProps: ValueEditorProps = {
  field: 'TEST',
  fieldData: toFullOption({ name: 'TEST', label: 'Test' }),
  operator: '=',
  handleOnChange: () => {},
  level: 0,
  path: [],
  valueSource: 'value',
  schema: {
    ...basicSchema,
    controls: { ...basicSchema.controls, valueSelector: FluentValueSelector },
  },
  type: 'multiselect',
  values: defaultValueSelectorProps.options,
  rule: { field: '', operator: '', value: '' },
};

const testSelect = (
  title: string,
  Component: React.ComponentType<ValueEditorProps> | React.ComponentType<ValueSelectorProps>,
  // oxlint-disable-next-line typescript/no-explicit-any
  props: any
) => {
  const testValues: Option[] = props.values ?? props.options;
  const testVal = testValues[1];

  describe(title, () => {
    it('renders optgroups', async () => {
      const optGroups = [
        { label: 'Test Option Group', options: 'values' in props ? props.values : props.options },
      ];
      const newProps =
        'values' in props ? { ...props, values: optGroups } : { ...props, options: optGroups };
      render(<Component {...newProps} multiple />);
      await user.click(screen.getByRole('combobox'));
      expect(screen.getByText(optGroups[0].label)).toBeInTheDocument();
    });

    it('has the values passed into the <select multiple />', async () => {
      const onChange = jest.fn();
      const value = testValues.map(v => v.name).join(',');
      const multiselectProps = 'values' in props ? { type: 'multiselect' } : { multiple: true };
      render(
        <Component {...props} value={value} {...multiselectProps} handleOnChange={onChange} />
      );
      const select = screen.getByRole('combobox');
      await user.click(select);
      for (const v of testValues) {
        expect(screen.getByText(v.label)).toBeInTheDocument();
      }
    });

    it('calls the handleOnChange callback properly for <select multiple />', async () => {
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
      await user.click(screen.getByRole('combobox'));
      for (const lbl of allValuesExceptFirst.map(
        n => testValues.find(tv => tv.name === n)!.label
      )) {
        await user.click(screen.getAllByText(lbl)[0]);
      }
      expect(onChange).toHaveBeenCalledWith(allValuesExceptFirst.join(','));
    });

    it('respects the listsAsArrays option', async () => {
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
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText(testVal.label));
      expect(onChange).toHaveBeenCalledWith([testVal.name]);
    });
  });
};

testSelect('FluentValueSelector as multiselect', FluentValueSelector, defaultValueSelectorProps);
testSelect('FluentValueEditor as multiselect', FluentValueEditor, valueEditorAsMultiselectProps);

it('renders with composition', () => {
  render(
    <QueryBuilderFluent>
      <QueryBuilder />
    </QueryBuilderFluent>
  );
  expect(screen.getByTestId(TestID.addRule)).toBeInTheDocument();
});
