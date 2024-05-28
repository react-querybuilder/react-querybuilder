import { render, screen } from '@testing-library/react';
import * as React from 'react';
import type { NotToggleProps } from '../src/types';
import {
  basicSchema,
  findInput,
  hasOrInheritsClass,
  isOrInheritsChecked,
  userEventSetup,
} from './utils';

export const defaultNotToggleProps = {
  handleOnChange: () => {},
  level: 0,
  path: [],
  schema: basicSchema,
  ruleGroup: { combinator: 'and', rules: [] },
} satisfies NotToggleProps;

export const testNotToggle = (NotToggle: React.ComponentType<NotToggleProps>) => {
  const user = userEventSetup();
  const title = NotToggle.name ?? 'NotToggle';
  const label = 'Not';
  const props = { ...defaultNotToggleProps, label, title };

  describe(title, () => {
    it('should have the value passed into the <input />', () => {
      render(<NotToggle {...props} checked />);
      expect(isOrInheritsChecked(findInput(screen.getByLabelText(label)))).toBe(true);
    });

    it('should have the className passed into the <label />', () => {
      render(<NotToggle {...props} className="foo" />);
      expect(hasOrInheritsClass(screen.getByLabelText(label), 'foo')).toBe(true);
    });

    it('should call the onChange method passed in', async () => {
      const onChange = jest.fn();
      render(<NotToggle {...props} handleOnChange={onChange} />);
      await user.click(screen.getByLabelText(label));
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('should be disabled by disabled prop', async () => {
      const onChange = jest.fn();
      render(<NotToggle {...props} handleOnChange={onChange} disabled />);
      const notToggle = screen.getByLabelText(label);
      expect(notToggle).toBeDisabled();
      await user.click(notToggle);
      expect(onChange).not.toHaveBeenCalled();
    });
  });
};
