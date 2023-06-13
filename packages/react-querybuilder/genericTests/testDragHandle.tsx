import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { TestID } from '../src/defaults';
import type { DragHandleProps, Schema } from '../src/types/';

export const defaultDragHandleProps: DragHandleProps = {
  level: 1,
  path: [0],
  schema: {} as Schema,
  ruleOrGroup: { combinator: 'and', rules: [] },
};

export const testDragHandle = (
  DragHandle: React.ForwardRefExoticComponent<DragHandleProps & React.RefAttributes<any>>
) => {
  const title = DragHandle.displayName ?? 'DragHandle';
  const props = { ...defaultDragHandleProps, title };

  describe(title, () => {
    it('should not render if drag-and-drop is disabled', () => {
      render(<DragHandle {...props} className="foo" />);
      expect(() => screen.getByTestId(TestID.dragHandle)).toThrow();
    });

    it('should have the className passed into the <span />', () => {
      render(<DragHandle {...props} className="foo" />);
      expect(screen.getByTitle(title)).toHaveClass('foo');
    });
  });
};
