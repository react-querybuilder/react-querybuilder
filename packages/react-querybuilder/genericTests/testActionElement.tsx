import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ActionWithRulesProps } from '../src/types';
import { errorMessageIsAboutPointerEventsNone } from './utils';

export const defaultActionElementProps: ActionWithRulesProps = {
  handleOnClick: () => {},
  className: '',
  level: 0,
  path: [],
};

export const testActionElement = (ActionElement: React.ComponentType<ActionWithRulesProps>) => {
  const user = userEvent.setup();
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
      expect(getByTitle(testTitle)).toBeEnabled();
      await user.click(getByTitle(testTitle));
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
      expect(getByTitle(title)).toBeDisabled();
      try {
        await user.click(getByTitle(title));
      } catch (e: any) {
        if (!errorMessageIsAboutPointerEventsNone(e)) {
          throw e;
        }
      }
      expect(handleOnClick).not.toHaveBeenCalled();
    });
  });
};
