import { render } from '@testing-library/react';
import type { ActionWithRulesProps } from '../src/types';
import { userEventSetup } from './utils';

export const defaultActionElementProps: ActionWithRulesProps = {
  handleOnClick: () => {},
  className: '',
  level: 0,
  path: [],
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
      const { getByTitle } = render(
        <ActionElement {...props} handleOnClick={handleOnClick} {...additionalProps} />
      );
      const btn = getByTitle(testTitle);
      expect(btn).toBeEnabled();
      await user.click(btn);
      expect(handleOnClick).toHaveBeenCalled();
    });
  };

  describe(title, () => {
    it('should have the label passed into the <button />', () => {
      const testLabel = 'Test label';
      const { container } = render(<ActionElement {...props} label={testLabel} />);
      expect(container).toHaveTextContent(testLabel);
    });

    it('should have the className passed into the <button />', () => {
      const testClass = 'test-class';
      const { getByTitle } = render(<ActionElement {...props} className={testClass} />);
      expect(getByTitle(title)).toHaveClass(testClass);
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
      const { getByTitle } = render(
        <ActionElement {...props} handleOnClick={handleOnClick} disabled />
      );
      const btn = getByTitle(title);
      expect(btn).toBeDisabled();
      await user.click(btn);
      expect(handleOnClick).not.toHaveBeenCalled();
    });
  });
};
