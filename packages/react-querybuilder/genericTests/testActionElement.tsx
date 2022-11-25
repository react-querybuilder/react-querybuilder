import type { ActionWithRulesProps } from '@react-querybuilder/ts';
import { act, render, screen } from '@testing-library/react';
import { userEventSetup } from './utils';

export const defaultActionElementProps: ActionWithRulesProps = {
  handleOnClick: () => {},
  className: '',
  level: 0,
  path: [],
  ruleOrGroup: { combinator: 'and', rules: [] },
};

export const testActionElement = (ActionElement: React.ComponentType<ActionWithRulesProps>) => {
  const user = userEventSetup();
  const title = ActionElement.displayName ?? 'ActionElement';
  const props = { ...defaultActionElementProps, title };
  const dt: ActionWithRulesProps['disabledTranslation'] = { label: '🔒', title: 'Unlock' };

  const testEnabledAndOnClick = ({
    testTitle,
    ...additionalProps
  }: Partial<ActionWithRulesProps> & { testTitle?: string } = {}) => {
    it(testTitle ?? 'should be enabled and call the handleOnClick method', async () => {
      const testTitle =
        (additionalProps?.disabled && additionalProps?.disabledTranslation?.title) || title;
      const handleOnClick = jest.fn();
      render(<ActionElement {...props} handleOnClick={handleOnClick} {...additionalProps} />);
      const btn = screen.getByTitle(testTitle);
      expect(btn).toBeEnabled();
      await act(async () => {
        await user.click(btn);
      });
      expect(handleOnClick).toHaveBeenCalled();
    });
  };

  describe(title, () => {
    it('should have the label passed into the <button />', () => {
      const testLabel = 'Test label';
      render(<ActionElement {...props} label={testLabel} />);
      expect(screen.getByRole('button')).toHaveTextContent(testLabel);
    });

    it('should have the className passed into the <button />', () => {
      const testClass = 'test-class';
      render(<ActionElement {...props} className={testClass} />);
      expect(screen.getByTitle(title)).toHaveClass(testClass);
    });

    testEnabledAndOnClick();

    testEnabledAndOnClick({
      testTitle: 'should not be affected by disabledTranslation prop if not disabled',
      disabledTranslation: dt,
    });

    testEnabledAndOnClick({
      testTitle: 'should not be disabled by disabled prop if disabledTranslation is present',
      disabled: true,
      disabledTranslation: dt,
    });

    it('should be disabled by disabled prop', async () => {
      const handleOnClick = jest.fn();
      render(<ActionElement {...props} handleOnClick={handleOnClick} disabled />);
      const btn = screen.getByTitle(title);
      expect(btn).toBeDisabled();
      await user.click(btn);
      expect(handleOnClick).not.toHaveBeenCalled();
    });
  });
};
