import { TestID } from '@react-querybuilder/core';
import { act, render, screen } from '@testing-library/react';
import * as React from 'react';
import type { RuleType, ShiftActionsProps } from 'react-querybuilder';
import { basicSchema, userEventSetup } from './utils';

const labels = { shiftUp: 'shiftUp', shiftDown: 'shiftDown' } as const;
const r1 = { field: 'f1', operator: '=', value: 'v1' } satisfies RuleType;
const r2 = { field: 'f2', operator: '=', value: 'v2' } satisfies RuleType;

export const defaultShiftActionsProps: ShiftActionsProps = {
  level: 0,
  path: [1],
  ruleOrGroup: { combinator: 'and', rules: [r1, r2] },
  labels,
  testID: TestID.shiftActions,
  schema: basicSchema,
  disabled: false,
  shiftUpDisabled: false,
  shiftDownDisabled: false,
};

export const testShiftActions = (ShiftActions: React.ComponentType<ShiftActionsProps>): void => {
  const user = userEventSetup();
  const title = ShiftActions.displayName ?? ShiftActions.name ?? 'ShiftActions';

  const testEnabledAndOnClick = ({
    testTitle,
    ...additionalProps
  }: Partial<ShiftActionsProps> & { testTitle?: string } = {}) => {
    const shiftUp = jest.fn();
    const shiftDown = jest.fn();

    afterEach(() => {
      shiftUp.mockClear();
      shiftDown.mockClear();
    });

    describe(testTitle ?? 'works', () => {
      const disabledProps: ShiftActionsProps = {
        ...defaultShiftActionsProps,
        disabled: true,
        shiftUp,
        shiftDown,
      };

      it('fully disabled', async () => {
        render(<ShiftActions {...disabledProps} {...additionalProps} />);
        const btns = screen.getAllByRole('button');
        for (const btn of btns) {
          expect(btn).toBeDisabled();
          await user.click(btn);
          expect(shiftUp).not.toHaveBeenCalled();
          expect(shiftDown).not.toHaveBeenCalled();
        }
      });

      it('up disabled', async () => {
        const upDisabledProps = {
          ...defaultShiftActionsProps,
          shiftUp,
          shiftDown,
          shiftUpDisabled: true,
        };
        render(<ShiftActions {...upDisabledProps} {...additionalProps} />);
        const btnsUpDisabledProps = screen.getAllByRole('button');
        await act(async () => {
          await user.click(btnsUpDisabledProps[0]);
        });
        expect(shiftUp).not.toHaveBeenCalled();
      });

      it('down disabled', async () => {
        const downDisabledProps = {
          ...defaultShiftActionsProps,
          shiftUp,
          shiftDown,
          shiftDownDisabled: true,
        };
        render(<ShiftActions {...downDisabledProps} {...additionalProps} />);
        const btnsDownDisabledProps = screen.getAllByRole('button');
        await act(async () => {
          await user.click(btnsDownDisabledProps[1]);
        });
        expect(shiftDown).not.toHaveBeenCalled();
      });

      it('enabled', async () => {
        const enabledProps = { ...defaultShiftActionsProps, shiftUp, shiftDown };
        render(<ShiftActions {...enabledProps} {...additionalProps} />);
        const btnsEnabled = screen.getAllByRole('button');
        await act(async () => {
          await user.click(btnsEnabled[0]);
        });
        expect(shiftUp).toHaveBeenCalled();
        await act(async () => {
          await user.click(btnsEnabled[1]);
        });
        expect(shiftDown).toHaveBeenCalled();
      });
    });
  };

  describe(title, () => {
    testEnabledAndOnClick();
  });
};
