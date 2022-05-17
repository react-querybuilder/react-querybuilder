import { render } from '@testing-library/react';
import type { NotToggleProps } from '../src/types';
import { findInput, hasOrInheritsClass, isOrInheritsChecked, userEventSetup } from './utils';

export const defaultNotToggleProps: NotToggleProps = {
  handleOnChange: () => {},
  level: 0,
  path: [],
};

export const testNotToggle = (NotToggle: React.ComponentType<NotToggleProps>) => {
  const user = userEventSetup();
  const title = NotToggle.displayName ?? 'NotToggle';
  const label = 'Not';
  const props = { ...defaultNotToggleProps, label, title };

  describe(title, () => {
    it('should have the value passed into the <input />', () => {
      const { getByLabelText } = render(<NotToggle {...props} checked />);
      expect(isOrInheritsChecked(findInput(getByLabelText(label)))).toBe(true);
    });

    it('should have the className passed into the <label />', () => {
      const { getByLabelText } = render(<NotToggle {...props} className="foo" />);
      expect(hasOrInheritsClass(getByLabelText(label), 'foo')).toBe(true);
    });

    it('should call the onChange method passed in', async () => {
      const onChange = jest.fn();
      const { getByLabelText } = render(<NotToggle {...props} handleOnChange={onChange} />);
      await user.click(getByLabelText(label));
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('should be disabled by disabled prop', async () => {
      const onChange = jest.fn();
      const { getByLabelText } = render(
        <NotToggle {...props} handleOnChange={onChange} disabled />
      );
      const notToggle = getByLabelText(label);
      expect(notToggle).toBeDisabled();
      await user.click(notToggle);
      expect(onChange).not.toHaveBeenCalled();
    });
  });
};
