import { render } from '@testing-library/react';
import type { DragHandleProps } from 'react-querybuilder';

const defaultProps: DragHandleProps = {
  level: 1,
  path: [0],
};

export const testDragHandle = (
  DragHandle: React.ForwardRefExoticComponent<
    DragHandleProps & React.RefAttributes<HTMLSpanElement>
  >
) => {
  const title = DragHandle.displayName ?? 'DragHandle';
  const props = { ...defaultProps, title };

  describe(title, () => {
    it('should have the className passed into the <span />', () => {
      const { getByTitle } = render(<DragHandle {...props} className="foo" />);
      expect(getByTitle(title)).toHaveClass('foo');
    });
  });
};
