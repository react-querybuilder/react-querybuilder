import { act, render, screen } from '@testing-library/react';
import * as React from 'react';
import { QueryBuilder, TestID, generateID } from 'react-querybuilder';
import {
  defaultValueSelectorProps,
  findInput,
  testActionElement,
  testNotToggle,
  testValueEditor,
  testValueSelector,
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
  multiselect: true,
  radio: true,
  between: true,
});
testValueSelector(BlueprintValueSelector, { multi: true });

it('renders with composition', () => {
  render(
    <QueryBuilderBlueprint>
      <QueryBuilder />
    </QueryBuilderBlueprint>
  );
  expect(screen.getByTestId(TestID.addRule)).toBeInTheDocument();
});

const user = userEventSetup();

// const testBlueprintSelect = (
//   title: string,
//   Component: React.ComponentType<ValueEditorProps> | React.ComponentType<ValueSelectorProps>,
//   props: any
// ) => {
//   const testValues: Option[] = props.values ?? props.options;
//   const testVal = testValues[1];

//   describe(title, () => {
//     it('should have the options passed into the <select />', () => {
//       render(<Component {...props} />);
//       expect(screen.getAllByRole('option')).toHaveLength(testValues.length);
//     });

//     it('should render the correct number of options', () => {
//       render(<Component {...props} />);
//       const select = findSelect(screen.getByRole('combobox'));
//       expect(select).toHaveLength(testValues.length);
//     });

//     it('should render optgroups', () => {
//       const optGroups = [
//         { label: 'Test Option Group', options: 'values' in props ? props.values : props.options },
//       ];
//       const newProps =
//         'values' in props ? { ...props, values: optGroups } : { ...props, options: optGroups };
//       render(<Component {...newProps} />);
//       expect(screen.getAllByRole('group')).toHaveLength(optGroups.length);
//       expect(screen.getAllByRole('option')).toHaveLength(testValues.length);
//     });

//     // Test as single-value selector
//     if (('values' in props && props.type !== 'multiselect') || 'options' in props) {
//       it('should have the value passed into the <select />', () => {
//         render(<Component {...props} value={testVal.name} />);
//         expect(screen.getByRole('combobox')).toHaveValue(testVal.name);
//       });
//     }

//     it('should have the className passed into the <select />', () => {
//       render(<Component {...props} className="foo" />);
//       expect(hasOrInheritsClass(screen.getByRole('combobox'), 'foo')).toBe(true);
//     });

//     it('should call the onChange method passed in', async () => {
//       const onChange = jest.fn();
//       render(<Component {...props} handleOnChange={onChange} />);
//       await user.selectOptions(screen.getByRole('combobox'), testVal.name);
//       expect(onChange).toHaveBeenCalledWith(testVal.name);
//     });

//     it('should be disabled by the disabled prop', async () => {
//       const onChange = jest.fn();
//       render(<Component {...props} handleOnChange={onChange} disabled />);
//       expect(screen.getByRole('combobox')).toBeDisabled();
//       await user.selectOptions(screen.getByRole('combobox'), testVal.name);
//       expect(onChange).not.toHaveBeenCalled();
//     });
//   });
// };

describe('BlueprintValueSelector as multiselect', () => {
  it('should have the values passed into the component', () => {
    const onChange = jest.fn();
    const value = defaultValueSelectorProps.options.map(v => v.name).join(',');
    render(
      <BlueprintValueSelector
        {...defaultValueSelectorProps}
        value={value}
        popoverProps={{ usePortal: false }}
        multiple
        handleOnChange={onChange}
      />
    );
    for (const lbl of defaultValueSelectorProps.options.map(o => o.label)) {
      expect(screen.getByText(lbl)).toBeInTheDocument();
    }
  });

  it.skip('should find no options', async () => {
    const onChange = jest.fn();
    render(
      <BlueprintValueSelector
        {...defaultValueSelectorProps}
        value={''}
        popoverProps={{ usePortal: false }}
        multiple
        handleOnChange={onChange}
      />
    );
    const select = screen.getByRole('combobox');
    await act(async () => {
      await user.click(select);
      await new Promise(r => setTimeout(r, 500));
      await user.type(select, generateID());
      await new Promise(r => setTimeout(r, 500));
    });
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it.skip('should call the handleOnChange callback properly', async () => {
    const onChange = jest.fn();
    const allOptionsExceptFirst = defaultValueSelectorProps.options.slice(1);
    render(
      <BlueprintValueSelector
        {...defaultValueSelectorProps}
        multiple
        popoverProps={{ usePortal: false }}
        value={allOptionsExceptFirst.map(v => v.name) as any}
        handleOnChange={onChange}
      />
    );
    const select = screen.getByRole('combobox');
    await act(async () => {
      await user.click(select);
      await new Promise(r => setTimeout(r, 500));
      for (const v of allOptionsExceptFirst) {
        await user.click(screen.getByText(v.label));
        await new Promise(r => setTimeout(r, 500));
      }
      await user.click(document.body);
      await new Promise(r => setTimeout(r, 500));
    });
    expect(onChange).toHaveBeenCalledWith(allOptionsExceptFirst.map(v => v.name).join(','));
  });

  it('should respect the listsAsArrays option', async () => {
    const onChange = jest.fn();
    render(
      <BlueprintValueSelector
        {...defaultValueSelectorProps}
        multiple
        popoverProps={{ usePortal: false }}
        handleOnChange={onChange}
        listsAsArrays
        value={[] as any}
      />
    );
    const select = findInput(screen.getByRole('combobox'));
    await act(async () => {
      await user.click(select);
      await new Promise(r => setTimeout(r, 500));
      await user.type(select, defaultValueSelectorProps.options[0].label);
      await new Promise(r => setTimeout(r, 500));
      await user.click(screen.getByText(defaultValueSelectorProps.options[0].label));
      await new Promise(r => setTimeout(r, 500));
      await user.click(document.body);
      await new Promise(r => setTimeout(r, 500));
    });
    expect(onChange).toHaveBeenCalledWith([defaultValueSelectorProps.options[0].name]);
  });
});
