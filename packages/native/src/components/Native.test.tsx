import { act, fireEvent, render, screen, within } from '@testing-library/react-native';
import * as React from 'react';
import { Platform, StyleSheet } from 'react-native';
import type {
  ActionProps,
  Field,
  FullField,
  Option,
  RuleGroupType,
  Schema,
  ShiftActionsProps,
} from 'react-querybuilder';
import { TestID, convertToIC, toFullOption } from 'react-querybuilder';
import { QueryBuilderHistory } from 'react-querybuilder/history';
import type {
  ActionNativeProps,
  NotToggleNativeProps,
  SchemaNative,
  ValueEditorNativeProps,
  ValueSelectorNativeProps,
} from '../types';
import { defaultNativeWebControlElements } from './defaults';
import { NativeActionElement } from './NativeActionElement';
import { NativeMatchModeEditorWeb } from './NativeMatchModeEditorWeb';
import { NativeNotToggle } from './NativeNotToggle';
import { NativeShiftActions } from './NativeShiftActions';
import { NativeValueEditor } from './NativeValueEditor';
import { NativeValueEditorWeb } from './NativeValueEditorWeb';
import { NativeValueSelector } from './NativeValueSelector';
import { NativeValueSelectorWeb } from './NativeValueSelectorWeb';
import { QueryBuilderNative } from './QueryBuilderNative';

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
  it('renders with rules', async () => {
    await render(<QueryBuilderNative query={query} />);
    expect(screen.getByTestId(TestID.ruleGroup)).toBeOnTheScreen();
    expect(screen.getByTestId(TestID.combinators)).toBeOnTheScreen();
    expect(() => screen.getByTestId(TestID.inlineCombinator)).toThrow();
    expect(screen.getAllByTestId(TestID.valueEditor)[0]).toBeOnTheScreen();
    expect(screen.getAllByTestId(TestID.valueEditor)[1]).toBeOnTheScreen();
  });

  it('renders with inline combinators', async () => {
    await render(<QueryBuilderNative query={query} showCombinatorsBetweenRules />);
    expect(screen.getByTestId(TestID.ruleGroup)).toBeOnTheScreen();
    expect(screen.getByTestId(TestID.inlineCombinator)).toBeOnTheScreen();
  });

  it('renders with independent combinators', async () => {
    await render(<QueryBuilderNative query={queryIC} />);
    expect(screen.getByTestId(TestID.ruleGroup)).toBeOnTheScreen();
    expect(screen.getByTestId(TestID.inlineCombinator)).toBeOnTheScreen();
  });

  it('does not render undo/redo actions unless showUndoRedo is set', async () => {
    await render(<QueryBuilderNative qbId="native-no-show" defaultQuery={query} />);
    expect(() => screen.getByTestId(TestID.undoRedoActions)).toThrow();
  });

  it('renders working undo/redo actions without a history provider', async () => {
    await render(
      <QueryBuilderNative qbId="native-no-provider" defaultQuery={query} showUndoRedo />
    );
    const undoRedoActions = screen.getByTestId(TestID.undoRedoActions);
    expect(undoRedoActions).toBeOnTheScreen();

    const undoBtn = within(undoRedoActions).getByTestId(TestID.undoAction);
    expect(undoBtn).toBeDisabled();
    await act(async () => {
      await fireEvent.press(screen.getByTestId(TestID.addGroup));
    });
    expect(screen.getAllByTestId(TestID.ruleGroup)).toHaveLength(2);
    await act(async () => {
      await fireEvent.press(undoBtn);
    });
    expect(screen.getAllByTestId(TestID.ruleGroup)).toHaveLength(1);
  });

  it('renders undo/redo actions when the web preset is used', async () => {
    await render(
      <QueryBuilderHistory>
        <QueryBuilderNative
          qbId="native-web-preset"
          defaultQuery={query}
          controlElements={defaultNativeWebControlElements}
        />
      </QueryBuilderHistory>
    );
    const undoRedoActions = screen.getByTestId(TestID.undoRedoActions);
    expect(within(undoRedoActions).getByTestId(TestID.undoAction)).toBeOnTheScreen();
    expect(within(undoRedoActions).getByTestId(TestID.redoAction)).toBeOnTheScreen();
  });

  it('honors an explicit undoRedoActions opt-out', async () => {
    await render(
      <QueryBuilderHistory>
        <QueryBuilderNative
          qbId="native-opt-out"
          defaultQuery={query}
          controlElements={{ undoRedoActions: null }}
        />
      </QueryBuilderHistory>
    );
    expect(() => screen.getByTestId(TestID.undoRedoActions)).toThrow();
  });

  it('labels the undo/redo actions for accessibility', async () => {
    await render(
      <QueryBuilderHistory>
        <QueryBuilderNative qbId="native-a11y" defaultQuery={query} />
      </QueryBuilderHistory>
    );
    const undoRedoActions = screen.getByTestId(TestID.undoRedoActions);
    const undoBtn = within(undoRedoActions).getByTestId(TestID.undoAction);
    const redoBtn = within(undoRedoActions).getByTestId(TestID.redoAction);
    expect(undoBtn).toHaveProp('accessibilityRole', 'button');
    expect(undoBtn).toHaveAccessibleName('Undo');
    expect(redoBtn).toHaveProp('accessibilityRole', 'button');
    expect(redoBtn).toHaveAccessibleName('Redo');
  });

  it('applies the undoRedoActions style', async () => {
    await render(
      <QueryBuilderHistory>
        <QueryBuilderNative
          qbId="native-styles"
          defaultQuery={query}
          styles={{ undoRedoActions: { gap: 8 } }}
        />
      </QueryBuilderHistory>
    );
    expect(screen.getByTestId(TestID.undoRedoActions)).toHaveStyle({ gap: 8 });
  });

  it('renders with undo/redo actions', async () => {
    // First make sure the undo/redo actions are not rendered when `showUndoRedo` is false
    const { rerender } = await render(
      <QueryBuilderHistory showUndoRedo={false}>
        <QueryBuilderNative qbId="native-history" defaultQuery={query} />
      </QueryBuilderHistory>
    );
    expect(() => screen.getByTestId(TestID.undoRedoActions)).toThrow();

    // `showUndoRedo` defaults to true beneath `QueryBuilderHistory`
    await rerender(
      <QueryBuilderHistory>
        <QueryBuilderNative qbId="native-history" defaultQuery={query} />
      </QueryBuilderHistory>
    );
    const undoRedoActions = screen.getByTestId(TestID.undoRedoActions);
    expect(undoRedoActions).toBeOnTheScreen();

    const undoBtn = within(undoRedoActions).getByTestId(TestID.undoAction);
    const redoBtn = within(undoRedoActions).getByTestId(TestID.redoAction);
    await act(async () => {
      await fireEvent.press(screen.getByTestId(TestID.addGroup));
    });
    expect(undoBtn).toBeEnabled();
    expect(screen.getAllByTestId(TestID.ruleGroup)).toHaveLength(2);
    await act(async () => {
      await fireEvent.press(undoBtn);
    });
    expect(screen.getAllByTestId(TestID.ruleGroup)).toHaveLength(1);
    await act(async () => {
      await fireEvent.press(redoBtn);
    });
    expect(screen.getAllByTestId(TestID.ruleGroup)).toHaveLength(2);
  });
});

