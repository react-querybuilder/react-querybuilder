import { render, screen } from '@testing-library/react';
import type { ComponentPropsWithoutRef } from 'react';
import * as React from 'react';
import { forwardRef } from 'react';
import type { DragHandleProps } from 'react-querybuilder';
import { QueryBuilder, TestID } from 'react-querybuilder';
import {
  testActionElement,
  testDragHandle,
  testNotToggle,
  testShiftActions,
  testValueEditor,
  testValueSelector,
} from '@rqb-testing';
import { Provider } from './snippets/provider';
import { ChakraActionElement } from './ChakraActionElement';
import { ChakraDragHandle } from './ChakraDragHandle';
import { ChakraNotToggle } from './ChakraNotToggle';
import { ChakraShiftActions } from './ChakraShiftActions';
import { ChakraValueEditor } from './ChakraValueEditor';
import { ChakraValueSelector } from './ChakraValueSelector';
import { QueryBuilderChakra } from './index';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateWrapper = (RQBComponent: React.ComponentType<any>) => {
  const Wrapper = (props: ComponentPropsWithoutRef<typeof RQBComponent>) => (
    <Provider>
      <RQBComponent {...props} />
    </Provider>
  );
  Wrapper.displayName = RQBComponent.displayName;
  return Wrapper;
};
const WrapperDH = forwardRef<HTMLSpanElement, DragHandleProps>((props, ref) => (
  <Provider>
    <ChakraDragHandle {...props} ref={ref} />
  </Provider>
));

testActionElement(generateWrapper(ChakraActionElement));
testDragHandle(WrapperDH);
testNotToggle(generateWrapper(ChakraNotToggle));
testShiftActions(generateWrapper(ChakraShiftActions));
testValueEditor(generateWrapper(ChakraValueEditor));
testValueSelector(generateWrapper(ChakraValueSelector), { multi: true });

it('renders with composition', () => {
  render(
    <Provider>
      <QueryBuilderChakra>
        <QueryBuilder />
      </QueryBuilderChakra>
    </Provider>
  );
  expect(screen.getByTestId(TestID.ruleGroup)).toBeInTheDocument();
  expect(screen.getByTestId(TestID.ruleGroup).querySelector('button')).toHaveClass('chakra-button');
});
