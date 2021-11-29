import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActionElement from '../ActionElement';
import type { ActionProps } from '../../types';

describe('<ActionElement />', () => {
  const props: ActionProps = {
    title: 'ActionElement',
    handleOnClick: () => {},
    className: '',
    level: 0
  };

  it('should have the label passed into the <button />', () => {
    const { getByTitle } = render(<ActionElement {...props} label="test" />);
    expect(getByTitle('ActionElement').innerHTML).toBe('test');
  });

  it('should have the className passed into the <button />', () => {
    const { getByTitle } = render(<ActionElement {...props} className="my-css-class" />);
    expect(getByTitle('ActionElement').classList).toContain('my-css-class');
  });

  it('should call the onClick method passed in', () => {
    const onClick = jest.fn();
    const { getByTitle } = render(<ActionElement {...props} handleOnClick={onClick} />);
    userEvent.click(getByTitle('ActionElement'));
    expect(onClick).toHaveBeenCalled();
  });
});