describe('NativeMatchModeEditor', () => {
  const fields: Field[] = [{ name: 'tourDates', label: 'Tour dates', matchModes: true }];

  it('renders match mode editor', async () => {
    await render(<QueryBuilderNative fields={fields} addRuleToNewGroups />);
    expect(screen.getByDisplayValue('all')).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByDisplayValue('all'), 'atLeast');
    expect(screen.getByDisplayValue('1')).toBeOnTheScreen();
  });

  it('renders on web platform', async () => {
    Platform.OS = 'web';
    await render(
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
  }: Partial<ActionProps> & { testTitle?: string } = {}) => {
    it(testTitle ?? 'should be enabled and call the handleOnClick method', async () => {
      const handleOnPress = vi.fn();
      await render(
        <NativeActionElement {...props} handleOnClick={handleOnPress} {...additionalProps} />
      );
      const btn = screen.getByTestId(testID);
      expect(btn).toBeEnabled();
      await fireEvent.press(btn);
      expect(handleOnPress).toHaveBeenCalledTimes(1);
    });
  };

  it('has the label passed into the <button />', async () => {
    const testLabel = 'Test label';
    await render(<NativeActionElement {...props} label={testLabel} />);
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

  it('is disabled by disabled prop', async () => {
    const handleOnPress = vi.fn();
    await render(<NativeActionElement {...props} handleOnClick={handleOnPress} disabled />);
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

  it('works', async () => {
    const handleOnChange = vi.fn();
    await render(<NativeNotToggle {...props} handleOnChange={handleOnChange} />);
    const switchEl = screen.getByTestId(TestID.notToggle).queryAll(() => true)[1];
    await fireEvent(switchEl, 'valueChange', true);
    expect(handleOnChange).toHaveBeenNthCalledWith(1, true);
    await fireEvent(switchEl, 'valueChange', false);
    expect(handleOnChange).toHaveBeenNthCalledWith(2, false);
  });
});

describe('NativeShiftActions', () => {
  const shiftUp = vi.fn();
  const shiftDown = vi.fn();

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
    shiftUp: () => {},
    shiftDown: () => {},
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
    await render(<NativeShiftActions {...enabledProps} />);
    const btnsEnabled = screen.getByTestId(TestID.shiftActions);
    const shiftUpBtn = within(btnsEnabled).getByLabelText(labels.shiftUp);
    const shiftDownBtn = within(btnsEnabled).getByLabelText(labels.shiftDown);
    await act(async () => {
      await fireEvent.press(shiftUpBtn);
    });
    expect(shiftUp).toHaveBeenCalled();
    await act(async () => {
      await fireEvent.press(shiftDownBtn);
    });
    expect(shiftDown).toHaveBeenCalled();
  });
});

describe('NativeValueSelector', () => {
  const handleOnChange = vi.fn();
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
      it(`works for testID ${testID}`, async () => {
        await render(<NativeValueSelector {...props} testID={testID} />);
        expect(screen.getByTestId(testID)).toHaveStyle({ height: selHeight });
        // TODO: If we ever implement a proper picker by default, test the option styles...
        // expect(screen.getByTestId(testID).findAllByType(Picker.Item)[0]).toHaveStyle({
        //   height: _optHeight,
        // });
        await fireEvent.changeText(screen.getByTestId(testID), 'opt2');
        expect(handleOnChange).toHaveBeenNthCalledWith(1, 'opt2');
      });
    }
  });

  it('renders on web platform', async () => {
    Platform.OS = 'web';
    await render(<NativeValueSelectorWeb {...props} testID={TestID.combinators} />);
    expect(screen.getByTestId(TestID.combinators)).toBeOnTheScreen();
  });
});

