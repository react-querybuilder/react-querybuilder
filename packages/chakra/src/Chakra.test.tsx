import {
  testActionElement,
  testNotToggle,
  testShiftActions,
  testValueEditor,
  testValueSelector,
} from '@rqb-testing';
import { render, screen } from '@testing-library/react';
import type { ComponentPropsWithoutRef } from 'react';
import * as React from 'react';
import { QueryBuilder, TestID } from 'react-querybuilder';
import { ChakraActionElement } from './ChakraActionElement';
import { ChakraNotToggle } from './ChakraNotToggle';
import { ChakraShiftActions } from './ChakraShiftActions';
import { ChakraValueEditor } from './ChakraValueEditor';
import { ChakraValueSelector } from './ChakraValueSelector';
import { QueryBuilderChakra } from './index';
import { Provider } from './snippets/provider';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateWrapper = (RQBComponent: React.ComponentType<any>) => {
  const ChakraWrapper = (props: ComponentPropsWithoutRef<typeof RQBComponent>) => (
    <Provider>
      <RQBComponent {...props} />
    </Provider>
  );
  ChakraWrapper.displayName = RQBComponent.displayName || RQBComponent.name;
  return ChakraWrapper;
};

testActionElement(generateWrapper(ChakraActionElement));
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
