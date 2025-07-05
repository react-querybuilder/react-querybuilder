/// <reference types="@testing-library/jest-native" />

import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as React from 'react';
import { Button, Platform, StyleSheet, Switch, TextInput } from 'react-native';
import type {
  ActionWithRulesProps,
  Field,
  FullField,
  Option,
  RuleGroupType,
  Schema,
  ShiftActionsProps,
} from 'react-querybuilder';
import { TestID, convertToIC, toFullOption } from 'react-querybuilder';
import type {
  ActionNativeProps,
  NotToggleNativeProps,
  SchemaNative,
  ValueEditorNativeProps,
  ValueSelectorNativeProps,
} from '../types';
import { NativeActionElement } from './NativeActionElement';
import { NativeMatchModeEditorWeb } from './NativeMatchModeEditorWeb';
import { NativeNotToggle } from './NativeNotToggle';
import { NativeShiftActions } from './NativeShiftActions';
import { NativeValueEditor } from './NativeValueEditor';
import { NativeValueEditorWeb } from './NativeValueEditorWeb';
import { NativeValueSelector } from './NativeValueSelector';
import { NativeValueSelectorWeb } from './NativeValueSelectorWeb';
import { QueryBuilderNative } from './QueryBuilderNative';

jest.setTimeout(30_000);

const query: RuleGroupType = {
  combinator: 'and',
  rules: [
    { id: '1', field: 'f1', operator: '=', value: 'v1' },
    { id: '2', field: 'f2', operator: '=', value: 'v2' },
  ],
};
const queryIC = convertToIC(query);

beforeEach(() => {
  Platform.OS = 'ios';
});

describe('QueryBuilderNative', () => {
  it('renders with rules', () => {
    render(<QueryBuilderNative query={query} />);
    expect(screen.getByTestId(TestID.ruleGroup)).toBeOnTheScreen();
    expect(screen.getByTestId(TestID.combinators)).toBeOnTheScreen();
    expect(() => screen.getByTestId(TestID.inlineCombinator)).toThrow();
    expect(screen.getAllByTestId(TestID.valueEditor)[0]).toBeOnTheScreen();
    expect(screen.getAllByTestId(TestID.valueEditor)[1]).toBeOnTheScreen();
  });

  it('renders with inline combinators', () => {
    render(<QueryBuilderNative query={query} showCombinatorsBetweenRules />);
    expect(screen.getByTestId(TestID.ruleGroup)).toBeOnTheScreen();
    expect(screen.getByTestId(TestID.inlineCombinator)).toBeOnTheScreen();
  });

  it('renders with independent combinators', () => {
    render(<QueryBuilderNative query={queryIC} />);
    expect(screen.getByTestId(TestID.ruleGroup)).toBeOnTheScreen();
    expect(screen.getByTestId(TestID.inlineCombinator)).toBeOnTheScreen();
  });
});

describe('NativeMatchModeEditor', () => {
  const fields: Field[] = [{ name: 'tourDates', label: 'Tour dates', matchModes: true }];

  it('renders match mode editor', () => {
    render(<QueryBuilderNative fields={fields} addRuleToNewGroups />);
    expect(screen.getByDisplayValue('all')).toBeOnTheScreen();
    fireEvent.changeText(screen.getByDisplayValue('all'), 'atLeast');
    expect(screen.getByDisplayValue('1')).toBeOnTheScreen();
  });

  it('renders on web platform', () => {
    Platform.OS = 'web';
    render(
      <QueryBuilderNative
        fields={fields}
        addRuleToNewGroups
        controlElements={{ matchModeEditor: NativeMatchModeEditorWeb }}
      />
    );
    expect(screen.getByDisplayValue('all')).toBeOnTheScreen();
  });
});

