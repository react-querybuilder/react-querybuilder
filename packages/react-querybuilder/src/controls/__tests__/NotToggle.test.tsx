import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotToggle from '../NotToggle';
import type { NotToggleProps } from '../../types';

describe('<NotToggle />', () => {
  const props: NotToggleProps = {
    label: 'Not',
    title: 'NotToggle',
    handleOnChange: () => {},
    level: 0
  };

  it('should have the value passed into the <input />', () => {
    const { getByLabelText } = render(<NotToggle {...props} checked={true} />);
    expect((getByLabelText('Not') as HTMLInputElement).checked).toBe(true);
  });

  it('should have the className passed into the <label />', () => {
    const { getByLabelText } = render(<NotToggle {...props} className="foo" />);
    expect(getByLabelText('Not').parentElement.classList).toContain('foo');
  });

  it('should call the onChange method passed in', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(<NotToggle {...props} handleOnChange={onChange} />);
    userEvent.click(getByLabelText('Not'));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
