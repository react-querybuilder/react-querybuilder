import { theme, ThemeProvider } from '@chakra-ui/react';
import {
  testActionElement,
  testDragHandle,
  testNotToggle,
  testValueEditor,
  testValueSelector,
} from '@react-querybuilder/compat';
import { forwardRef } from 'react';
import { DragHandleProps } from 'react-querybuilder';
import {
  ChakraActionElement,
  ChakraDragHandle,
  ChakraNotToggle,
  ChakraValueEditor,
  ChakraValueSelector,
} from '.';

const generateWrapper = (RQBComponent: any) => {
  const Wrapper = (props: any) => (
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
testValueSelector(generateWrapper(ChakraValueSelector));
