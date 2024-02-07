import { act, render, screen } from '@testing-library/react';
import * as React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { simulateDrag, simulateDragDrop, wrapWithTestBackend } from 'react-dnd-test-utils';
import type {
  FullField,
  QueryActions,
  RuleGroupProps,
  Schema,
  ToFullOption,
} from 'react-querybuilder';
import { TestID, defaultControlElements, standardClassnames as sc } from 'react-querybuilder';
import { getRuleGroupProps } from 'react-querybuilder/genericTests';
import { InlineCombinatorDnD } from './InlineCombinatorDnD';
import { QueryBuilderDndContext } from './QueryBuilderDndContext';
import { RuleDnD } from './RuleDnD';
import { RuleGroupDnD } from './RuleGroupDnD';
import type { QueryBuilderDndContextProps } from './types';

const { rule, ruleGroup, combinatorSelector } = defaultControlElements;

const [RuleGroupWithDndWrapper, getDndBackendOriginal] = wrapWithTestBackend(
  (props: RuleGroupProps & Pick<QueryBuilderDndContextProps, 'canDrop'>) => (
    <QueryBuilderDndContext.Provider
      value={{
        baseControls: { rule, ruleGroup, combinatorSelector },
        useDrag,
        useDrop,
        canDrop: props.canDrop,
      }}>
      <RuleGroupDnD
        {...{
          ...props,
          schema: {
            ...props.schema,
            controls: {
              ...props.schema.controls,
              rule: RuleDnD,
              ruleGroup: RuleGroupDnD,
              inlineCombinator: InlineCombinatorDnD,
            },
          },
        }}
      />
    </QueryBuilderDndContext.Provider>
  )
);
// This is just a type guard against `undefined`
const getDndBackend = () => getDndBackendOriginal()!;

const getHandlerId = (el: HTMLElement, dragDrop: 'drag' | 'drop') => () =>
  el.getAttribute(`data-${dragDrop}monitorid`);

const getProps = (
  mergeIntoSchema: Partial<Schema<ToFullOption<FullField>, string>> = {},
  mergeIntoActions: Partial<QueryActions> = {}
) => {
  const props = getRuleGroupProps(mergeIntoSchema, mergeIntoActions);
  return {
    ...props,
    schema: {
      ...props.schema,
      enableDragAndDrop: true,
    },
  };
};

it('does not have the drag class if not dragging', () => {
  render(<RuleGroupWithDndWrapper {...getProps()} />);
  const ruleGroup = screen.getByTestId(TestID.ruleGroup);
  expect(ruleGroup).not.toHaveClass(sc.dndDragging);
});

it('has the drag class if dragging', () => {
  render(<RuleGroupWithDndWrapper {...getProps()} />);
  const ruleGroup = screen.getByTestId(TestID.ruleGroup);
  simulateDrag(getHandlerId(ruleGroup, 'drag'), getDndBackend());
  expect(ruleGroup).toHaveClass(sc.dndDragging);
  act(() => {
    getDndBackend().simulateEndDrag();
  });
});

it('handles a dropped rule group', () => {
  const moveRule = jest.fn();
  render(
    <div>
      <RuleGroupWithDndWrapper {...getProps({}, { moveRule })} path={[0]} />
      <RuleGroupWithDndWrapper {...getProps({}, { moveRule })} path={[1]} />
    </div>
  );
  const ruleGroups = screen.getAllByTestId(TestID.ruleGroup);
  simulateDragDrop(
    getHandlerId(ruleGroups[1], 'drag'),
    getHandlerId(ruleGroups[0], 'drop'),
    getDndBackend()
  );
  expect(ruleGroups[0]).not.toHaveClass(sc.dndDragging);
  expect(ruleGroups[1]).not.toHaveClass(sc.dndOver);
  expect(moveRule).toHaveBeenCalledWith([1], [0, 0], false);
});

it('aborts move if dropped on itself', () => {
  const moveRule = jest.fn();
  render(<RuleGroupWithDndWrapper {...getProps({}, { moveRule })} />);
  const ruleGroup = screen.getByTestId(TestID.ruleGroup);
  simulateDragDrop(
    getHandlerId(ruleGroup, 'drag'),
    getHandlerId(ruleGroup, 'drop'),
    getDndBackend()
  );
  expect(ruleGroup).not.toHaveClass(sc.dndDragging);
  expect(ruleGroup).not.toHaveClass(sc.dndOver);
  expect(moveRule).not.toHaveBeenCalled();
});

it('aborts move if source item is first child of this group', () => {
  const moveRule = jest.fn();
  render(
    <RuleGroupWithDndWrapper
      {...getProps({}, { moveRule })}
      ruleGroup={{
        combinator: 'and',
        rules: [{ id: 'rg1', combinator: 'and', rules: [] }],
      }}
    />
  );
  const ruleGroups = screen.getAllByTestId(TestID.ruleGroup);
  simulateDragDrop(
    getHandlerId(ruleGroups[1], 'drag'),
    getHandlerId(ruleGroups[0], 'drop'),
    getDndBackend()
  );
  expect(moveRule).not.toHaveBeenCalled();
});

