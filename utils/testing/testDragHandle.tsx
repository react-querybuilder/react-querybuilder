import { render, screen } from '@testing-library/react';
import * as React from 'react';
import type { DragHandleProps } from 'react-querybuilder';
import { TestID } from 'react-querybuilder';
import { basicSchema } from './utils';

export const defaultDragHandleProps: DragHandleProps = {
  level: 1,
  path: [0],
  schema: basicSchema,
  ruleOrGroup: { combinator: 'and', rules: [] },
};

export const testDragHandle = (
  DragHandle: React.ForwardRefExoticComponent<
    // oxlint-disable-next-line typescript/no-explicit-any
    DragHandleProps & React.RefAttributes<any>
  >
): void => {
  const title = DragHandle.displayName ?? DragHandle.name ?? 'DragHandle';
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
