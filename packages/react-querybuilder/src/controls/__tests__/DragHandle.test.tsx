import { render } from '@testing-library/react';
import DragHandle from '../DragHandle';
import type { DragHandleProps } from '../../types';

describe('<DragHandle />', () => {
  const props: DragHandleProps = {
    title: 'DragHandle',
    level: 1
  };

  it('should have the className passed into the <span />', () => {
    const { getByTitle } = render(<DragHandle {...props} className="foo" />);
    expect(getByTitle('DragHandle').className).toMatch(/\bfoo\b/);
  });
});