describe('NativeActionElement', () => {
  const dt: ActionNativeProps['disabledTranslation'] = { label: 'Unlock', title: 'Unlock' };
  const defaultActionElementProps: ActionNativeProps = {
    handleOnClick: () => {},
    className: '',
    level: 0,
    path: [],
    ruleOrGroup: { combinator: 'and', rules: [] },
    // We don't use `basicSchema` here because we can't import
    // from "@react-querybuilder/testing".
    schema: {} as Schema<FullField, string>,
  };

  const title = 'NativeActionElement';
  const testID = title;
  const props = { ...defaultActionElementProps, title, testID };

  const testEnabledAndOnClick = ({
    testTitle,
    ...additionalProps
  }: Partial<ActionWithRulesProps> & { testTitle?: string } = {}) => {
    it(testTitle ?? 'should be enabled and call the handleOnClick method', async () => {
      const handleOnPress = jest.fn();
      render(<NativeActionElement {...props} handleOnClick={handleOnPress} {...additionalProps} />);
      const btn = screen.getByTestId(testID);
      expect(btn).toBeEnabled();
      fireEvent.press(btn);
      expect(handleOnPress).toHaveBeenCalledTimes(1);
    });
  };

  it('has the label passed into the <button />', () => {
    const testLabel = 'Test label';
    render(<NativeActionElement {...props} label={testLabel} />);
    expect(screen.getByTestId(testID)).toHaveTextContent(testLabel);
  });

  testEnabledAndOnClick();

  testEnabledAndOnClick({
    testTitle: 'should not be affected by disabledTranslation prop if not disabled',
    disabledTranslation: dt,
  });

  testEnabledAndOnClick({
    testTitle: 'should still render if disabledTranslation label is undefined',
    disabled: true,
    disabledTranslation: {},
  });

  testEnabledAndOnClick({
    testTitle: 'should not be disabled by disabled prop if disabledTranslation is present',
    disabled: true,
    disabledTranslation: dt,
  });

  it('is disabled by disabled prop', () => {
    const handleOnPress = jest.fn();
    render(<NativeActionElement {...props} handleOnClick={handleOnPress} disabled />);
    const btn = screen.getByTestId(testID);
    expect(btn).toBeDisabled();
    fireEvent.press(btn);
    expect(handleOnPress).not.toHaveBeenCalled();
  });
});

describe('NativeNotToggle', () => {
  const props: NotToggleNativeProps = {
    checked: false,
    handleOnChange: () => {},
    label: 'NativeNotToggle',
    level: 0,
    path: [],
    // We don't use `basicSchema` here because we can't import
    // from "@react-querybuilder/testing".
    schema: {} as Schema<FullField, string>,
    testID: TestID.notToggle,
    ruleGroup: { combinator: 'and', rules: [] },
  };

  it('works', () => {
    const handleOnChange = jest.fn();
    render(<NativeNotToggle {...props} handleOnChange={handleOnChange} />);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const switchEl = screen.getByTestId(TestID.notToggle).findByType(Switch as any);
    fireEvent(switchEl, 'valueChange', true);
    expect(handleOnChange).toHaveBeenNthCalledWith(1, true);
    fireEvent(switchEl, 'valueChange', false);
    expect(handleOnChange).toHaveBeenNthCalledWith(2, false);
  });
});