describe('NativeValueEditor', () => {
  const handleOnChange = vi.fn();
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
    schema: { controls: { valueSelector: NativeValueSelector } } as Schema<FullField, string>,
    testID: TestID.valueEditor,
    rule: { field: '', operator: '', value: '' },
  };

  beforeEach(() => {
    handleOnChange.mockClear();
  });

  it('displays nothing for "null"/"notNull" operator', async () => {
    await render(<NativeValueEditor {...props} operator="null" />);
    expect(() => screen.getByTestId(TestID.valueEditor)).toThrow();
  });

  for (const t of [undefined, 'text', 'textarea'] as const) {
    it(`changes the value of ${t} input type`, async () => {
      await render(<NativeValueEditor {...props} type={t} />);
      await fireEvent.changeText(screen.getByTestId(TestID.valueEditor), 'val');
      expect(handleOnChange).toHaveBeenNthCalledWith(1, 'val');
    });
  }

  for (const t of ['select', 'multiselect'] as const) {
    it(`changes the value of ${t} input type`, async () => {
      await render(<NativeValueEditor {...props} type={t} values={values} />);
      await fireEvent.changeText(screen.getByTestId(TestID.valueEditor), 'opt2');
      expect(handleOnChange).toHaveBeenNthCalledWith(1, 'opt2');
    });
  }

  for (const t of ['switch', 'checkbox'] as const) {
    it(`changes the value of ${t}`, async () => {
      await render(<NativeValueEditor {...props} type={t} value={false} />);
      await fireEvent(screen.getByTestId(TestID.valueEditor), 'valueChange', true);
      expect(handleOnChange).toHaveBeenNthCalledWith(1, true);
    });
  }

  it('changes the value of each text input', async () => {
    await render(<NativeValueEditor {...props} operator="between" type="text" />);
    await fireEvent.changeText(screen.getAllByPlaceholderText(TestID.valueEditor)[0], 'val');
    await fireEvent.changeText(screen.getAllByPlaceholderText(TestID.valueEditor)[1], 'val');
    expect(handleOnChange).toHaveBeenNthCalledWith(1, 'val,');
    expect(handleOnChange).toHaveBeenNthCalledWith(2, ',val');
  });

  it('renders the first option when none is provided for "between"', async () => {
    await render(
      <NativeValueEditor
        {...props}
        operator="between"
        type="select"
        values={values}
        value={[null, null]}
      />
    );
    const selectors = screen.getByTestId(TestID.valueEditor).queryAll(() => true);
    expect(selectors[0].props).toHaveProperty('value', 'opt1');
    expect(selectors[1].props).toHaveProperty('value', 'opt1');
  });

  it('changes the value of each select', async () => {
    await render(
      <NativeValueEditor
        {...props}
        operator="between"
        type="select"
        values={values}
        value={'opt1,opt1'}
      />
    );
    const selectors = screen.getByTestId(TestID.valueEditor).queryAll(() => true);
    for (const i of [0, 1]) {
      await fireEvent.changeText(selectors[i], 'opt2');
    }
    expect(handleOnChange).toHaveBeenNthCalledWith(1, 'opt2,opt1');
    expect(handleOnChange).toHaveBeenNthCalledWith(2, 'opt1,opt2');
  });

  it('renders on web platform', async () => {
    Platform.OS = 'web';
    await render(<NativeValueEditorWeb {...props} />);
    expect(screen.getByTestId(TestID.valueEditor)).toBeOnTheScreen();
  });
});

