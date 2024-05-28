import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { TestID } from '../src/defaults';
import type { DragHandleProps } from '../src/types';
import { basicSchema } from './utils';

export const defaultDragHandleProps = {
  level: 1,
  path: [0],
  schema: basicSchema,
  ruleOrGroup: { combinator: 'and', rules: [] },
} satisfies DragHandleProps;

export const testDragHandle = (
  DragHandle: React.ForwardRefExoticComponent<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    DragHandleProps & React.RefAttributes<any>
  >
) => {
  const title = DragHandle.name ?? 'DragHandle';
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
