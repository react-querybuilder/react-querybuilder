import { render } from '@testing-library/react';
import type { DragHandleProps } from '../../types';
import DragHandle from '../DragHandle';

describe('<DragHandle />', () => {
  const props: DragHandleProps = {
    title: 'DragHandle',
    level: 1,
    path: [0]
  };

  it('should have the className passed into the <span />', () => {
    const { getByTitle } = render(<DragHandle {...props} className="foo" />);
    expect(getByTitle('DragHandle').classList).toContain('foo');
  });
});
