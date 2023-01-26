import type { ActionWithRulesProps, Schema } from '@react-querybuilder/ts';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { RuleGroupType } from 'react-querybuilder';
import { TestID } from 'react-querybuilder';
import { QueryBuilderNative } from '../QueryBuilderNative';
import { NativeActionElement } from './NativeActionElement';

const query: RuleGroupType = {
  combinator: 'and',
  rules: [{ field: 'f1', operator: '=', value: 'v1' }],
};

it('renders with a rule', () => {
  render(<QueryBuilderNative query={query} />);
  expect(screen.getByTestId(TestID.ruleGroup)).toBeDefined();
});

describe('NativeActionElement', () => {
  const dt: ActionWithRulesProps['disabledTranslation'] = { label: 'Unlock', title: 'Unlock' };
  const defaultActionElementProps: ActionWithRulesProps = {
    handleOnClick: () => {},
    className: '',
    level: 0,
    path: [],
    ruleOrGroup: { combinator: 'and', rules: [] },
    schema: {} as Schema,
  };

  const title = NativeActionElement.displayName;
  const props = { ...defaultActionElementProps, title };

  const testEnabledAndOnClick = ({
    testTitle,
    ...additionalProps
  }: Partial<ActionWithRulesProps> & { testTitle?: string } = {}) => {
    it(testTitle ?? 'should be enabled and call the handleOnClick method', async () => {
      const handleOnPress = jest.fn();
      render(<NativeActionElement {...props} handleOnClick={handleOnPress} {...additionalProps} />);
      const btn = screen.getByRole('button');
      expect(btn).toBeEnabled();
      fireEvent.press(btn);
      expect(handleOnPress).toHaveBeenCalled();
    });
  };

  it('should have the label passed into the <button />', () => {
    const testLabel = 'Test label';
    render(<NativeActionElement {...props} label={testLabel} />);
    expect(screen.getByRole('button')).toHaveTextContent(testLabel);
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
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    fireEvent.press(btn);
    expect(handleOnPress).not.toHaveBeenCalled();
  });
});
