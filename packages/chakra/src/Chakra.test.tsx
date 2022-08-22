import { theme, ThemeProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import {
  testActionElement,
  testDragHandle,
  testNotToggle,
  testValueEditor,
  testValueSelector,
} from 'react-querybuilder/genericTests';
import type { DragHandleProps } from 'react-querybuilder/src';
import { QueryBuilder, TestID } from 'react-querybuilder/src';
import {
  ChakraActionElement,
  ChakraDragHandle,
  ChakraNotToggle,
  ChakraValueEditor,
  ChakraValueSelector,
  QueryBuilderChakra,
} from '.';

declare global {
  // eslint-disable-next-line no-var
  var __RQB_DEV__: boolean;
}
globalThis.__RQB_DEV__ = true;

const generateWrapper = (RQBComponent: any) => {
  const Wrapper = (props: ComponentPropsWithoutRef<typeof RQBComponent>) => (
    <ThemeProvider theme={theme}>
      <RQBComponent {...props} />
    </ThemeProvider>
  );
  Wrapper.displayName = RQBComponent.displayName;
  return Wrapper;
};
const WrapperDH = forwardRef<HTMLSpanElement, DragHandleProps>((props, ref) => (
  <ThemeProvider theme={{}}>
    <ChakraDragHandle {...props} ref={ref} />
  </ThemeProvider>
));
WrapperDH.displayName = ChakraDragHandle.displayName;

testActionElement(generateWrapper(ChakraActionElement));
testDragHandle(WrapperDH);
testNotToggle(generateWrapper(ChakraNotToggle));
testValueEditor(generateWrapper(ChakraValueEditor));
testValueSelector(generateWrapper(ChakraValueSelector), { multi: true });

it('renders with composition', () => {
  render(
    <QueryBuilderChakra>
      <QueryBuilder />
    </QueryBuilderChakra>
  );
  expect(screen.getByTestId(TestID.ruleGroup)).toBeInTheDocument();
  expect(screen.getByTestId(TestID.ruleGroup).querySelector('button')).toHaveClass('chakra-button');
});
