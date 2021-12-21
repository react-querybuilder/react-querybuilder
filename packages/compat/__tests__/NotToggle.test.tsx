import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { NotToggleProps } from 'react-querybuilder';
import { findInput, hasOrInheritsClass, isOrInheritsChecked } from './utils';

const defaultProps: NotToggleProps = {
  handleOnChange: () => {},
  level: 0,
  path: [],
};

export const testNotToggle = (NotToggle: React.ComponentType<NotToggleProps>) => {
  const title = NotToggle.displayName ?? 'NotToggle';
  const label = 'Not';
  const props = { ...defaultProps, label, title };

  describe(title, () => {
    it('should have the value passed into the <input />', () => {
      const { getByLabelText } = render(<NotToggle {...props} checked />);
      isOrInheritsChecked(findInput(getByLabelText(label)));
    });

    it('should have the className passed into the <label />', () => {
      const { getByLabelText } = render(<NotToggle {...props} className="foo" />);
      expect(hasOrInheritsClass(getByLabelText(label), 'foo')).toBe(true);
    });

    it('should call the onChange method passed in', () => {
      const onChange = jest.fn();
      const { getByLabelText } = render(<NotToggle {...props} handleOnChange={onChange} />);
      userEvent.click(getByLabelText(label));
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('should be disabled by disabled prop', () => {
      const onChange = jest.fn();
      const { getByLabelText } = render(
        <NotToggle {...props} handleOnChange={onChange} disabled />
      );
      userEvent.click(getByLabelText(label));
      expect(onChange).not.toHaveBeenCalled();
    });
  });
};
