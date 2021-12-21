import { ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
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
  MaterialActionElement,
  MaterialDragHandle as MaterialDragHandleOriginal,
  MaterialNotToggle,
  MaterialValueEditor,
  MaterialValueSelector,
} from '.';

const theme = createTheme();

const generateWrapper = (RQBComponent: any) => {
  const Wrapper = (props: any) => (
    <ThemeProvider theme={theme}>
      <RQBComponent {...props} />
    </ThemeProvider>
  );
  Wrapper.displayName = RQBComponent.displayName;
  return Wrapper;
};

const WrapperDH = forwardRef<HTMLSpanElement, DragHandleProps>(function MaterialDragHandle(
  props,
  ref
) {
  return (
    <ThemeProvider theme={theme}>
      <MaterialDragHandleOriginal {...props} ref={ref} />
    </ThemeProvider>
  );
});

testActionElement(generateWrapper(MaterialActionElement));
testDragHandle(WrapperDH);
testNotToggle(generateWrapper(MaterialNotToggle));
testValueEditor(generateWrapper(MaterialValueEditor));
testValueSelector(generateWrapper(MaterialValueSelector));