it('handles drops on combinator between rules', () => {
  const moveRule = jest.fn();
  render(
    <div>
      <RuleGroupWithDndWrapper
        {...getProps({ showCombinatorsBetweenRules: true }, { moveRule })}
        ruleGroup={{
          combinator: 'and',
          rules: [
            { id: '0', field: 'firstName', operator: '=', value: '0' },
            { id: '1', field: 'firstName', operator: '=', value: '1' },
            { id: '2', field: 'firstName', operator: '=', value: '2' },
          ],
        }}
        path={[0]}
      />
    </div>
  );
  const rules = screen.getAllByTestId(TestID.rule);
  const combinatorEls = screen.getAllByTestId(TestID.inlineCombinator);
  simulateDragDrop(
    getHandlerId(rules[2], 'drag'),
    getHandlerId(combinatorEls[1], 'drop'),
    getDndBackend()
  );
  expect(moveRule).not.toHaveBeenCalled();
  simulateDragDrop(
    getHandlerId(rules[2], 'drag'),
    getHandlerId(combinatorEls[0], 'drop'),
    getDndBackend()
  );
  expect(moveRule).toHaveBeenCalledWith([0, 2], [0, 1], false);
});

it('handles rule group drops on independent combinators', () => {
  const moveRule = jest.fn();
  render(
    <div>
      <RuleGroupWithDndWrapper
        {...getProps({ independentCombinators: true }, { moveRule })}
        ruleGroup={{
          rules: [
            { id: 'Steve', field: 'firstName', operator: '=', value: 'Steve' },
            'and',
            { id: 'Vai', field: 'lastName', operator: '=', value: 'Vai' },
          ],
        }}
        path={[0]}
      />
      <RuleGroupWithDndWrapper
        {...getProps({ independentCombinators: true }, { moveRule })}
        path={[2]}
      />
    </div>
  );
  const ruleGroups = screen.getAllByTestId(TestID.ruleGroup);
  const combinatorEl = screen.getByTestId(TestID.inlineCombinator);
  simulateDragDrop(
    getHandlerId(ruleGroups[1], 'drag'),
    getHandlerId(combinatorEl, 'drop'),
    getDndBackend()
  );
  expect(ruleGroups[1]).not.toHaveClass(sc.dndDragging);
  expect(combinatorEl).not.toHaveClass(sc.dndOver);
  expect(moveRule).toHaveBeenCalledWith([2], [0, 1], false);
});

it('handles rule drops on independent combinators', () => {
  const moveRule = jest.fn();
  render(
    <RuleGroupWithDndWrapper
      {...getProps({ independentCombinators: true }, { moveRule })}
      ruleGroup={{
        rules: [
          { id: 'Steve', field: 'firstName', operator: '=', value: 'Steve' },
          'and',
          { id: 'Vai', field: 'lastName', operator: '=', value: 'Vai' },
          'and',
          { id: '28', field: 'age', operator: '>', value: 28 },
        ],
      }}
      path={[0]}
    />
  );
  const rules = screen.getAllByTestId(TestID.rule);
  const combinatorEls = screen.getAllByTestId(TestID.inlineCombinator);
  simulateDragDrop(
    getHandlerId(rules[2], 'drag'),
    getHandlerId(combinatorEls[0], 'drop'),
    getDndBackend()
  );
  expect(moveRule).toHaveBeenCalledWith([0, 4], [0, 1], false);
});

it('prevents drops when locked', () => {
  const moveRule = jest.fn();
  render(
    <div>
      <RuleGroupWithDndWrapper {...getProps({}, { moveRule })} path={[0]} disabled />
      <RuleGroupWithDndWrapper {...getProps({}, { moveRule })} path={[1]} />
    </div>
  );
  const ruleGroups = screen.getAllByTestId(TestID.ruleGroup);
  simulateDragDrop(
    getHandlerId(ruleGroups[1], 'drag'),
    getHandlerId(ruleGroups[0], 'drop'),
    getDndBackend()
  );
  expect(moveRule).not.toHaveBeenCalled();
});

it('respects custom canDrop', () => {
  const moveRule = jest.fn();
  const canDrop = jest.fn(() => false);
  render(
    <div>
      <RuleGroupWithDndWrapper {...getProps({}, { moveRule })} path={[0]} canDrop={canDrop} />
      <RuleGroupWithDndWrapper {...getProps({}, { moveRule })} path={[1]} canDrop={canDrop} />
    </div>
  );
  const ruleGroups = screen.getAllByTestId(TestID.ruleGroup);
  simulateDragDrop(
    getHandlerId(ruleGroups[1], 'drag'),
    getHandlerId(ruleGroups[0], 'drop'),
    getDndBackend()
  );
  expect(canDrop).toHaveBeenCalledWith({ item: { path: [1] }, path: [0] });
  expect(moveRule).not.toHaveBeenCalled();
});
