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
