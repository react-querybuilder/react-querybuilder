import type { DragHandleProps } from '@react-querybuilder/ts';
import { render, screen } from '@testing-library/react';

export const defaultDragHandleProps: DragHandleProps = {
  level: 1,
  path: [0],
};

export const testDragHandle = (
  DragHandle: React.ForwardRefExoticComponent<DragHandleProps & React.RefAttributes<any>>
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
