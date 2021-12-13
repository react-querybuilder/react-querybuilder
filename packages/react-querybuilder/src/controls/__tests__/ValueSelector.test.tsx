import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ValueSelectorProps } from '../../types';
import ValueSelector from '../ValueSelector';

describe('<ValueSelector />', () => {
  const props: ValueSelectorProps = {
    handleOnChange: () => {},
    title: 'ValueSelector',
    options: [
      { name: 'foo', label: 'foo label' },
      { name: 'bar', label: 'bar label' }
    ],
    level: 0,
    path: []
  };

  it('should have the options passed into the <select />', () => {
    const { getByTitle } = render(<ValueSelector {...props} />);
    expect(getByTitle('ValueSelector').querySelectorAll('option')).toHaveLength(2);
  });

  it('should have the value passed into the <select />', () => {
    const { getByTitle } = render(<ValueSelector {...props} value="foo" />);
    expect((getByTitle('ValueSelector') as HTMLSelectElement).value).toBe('foo');
  });

  it('should have the className passed into the <select />', () => {
    const { getByTitle } = render(<ValueSelector {...props} className="foo" />);
    expect(getByTitle('ValueSelector').classList).toContain('foo');
  });

  it('should call the onChange method passed in', () => {
    const onChange = jest.fn();
    const { getByTitle } = render(<ValueSelector {...props} handleOnChange={onChange} />);
    userEvent.selectOptions(getByTitle('ValueSelector'), 'foo');
    expect(onChange).toHaveBeenCalled();
  });

  it('should be disabled by the disabled prop', () => {
    const onChange = jest.fn();
    const { getByTitle } = render(<ValueSelector {...props} handleOnChange={onChange} disabled />);
    userEvent.selectOptions(getByTitle('ValueSelector'), 'foo');
    expect(onChange).not.toHaveBeenCalled();
  });
});