describe('NativeShiftActions', () => {
  const shiftUp = jest.fn();
  const shiftDown = jest.fn();

  afterEach(() => {
    shiftUp.mockClear();
    shiftDown.mockClear();
  });

  const labels = { shiftUp: 'up', shiftDown: 'down' } as const;

  const defaultProps: ShiftActionsProps = {
    level: 0,
    path: [1],
    ruleOrGroup: { combinator: 'and', rules: [] },
    labels,
    testID: TestID.shiftActions,
    // We don't use `basicSchema` here because we can't import
    // from "@react-querybuilder/testing".
    schema: {} as Schema<FullField, string>,
    disabled: false,
    shiftUpDisabled: false,
    shiftDownDisabled: false,
  };

  it('works', async () => {
    // const disabledProps: ShiftActionsProps = {
    //   ...defaultProps,
    //   disabled: true,
    //   shiftUp,
    //   shiftDown,
    // };

    // // Fully disabled
    // const { rerender } = render(<NativeShiftActions {...disabledProps} />);
    // const btnUp = screen.getByLabelText(labels.shiftUp);
    // const btnDown = screen.getByLabelText(labels.shiftDown);
    // for (const btn of [btnUp, btnDown]) {
    //   expect(btn).toBeDisabled();
    //   fireEvent.press(btn);
    //   expect(shiftUp).not.toHaveBeenCalled();
    //   expect(shiftDown).not.toHaveBeenCalled();
    // }

    // // Up disabled
    // const upDisabledProps = {
    //   ...defaultProps,
    //   shiftUp,
    //   shiftDown,
    //   shiftUpDisabled: true,
    // };
    // rerender(<NativeShiftActions {...upDisabledProps} />);
    // const btnsUpDisabledProps = screen.getByTestId(TestID.shiftActions).findAllByType(Button);
    // await act(() => {
    //   fireEvent.press(btnsUpDisabledProps[0]);
    //   expect(shiftUp).not.toHaveBeenCalled();
    // });

    // // Down disabled
    // const downDisabledProps = {
    //   ...defaultProps,
    //   shiftUp,
    //   shiftDown,
    //   shiftDownDisabled: true,
    // };
    // rerender(<NativeShiftActions {...downDisabledProps} />);
    // const btnsDownDisabledProps = screen.getByTestId(TestID.shiftActions).findAllByType(Button);
    // await act(() => {
    //   fireEvent.press(btnsDownDisabledProps[1]);
    //   expect(shiftDown).not.toHaveBeenCalled();
    // });

    // Enabled
    const enabledProps = { ...defaultProps, shiftUp, shiftDown };
    render(<NativeShiftActions {...enabledProps} />);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const btnsEnabled = screen.getByTestId(TestID.shiftActions).findAllByType(Button as any);
    act(() => {
      fireEvent.press(btnsEnabled[0]);
    });
    expect(shiftUp).toHaveBeenCalled();
    act(() => {
      fireEvent.press(btnsEnabled[1]);
    });
    expect(shiftDown).toHaveBeenCalled();
  });
});

describe('NativeValueSelector', () => {
  const handleOnChange = jest.fn();
  const styles = StyleSheet.create({
    combinatorSelector: { height: 100 },
    combinatorOption: { height: 101 },
    fieldSelector: { height: 102 },
    fieldOption: { height: 103 },
    operatorSelector: { height: 104 },
    operatorOption: { height: 105 },
    valueSourceSelector: { height: 106 },
    valueSourceOption: { height: 107 },
    valueEditorSelector: { height: 108 },
    valueEditorOption: { height: 109 },
  });
  const props: ValueSelectorNativeProps = {
    options: [
      { name: 'opt1', label: 'Option 1' },
      { name: 'opt2', label: 'Option 2' },
    ].map(o => toFullOption(o)),
    value: 'opt1',
    handleOnChange,
    level: 0,
    path: [],
    schema: { styles } as SchemaNative<FullField, string>,
  };

  const variants = [
    ['fakeTestID', 32, 216],
    [TestID.combinators, styles.combinatorSelector.height, styles.combinatorOption.height],
    [TestID.fields, styles.fieldSelector.height, styles.fieldOption.height],
    [TestID.operators, styles.operatorSelector.height, styles.operatorOption.height],
    [
      TestID.valueSourceSelector,
      styles.valueSourceSelector.height,
      styles.valueSourceOption.height,
    ],
    [TestID.valueEditor, styles.valueEditorSelector.height, styles.valueEditorOption.height],
  ] as const;

  beforeEach(() => {
    handleOnChange.mockClear();
  });

  describe('ios', () => {
    for (const [testID, selHeight, _optHeight] of variants) {
      it(`works for testID ${testID}`, () => {
        render(<NativeValueSelector {...props} testID={testID} />);
        expect(screen.getByTestId(testID)).toHaveStyle({ height: selHeight });
        // TODO: If we ever implement a proper picker by default, test the option styles...
        // expect(screen.getByTestId(testID).findAllByType(Picker.Item)[0]).toHaveStyle({
        //   height: _optHeight,
        // });
        fireEvent.changeText(screen.getByTestId(testID), 'opt2');
        expect(handleOnChange).toHaveBeenNthCalledWith(1, 'opt2');
      });
    }
  });

  it('renders on web platform', () => {
    Platform.OS = 'web';
    render(<NativeValueSelectorWeb {...props} testID={TestID.combinators} />);
    expect(screen.getByTestId(TestID.combinators)).toBeOnTheScreen();
  });
});

