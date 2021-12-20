import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { NotToggleProps } from 'react-querybuilder';

export const testNotToggle = (NotToggle: React.ComponentType<NotToggleProps>) => {
  const componentName = NotToggle.displayName ?? 'NotToggle';
  const label = 'Not';

  describe(componentName, () => {
    const props: NotToggleProps = {
      label,
      title: componentName,
      handleOnChange: () => {},
      level: 0,
      path: [],
    };

    it('should have the value passed into the <input />', () => {
      const { getByLabelText } = render(<NotToggle {...props} checked={true} />);
      expect((getByLabelText(label) as HTMLInputElement).checked).toBe(true);
    });

    it('should have the className passed into the <label />', () => {
      const { getByLabelText } = render(<NotToggle {...props} className="foo" />);
      expect(getByLabelText(label).parentElement!.classList).toContain('foo');
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
