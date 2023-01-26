import type { ActionWithRulesProps, Schema } from '@react-querybuilder/ts';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet, Switch } from 'react-native';
import type { RuleGroupType } from 'react-querybuilder';
import { convertToIC, standardClassnames, TestID } from 'react-querybuilder';
import { QueryBuilderNative } from '../QueryBuilderNative';
import type {
  ActionNativeProps,
  NotToggleNativeProps,
  SchemaNative,
  ValueSelectorNativeProps,
} from '../types';
import { NativeActionElement } from './NativeActionElement';
import { NativeNotToggle } from './NativeNotToggle';
import { NativeValueSelector } from './NativeValueSelector';

const query: RuleGroupType = {
  combinator: 'and',
  rules: [
    { field: 'f1', operator: '=', value: 'v1' },
    { field: 'f2', operator: '=', value: 'v2' },
  ],
};
const queryIC = convertToIC(query);

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
    render(<QueryBuilderNative query={queryIC} independentCombinators />);
    expect(screen.getByTestId(TestID.ruleGroup)).toBeOnTheScreen();
    expect(screen.getByTestId(TestID.inlineCombinator)).toBeOnTheScreen();
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
    schema: {} as Schema,
  };

  const title = NativeActionElement.displayName;
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

  it('should have the label passed into the <button />', () => {
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

  it('should be disabled by disabled prop', () => {
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
    label: NativeNotToggle.displayName,
    level: 0,
    path: [],
    schema: {} as Schema,
    testID: TestID.notToggle,
  };

  it('works', () => {
    const handleOnChange = jest.fn();
    render(<NativeNotToggle {...props} handleOnChange={handleOnChange} />);
    const switchEl = screen.getByTestId(TestID.notToggle).findByType(Switch);
    fireEvent(switchEl, 'valueChange', true);
    expect(handleOnChange).toHaveBeenNthCalledWith(1, true);
    fireEvent(switchEl, 'valueChange', false);
    expect(handleOnChange).toHaveBeenNthCalledWith(2, false);
  });
});

describe('NativeValueSelector', () => {
  const handleOnChange = jest.fn();
  const styles = StyleSheet.create({
    combinatorSelector: { height: 0 },
    combinatorOption: { height: 1 },
    fieldSelector: { height: 2 },
    fieldOption: { height: 3 },
    operatorSelector: { height: 4 },
    operatorOption: { height: 5 },
    valueSourceSelector: { height: 6 },
    valueSourceOption: { height: 7 },
    valueEditorSelector: { height: 8 },
    valueEditorOption: { height: 9 },
  });
  const props: ValueSelectorNativeProps = {
    options: [
      { name: 'opt1', label: 'Option 1' },
      { name: 'opt2', label: 'Option 2' },
    ],
    handleOnChange,
    level: 0,
    path: [],
    schema: { styles } as SchemaNative,
  };

  const variants = [
    ['', 'fakeTestID', 30, 216],
    [
      standardClassnames.combinators,
      TestID.combinators,
      styles.combinatorSelector.height,
      styles.combinatorOption.height,
    ],
    [
      standardClassnames.fields,
      TestID.fields,
      styles.fieldSelector.height,
      styles.fieldOption.height,
    ],
    [
      standardClassnames.operators,
      TestID.operators,
      styles.operatorSelector.height,
      styles.operatorOption.height,
    ],
    [
      standardClassnames.valueSource,
      TestID.valueSourceSelector,
      styles.valueSourceSelector.height,
      styles.valueSourceOption.height,
    ],
    [
      standardClassnames.value,
      TestID.valueEditor,
      styles.valueEditorSelector.height,
      styles.valueEditorOption.height,
    ],
  ] as const;

  for (const [className, testID, _selHeight, optHeight] of variants) {
    it(`gets the correct styles (${className})`, () => {
      render(<NativeValueSelector {...props} testID={testID} className={className || undefined} />);
      // TODO: Test with web/other platform? iOS hides the selector and only shows the first option?
      // expect(screen.getByTestId(testID)).toHaveStyle({ padding: _selHeight });
      // expect(screen.getByTestId(testID).findAllByType(Picker.Item)[0]).toHaveStyle({
      //   padding: optPadding,
      // });
      expect(screen.getAllByTestId(testID)[0]).toHaveStyle({ height: optHeight });
      // expect(screen.getAllByTestId(testID)[1]).toHaveStyle({ padding: optPadding });
      fireEvent(screen.getByTestId(testID), 'valueChange', 'opt2');
    });
  }
});
