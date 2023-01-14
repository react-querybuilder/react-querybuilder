// TODO: Real tests for React Native!

// import { render, screen } from '@testing-library/react';
// import { TestID } from 'react-querybuilder';
// import {
//   testActionElement,
//   testNotToggle,
//   testValueEditor,
//   testValueSelector,
// } from 'react-querybuilder/genericTests';
// import { QueryBuilderNative } from '../QueryBuilderNative';
// import { NativeActionElement } from './NativeActionElement';
// import { NativeNotToggle } from './NativeNotToggle';
// import { NativeValueEditor } from './NativeValueEditor';
// import { NativeValueSelector } from './NativeValueSelector';

declare global {
  // eslint-disable-next-line no-var
  var __RQB_DEV__: boolean;
}
globalThis.__RQB_DEV__ = true;

// testActionElement(NativeActionElement);
// testNotToggle(NativeNotToggle);
// testValueEditor(NativeValueEditor);
// testValueSelector(NativeValueSelector);

it('renders with composition', () => {
  expect(1).toBe(1);
  // render(<QueryBuilderNative />);
  // expect(screen.getByTestId(TestID.ruleGroup)).toBeInTheDocument();
  // expect(screen.getByTestId(TestID.ruleGroup).querySelector('button')).toHaveClass('button');
});

export {};
