import { act, render, screen } from '@testing-library/react';
import * as React from 'react';
import { TestID, defaultCombinators } from '../src';
import type { Field, RuleType, Schema, ShiftActionsProps, ToFullOption } from '../src/types';
import { userEventSetup } from './utils';

const labels = { shiftUp: 'shiftUp', shiftDown: 'shiftDown' } as const;
const r1 = { field: 'f1', operator: '=', value: 'v1' } satisfies RuleType;
const r2 = { field: 'f2', operator: '=', value: 'v2' } satisfies RuleType;

// export const defaultShiftActionsProps = {
//   className: '',
//   level: 0,
//   path: [1],
//   ruleOrGroup: { combinator: 'and', rules: [] },
//   schema: {} as Schema<ToFullOption<Field>, string>
// } satisfies ShiftActionsProps;
export const defaultShiftActionsProps: ShiftActionsProps = {
  level: 0,
  path: [0],
  lastInGroup: true,
  ruleOrGroup: { combinator: 'and', rules: [r1, r2] },
  labels,
  testID: TestID.shiftActions,
  schema: {} as Schema<ToFullOption<Field>, string>,
};

export const testShiftActions = (ShiftActions: React.ComponentType<ShiftActionsProps>) => {
  const user = userEventSetup();
  const title = ShiftActions.displayName ?? 'ShiftActions';
  // const props = { ...defaultShiftActionsProps, title };

  const testEnabledAndOnClick = ({
    testTitle,
    ...additionalProps
  }: Partial<ShiftActionsProps> & { testTitle?: string } = {}) => {
    const dispatchQuery = jest.fn();

    afterEach(() => {
      dispatchQuery.mockClear();
    });

    it(testTitle ?? 'works', async () => {
      const disabledProps: ShiftActionsProps = {
        ...defaultShiftActionsProps,
        schema: {
          combinators: defaultCombinators,
          dispatchQuery: dispatchQuery as (q: any) => void,
          getQuery: () => ({ combinator: 'and', rules: [{ combinator: 'and', rules: [r1, r2] }] }),
        } as Schema<ToFullOption<Field>, string>,
      };
      const { rerender } = render(<ShiftActions {...disabledProps} {...additionalProps} />);
      const btns = screen.getAllByRole('button');
      for (const btn of btns) {
        expect(btn).toBeDisabled();
        await user.click(btn);
        expect(dispatchQuery).not.toHaveBeenCalled();
      }
      const enabledProps = {
        ...disabledProps,
        lastInGroup: false,
        ruleOrGroup: r1,
        path: [1],
        schema: {
          ...disabledProps.schema,
          getQuery: () => ({ combinator: 'and', rules: [r2, r1, r2] }),
        },
      } as ShiftActionsProps;
      rerender(<ShiftActions {...enabledProps} {...additionalProps} />);
      const btnsEnabled = screen.getAllByRole('button');
      await act(async () => {
        // Move up
        await user.click(btnsEnabled[0]);
        expect(dispatchQuery).toHaveBeenNthCalledWith(1, {
          combinator: 'and',
          rules: [r1, r2, r2],
        });
      });
      await act(async () => {
        // Move down
        await user.click(btnsEnabled[1]);
        expect(dispatchQuery).toHaveBeenNthCalledWith(2, {
          combinator: 'and',
          rules: [r2, r2, r1],
        });
      });
    });
  };

  describe(title, () => {
    testEnabledAndOnClick();
  });
};
