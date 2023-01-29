import type { NotToggleProps, Schema } from '@react-querybuilder/ts';
import { render, screen } from '@testing-library/react';
import { findInput, hasOrInheritsClass, isOrInheritsChecked, userEventSetup } from './utils';

export const defaultNotToggleProps: NotToggleProps = {
  handleOnChange: () => {},
  level: 0,
  path: [],
  schema: {} as Schema,
};

export const testNotToggle = (NotToggle: React.ComponentType<NotToggleProps>) => {
  const user = userEventSetup();
  const title = NotToggle.displayName ?? 'NotToggle';
  const label = 'Not';
  const props = { ...defaultNotToggleProps, label, title };

  describe(title, () => {
    it('should have the value passed into the <input />', () => {
      render(<NotToggle {...props} checked />);
      expect(isOrInheritsChecked(findInput(screen.getByLabelText(label)))).toBe(true);
    });

    it('should have the className passed into the <label />', () => {
      render(<NotToggle {...props} className="foo" />);
      expect(hasOrInheritsClass(screen.getByLabelText(label), 'foo')).toBe(true);
    });

    it('should call the onChange method passed in', async () => {
      const onChange = jest.fn();
      render(<NotToggle {...props} handleOnChange={onChange} />);
      await user.click(screen.getByLabelText(label));
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('should be disabled by disabled prop', async () => {
      const onChange = jest.fn();
      render(<NotToggle {...props} handleOnChange={onChange} disabled />);
      const notToggle = screen.getByLabelText(label);
      expect(notToggle).toBeDisabled();
      await user.click(notToggle);
      expect(onChange).not.toHaveBeenCalled();
    });
  });
};