describe('NativeValueEditor', () => {
  const handleOnChange = jest.fn();
  const values: Option[] = [
    { name: 'opt1', label: 'Option 1' },
    { name: 'opt2', label: 'Option 2' },
  ];
  const props: ValueEditorNativeProps = {
    field: 'f1',
    operator: '=',
    valueSource: 'value',
    fieldData: toFullOption({ name: 'f1', label: 'f1', placeholder: TestID.valueEditor }),
    handleOnChange,
    path: [],
    level: 0,
    // We don't use `basicSchema` here because we can't import
    // from "@react-querybuilder/testing".
    schema: {
      controls: { valueSelector: NativeValueSelector },
    } as Schema<FullField, string>,
    testID: TestID.valueEditor,
    rule: { field: '', operator: '', value: '' },
  };

  beforeEach(() => {
    handleOnChange.mockClear();
  });

  it('displays nothing for "null"/"notNull" operator', () => {
    render(<NativeValueEditor {...props} operator="null" />);
    expect(() => screen.getByTestId(TestID.valueEditor)).toThrow();
  });

  for (const t of [undefined, 'text', 'textarea'] as const) {
    it(`changes the value of ${t} input type`, () => {
      render(<NativeValueEditor {...props} type={t} />);
      fireEvent.changeText(screen.getByTestId(TestID.valueEditor), 'val');
      expect(handleOnChange).toHaveBeenNthCalledWith(1, 'val');
    });
  }

  for (const t of ['select', 'multiselect'] as const) {
    it(`changes the value of ${t} input type`, () => {
      render(<NativeValueEditor {...props} type={t} values={values} />);
      fireEvent.changeText(screen.getByTestId(TestID.valueEditor), 'opt2');
      expect(handleOnChange).toHaveBeenNthCalledWith(1, 'opt2');
    });
  }

  for (const t of ['switch', 'checkbox'] as const) {
    it(`changes the value of ${t}`, () => {
      render(<NativeValueEditor {...props} type={t} value={false} />);
      fireEvent(screen.getByTestId(TestID.valueEditor), 'valueChange', true);
      expect(handleOnChange).toHaveBeenNthCalledWith(1, true);
    });
  }

  it('changes the value of each text input', () => {
    render(<NativeValueEditor {...props} operator="between" type="text" />);
    fireEvent.changeText(screen.getAllByPlaceholderText(TestID.valueEditor)[0], 'val');
    fireEvent.changeText(screen.getAllByPlaceholderText(TestID.valueEditor)[1], 'val');
    expect(handleOnChange).toHaveBeenNthCalledWith(1, 'val,');
    expect(handleOnChange).toHaveBeenNthCalledWith(2, ',val');
  });

  it('renders the first option when none is provided for "between"', () => {
    render(
      <NativeValueEditor
        {...props}
        operator="between"
        type="select"
        values={values}
        value={[null, null]}
      />
    );
    const selectors = screen.getByTestId(TestID.valueEditor).findAllByType(NativeValueSelector);
    expect(selectors[0].props).toHaveProperty('value', 'opt1');
    expect(selectors[1].props).toHaveProperty('value', 'opt1');
  });

  it('changes the value of each select', () => {
    render(
      <NativeValueEditor
        {...props}
        operator="between"
        type="select"
        values={values}
        value={'opt1,opt1'}
      />
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selectors = screen.getByTestId(TestID.valueEditor).findAllByType(TextInput as any);
    for (const i of [0, 1]) {
      fireEvent.changeText(selectors[i], 'opt2');
    }
    expect(handleOnChange).toHaveBeenNthCalledWith(1, 'opt2,opt1');
    expect(handleOnChange).toHaveBeenNthCalledWith(2, 'opt1,opt2');
  });

  it('renders on web platform', () => {
    Platform.OS = 'web';
    render(<NativeValueEditorWeb {...props} />);
    expect(screen.getByTestId(TestID.valueEditor)).toBeOnTheScreen();
  });
});
