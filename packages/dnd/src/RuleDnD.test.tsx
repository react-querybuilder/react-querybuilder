import { act, cleanup, render, screen } from '@testing-library/react';
import { useDrag, useDrop } from 'react-dnd';
import {
  simulateDrag,
  simulateDragDrop,
  simulateDragHover,
  wrapWithTestBackend,
} from 'react-dnd-test-utils';
import type { QueryActions, RuleProps, Schema } from 'react-querybuilder';
import { defaultControlElements } from 'react-querybuilder';
import { standardClassnames as sc, TestID } from 'react-querybuilder';
import { getRuleProps } from 'react-querybuilder/genericTests';
import { QueryBuilderDndContext } from './QueryBuilderDndContext';
import { RuleDnD } from './RuleDnD';

const { rule, ruleGroup, combinatorSelector } = defaultControlElements;

const [RuleWithDndWrapper, getDndBackendOriginal] = wrapWithTestBackend((props: RuleProps) => (
  <QueryBuilderDndContext.Provider
    value={{ baseControls: { rule, ruleGroup, combinatorSelector }, useDrag, useDrop }}>
    <RuleDnD {...props} />
  </QueryBuilderDndContext.Provider>
));
// This is just a type guard against `undefined`
const getDndBackend = () => getDndBackendOriginal()!;

const getHandlerId = (el: HTMLElement, dragDrop: 'drag' | 'drop') => () =>
  el.getAttribute(`data-${dragDrop}monitorid`);

const getProps = (
  mergeIntoSchema: Partial<Schema> = {},
  mergeIntoActions: Partial<QueryActions> = {}
) => {
  const props = getRuleProps(mergeIntoSchema, mergeIntoActions);
  return {
    ...props,
    schema: {
      ...props.schema,
      enableDragAndDrop: true,
    },
  };
};

describe('enableDragAndDrop', () => {
  afterEach(() => {
    cleanup();
  });

  it('should not have the drag class if not dragging', () => {
    render(<RuleWithDndWrapper {...getProps()} />);
    const rule = screen.getByTestId(TestID.rule);
    expect(rule).not.toHaveClass(sc.dndDragging);
  });

  it('should have the drag class if dragging', () => {
    render(<RuleWithDndWrapper {...getProps()} />);
    const rule = screen.getByTestId(TestID.rule);
    simulateDrag(getHandlerId(rule, 'drag'), getDndBackend());
    expect(rule).toHaveClass(sc.dndDragging);
    act(() => {
      getDndBackend().simulateEndDrag();
    });
  });

  it('should have the over class if hovered', () => {
    render(
      <div>
        <RuleWithDndWrapper {...getProps()} path={[0]} />
        <RuleWithDndWrapper {...getProps()} path={[1]} />
      </div>
    );
    const rules = screen.getAllByTestId(TestID.rule);
    simulateDragHover(
      getHandlerId(rules[0], 'drag'),
      getHandlerId(rules[1], 'drop'),
      getDndBackend()
    );
    expect(rules[1]).toHaveClass(sc.dndOver);
    act(() => {
      getDndBackend().simulateEndDrag();
    });
  });

  it('should handle a dropped rule', () => {
    const moveRule = jest.fn();
    render(
      <div>
        <RuleWithDndWrapper {...getProps({}, { moveRule })} path={[0]} />
        <RuleWithDndWrapper {...getProps({}, { moveRule })} path={[1]} />
      </div>
    );
    const rules = screen.getAllByTestId(TestID.rule);
    simulateDragDrop(
      getHandlerId(rules[0], 'drag'),
      getHandlerId(rules[1], 'drop'),
      getDndBackend()
    );
    expect(rules[0]).not.toHaveClass(sc.dndDragging);
    expect(rules[1]).not.toHaveClass(sc.dndOver);
    expect(moveRule).toHaveBeenCalledWith([0], [2]);
  });

  it('should abort move if dropped on itself', () => {
    const moveRule = jest.fn();
    render(<RuleWithDndWrapper {...getProps({}, { moveRule })} />);
    const rule = screen.getByTestId(TestID.rule);
    simulateDragDrop(getHandlerId(rule, 'drag'), getHandlerId(rule, 'drop'), getDndBackend());
    expect(rule).not.toHaveClass(sc.dndDragging);
    expect(rule).not.toHaveClass(sc.dndOver);
    expect(moveRule).not.toHaveBeenCalled();
  });

  it('should not try to update query if disabled', () => {
    const moveRule = jest.fn();
    render(
      <div>
        <RuleWithDndWrapper {...getProps({}, { moveRule })} path={[0]} />
        <RuleWithDndWrapper {...getProps({}, { moveRule })} path={[1]} disabled />
      </div>
    );
    const rules = screen.getAllByTestId(TestID.rule);
    simulateDragDrop(
      getHandlerId(rules[0], 'drag'),
      getHandlerId(rules[1], 'drop'),
      getDndBackend()
    );
    expect(moveRule).not.toHaveBeenCalled();
  });

  it('prevents drops when locked', () => {
    const moveRule = jest.fn();
    render(
      <div>
        <RuleWithDndWrapper {...getProps({}, { moveRule })} path={[0]} disabled />
        <RuleWithDndWrapper {...getProps({}, { moveRule })} path={[1]} />
      </div>
    );
    const rules = screen.getAllByTestId(TestID.rule);
    simulateDragDrop(
      getHandlerId(rules[1], 'drag'),
      getHandlerId(rules[0], 'drop'),
      getDndBackend()
    );
    expect(moveRule).not.toHaveBeenCalled();
  });
});
