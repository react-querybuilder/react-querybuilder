import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { NotToggleProps } from '../src/types';
import {
  errorMessageIsAboutPointerEventsNone,
  findInput,
  hasOrInheritsClass,
  isOrInheritsChecked,
} from './utils';

export const defaultNotToggleProps: NotToggleProps = {
  handleOnChange: () => {},
  level: 0,
  path: [],
};

export const testNotToggle = (NotToggle: React.ComponentType<NotToggleProps>) => {
  const user = userEvent.setup();
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
      expect(getByLabelText(label)).toBeDisabled();
      try {
        await user.click(getByLabelText(label));
      } catch (e: any) {
        if (!errorMessageIsAboutPointerEventsNone(e)) {
          throw e;
        }
      }
      expect(onChange).not.toHaveBeenCalled();
    });
  });
};
