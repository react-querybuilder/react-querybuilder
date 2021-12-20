import { render } from '@testing-library/react';
import type { DragHandleProps } from 'react-querybuilder';

export const testDragHandle = (
  DragHandle: React.ForwardRefExoticComponent<
    DragHandleProps & React.RefAttributes<HTMLSpanElement>
  >
) => {
  const componentName = DragHandle.displayName ?? 'DragHandle';

  const props: DragHandleProps = {
    title: componentName,
    level: 1,
    path: [0],
  };

  describe(componentName, () => {
    it('should have the className passed into the <span />', () => {
      const { getByTitle } = render(<DragHandle {...props} className="foo" />);
      expect(getByTitle(componentName).classList).toContain('foo');
    });
  });
};
