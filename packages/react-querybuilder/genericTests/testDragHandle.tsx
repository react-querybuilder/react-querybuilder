import { render, screen } from '@testing-library/react';
import type { DragHandleProps } from '../src/types';

export const defaultDragHandleProps: DragHandleProps = {
  level: 1,
  path: [0],
};

export const testDragHandle = (
  DragHandle: React.ForwardRefExoticComponent<
    DragHandleProps & React.RefAttributes<HTMLSpanElement>
  >
) => {
  const title = DragHandle.displayName ?? 'DragHandle';
  const props = { ...defaultDragHandleProps, title };

  describe(title, () => {
    it('should have the className passed into the <span />', () => {
      render(<DragHandle {...props} className="foo" />);
      expect(screen.getByTitle(title)).toHaveClass('foo');
    });
  });
};