describe('accessibility', () => {
  const emptySchema = {} as Schema<FullField, string>;

  describe('NativeActionElement', () => {
    const title = 'Add rule';
    const props: ActionNativeProps = {
      handleOnClick: () => {},
      className: '',
      level: 0,
      path: [],
      ruleOrGroup: { combinator: 'and', rules: [] },
      schema: emptySchema,
      testID: TestID.addRule,
      title,
    };

    it('exposes button role and accessible name', async () => {
      await render(<NativeActionElement {...props} />);
      const btn = screen.getByTestId(TestID.addRule);
      expect(btn).toHaveProp('accessibilityRole', 'button');
      expect(btn).toHaveAccessibleName(title);
      expect(btn).toBeEnabled();
    });

    it('reports disabled state', async () => {
      await render(<NativeActionElement {...props} disabled />);
      expect(screen.getByTestId(TestID.addRule)).toBeDisabled();
    });

    it('does not report disabled state when disabledTranslation is present', async () => {
      await render(
        <NativeActionElement {...props} disabled disabledTranslation={{ label: 'Unlock' }} />
      );
      expect(screen.getByTestId(TestID.addRule)).toBeEnabled();
    });
  });

  describe('NativeNotToggle', () => {
    const title = 'Invert this group';
    const props: NotToggleNativeProps = {
      checked: false,
      handleOnChange: () => {},
      label: 'Not',
      level: 0,
      path: [],
      schema: emptySchema,
      testID: TestID.notToggle,
      ruleGroup: { combinator: 'and', rules: [] },
      title,
    };

    it('exposes switch role and accessible name', async () => {
      await render(<NativeNotToggle {...props} />);
      const switchEl = screen.getByLabelText(title);
      expect(switchEl).toHaveProp('accessibilityRole', 'switch');
      expect(switchEl).toBeEnabled();
    });

    it('reports disabled state', async () => {
      await render(<NativeNotToggle {...props} disabled />);
      expect(screen.getByLabelText(title)).toBeDisabled();
    });
  });

  describe('NativeShiftActions', () => {
    const props: ShiftActionsProps = {
      level: 0,
      path: [1],
      ruleOrGroup: { combinator: 'and', rules: [] },
      testID: TestID.shiftActions,
      schema: emptySchema,
      shiftUp: () => {},
      shiftDown: () => {},
      shiftUpDisabled: false,
      shiftDownDisabled: false,
    };

    it('labels each button', async () => {
      await render(<NativeShiftActions {...props} labels={{ shiftUp: 'up', shiftDown: 'down' }} />);
      expect(screen.getByLabelText('up')).toBeOnTheScreen();
      expect(screen.getByLabelText('down')).toBeOnTheScreen();
    });

    it('falls back to empty labels', async () => {
      await render(<NativeShiftActions {...props} />);
      const buttons = screen
        .getByTestId(TestID.shiftActions)
        .queryAll(n => n.props.accessibilityRole === 'button');
      expect(buttons).toHaveLength(2);
      for (const btn of buttons) {
        expect(btn).toHaveProp('accessibilityLabel', '');
      }
    });
  });

  describe('NativeValueSelector', () => {
    const title = 'Operators';
    const props: ValueSelectorNativeProps = {
      options: [toFullOption({ name: 'opt1', label: 'Option 1' })],
      value: 'opt1',
      handleOnChange: () => {},
      level: 0,
      path: [],
      schema: { styles: {} } as SchemaNative<FullField, string>,
      testID: TestID.operators,
      title,
    };

    it('exposes combobox role and accessible name', async () => {
      await render(<NativeValueSelector {...props} />);
      const sel = screen.getByTestId(TestID.operators);
      expect(sel).toHaveProp('accessibilityRole', 'combobox');
      expect(sel).toHaveAccessibleName(title);
      expect(sel).toHaveProp('editable', true);
      expect(sel).toBeEnabled();
    });

    it('is non-editable and disabled when disabled', async () => {
      await render(<NativeValueSelector {...props} disabled />);
      const sel = screen.getByTestId(TestID.operators);
      expect(sel).toHaveProp('editable', false);
      expect(sel).toBeDisabled();
    });
  });

  describe('NativeValueEditor', () => {
    const title = 'Value';
    const values: Option[] = [
      { name: 'opt1', label: 'Option 1' },
      { name: 'opt2', label: 'Option 2' },
    ];
    const props: ValueEditorNativeProps = {
      field: 'f1',
      operator: '=',
      valueSource: 'value',
      fieldData: toFullOption({ name: 'f1', label: 'f1' }),
      handleOnChange: () => {},
      path: [],
      level: 0,
      schema: { controls: { valueSelector: NativeValueSelector } } as Schema<FullField, string>,
      testID: TestID.valueEditor,
      rule: { field: '', operator: '', value: '' },
      title,
    };

    for (const type of [undefined, 'textarea'] as const) {
      it(`labels the ${type ?? 'default'} text input`, async () => {
        const { rerender } = await render(<NativeValueEditor {...props} type={type} />);
        const input = screen.getByTestId(TestID.valueEditor);
        expect(input).toHaveAccessibleName(title);
        expect(input).toHaveProp('editable', true);
        expect(input).toBeEnabled();

        await rerender(<NativeValueEditor {...props} type={type} disabled />);
        const disabledInput = screen.getByTestId(TestID.valueEditor);
        expect(disabledInput).toHaveProp('editable', false);
        expect(disabledInput).toBeDisabled();
      });
    }

    for (const type of ['switch', 'checkbox'] as const) {
      it(`labels the ${type}`, async () => {
        const { rerender } = await render(
          <NativeValueEditor {...props} type={type} value={false} />
        );
        const switchEl = screen.getByTestId(TestID.valueEditor);
        expect(switchEl).toHaveProp('accessibilityRole', 'switch');
        expect(switchEl).toHaveAccessibleName(title);
        expect(switchEl).toBeEnabled();

        await rerender(<NativeValueEditor {...props} type={type} value={false} disabled />);
        expect(screen.getByTestId(TestID.valueEditor)).toBeDisabled();
      });
    }

    it('labels select/multiselect through the selector component', async () => {
      await render(<NativeValueEditor {...props} type="select" values={values} />);
      expect(screen.getByTestId(TestID.valueEditor)).toHaveAccessibleName(title);
    });

    it('distinguishes the "between" text inputs', async () => {
      await render(<NativeValueEditor {...props} operator="between" type="text" />);
      expect(screen.getByLabelText(`${title} (from)`)).toHaveProp('editable', true);
      expect(screen.getByLabelText(`${title} (to)`)).toHaveProp('editable', true);
    });

    it('disables the "between" text inputs', async () => {
      await render(<NativeValueEditor {...props} operator="between" type="text" disabled />);
      for (const key of ['from', 'to']) {
        const input = screen.getByLabelText(`${title} (${key})`);
        expect(input).toHaveProp('editable', false);
        expect(input).toBeDisabled();
      }
    });

    it('falls back to bare from/to labels when title is absent', async () => {
      await render(
        <NativeValueEditor {...props} title={undefined} operator="between" type="text" />
      );
      expect(screen.getByLabelText('from')).toBeOnTheScreen();
      expect(screen.getByLabelText('to')).toBeOnTheScreen();
    });

    it('distinguishes the "between" selectors', async () => {
      await render(
        <NativeValueEditor {...props} operator="between" type="select" values={values} />
      );
      expect(screen.getByLabelText(`${title} (from)`)).toBeOnTheScreen();
      expect(screen.getByLabelText(`${title} (to)`)).toBeOnTheScreen();
    });
  });

  describe('RuleGroupNative', () => {
    it('exposes group role and accessible description', async () => {
      await render(<QueryBuilderNative query={query} />);
      const group = screen.getByTestId(TestID.ruleGroup);
      expect(group).toHaveProp('role', 'group');
      expect(group).toHaveAccessibleName('Query builder');
    });

    it('describes nested groups by path', async () => {
      await render(
        <QueryBuilderNative
          query={{ combinator: 'and', rules: [{ combinator: 'or', rules: [] }] }}
        />
      );
      const groups = screen.getAllByTestId(TestID.ruleGroup);
      expect(groups[1]).toHaveAccessibleName('Rule group at path 0');
    });
  });
});
