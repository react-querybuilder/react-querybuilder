import { act, render, screen } from '@testing-library/react';
import { useDrag, useDrop } from 'react-dnd';
import { simulateDrag, simulateDragDrop, wrapWithTestBackend } from 'react-dnd-test-utils';
import { standardClassnames as sc, TestID } from './defaults';
import { getRuleGroupWithDndWrapper, getRuleWithDndWrapper } from './internal';
import { Rule } from './Rule';
import { RuleGroup } from './RuleGroup';
import { getProps } from './RuleGroup.test';
import type { QueryActions, Schema } from './types';

const [RuleGroupWithDndWrapper, getDndBackendOriginal] = wrapWithTestBackend(
  getRuleGroupWithDndWrapper(RuleGroup)
);
// This is just a type guard against `undefined`
const getDndBackend = () => getDndBackendOriginal()!;

const getHandlerId = (el: HTMLElement, dragDrop: 'drag' | 'drop') => () =>
  el.getAttribute(`data-${dragDrop}monitorid`);

const getRuleGroupProps = (
  mergeIntoSchema: Partial<Schema> = {},
  mergeIntoActions: Partial<QueryActions> = {}
) => {
  const props = getProps(mergeIntoSchema, mergeIntoActions);
  return {
    ...props,
    schema: {
      ...props.schema,
      enableDragAndDrop: true,
      controls: {
        ...props.schema.controls,
        ruleGroup: getRuleGroupWithDndWrapper(RuleGroup),
        rule: getRuleWithDndWrapper(Rule),
      },
      dnd: { ...props.schema.dnd, hooks: { useDrag, useDrop } },
    },
  };
};

describe('enableDragAndDrop', () => {
  it('should not have the drag class if not dragging', () => {
    render(<RuleGroupWithDndWrapper {...getRuleGroupProps()} />);
    const ruleGroup = screen.getByTestId(TestID.ruleGroup);
    expect(ruleGroup).not.toHaveClass(sc.dndDragging);
  });

  it('should have the drag class if dragging', () => {
    render(<RuleGroupWithDndWrapper {...getRuleGroupProps()} />);
    const ruleGroup = screen.getByTestId(TestID.ruleGroup);
    simulateDrag(getHandlerId(ruleGroup, 'drag'), getDndBackend());
    expect(ruleGroup).toHaveClass(sc.dndDragging);
    act(() => {
      getDndBackend().simulateEndDrag();
    });
  });

  it('should handle a dropped rule group', () => {
    const moveRule = jest.fn();
    render(
      <div>
        <RuleGroupWithDndWrapper {...getRuleGroupProps({}, { moveRule })} path={[0]} />
        <RuleGroupWithDndWrapper {...getRuleGroupProps({}, { moveRule })} path={[1]} />
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
    expect(moveRule).toHaveBeenCalledWith([1], [0, 0]);
  });

  it('should abort move if dropped on itself', () => {
    const moveRule = jest.fn();
    render(<RuleGroupWithDndWrapper {...getRuleGroupProps({}, { moveRule })} />);
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

  it('should abort move if source item is first child of this group', () => {
    const moveRule = jest.fn();
    render(
      <RuleGroupWithDndWrapper
        {...getRuleGroupProps({}, { moveRule })}
        ruleGroup={{ combinator: 'and', rules: [{ combinator: 'and', rules: [] }] }}
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

  it('should handle drops on combinator between rules', () => {
    const moveRule = jest.fn();
    render(
      <div>
        <RuleGroupWithDndWrapper
          {...getRuleGroupProps({ showCombinatorsBetweenRules: true }, { moveRule })}
          ruleGroup={{
            combinator: 'and',
            rules: [
              { field: 'firstName', operator: '=', value: '0' },
              { field: 'firstName', operator: '=', value: '1' },
              { field: 'firstName', operator: '=', value: '2' },
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
    expect(moveRule).toHaveBeenCalledWith([0, 2], [0, 1]);
  });

  it('should handle rule group drops on independent combinators', () => {
    const moveRule = jest.fn();
    render(
      <div>
        <RuleGroupWithDndWrapper
          {...getRuleGroupProps({ independentCombinators: true }, { moveRule })}
          ruleGroup={{
            rules: [
              { field: 'firstName', operator: '=', value: 'Steve' },
              'and',
              { field: 'lastName', operator: '=', value: 'Vai' },
            ],
          }}
          path={[0]}
        />
        <RuleGroupWithDndWrapper
          {...getRuleGroupProps({ independentCombinators: true }, { moveRule })}
          path={[1]}
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
    expect(moveRule).toHaveBeenCalledWith([1], [0, 1]);
  });

  it('should handle rule drops on independent combinators', () => {
    const moveRule = jest.fn();
    render(
      <RuleGroupWithDndWrapper
        {...getRuleGroupProps({ independentCombinators: true }, { moveRule })}
        ruleGroup={{
          rules: [
            { field: 'firstName', operator: '=', value: 'Steve' },
            'and',
            { field: 'lastName', operator: '=', value: 'Vai' },
            'and',
            { field: 'age', operator: '>', value: 28 },
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
    expect(moveRule).toHaveBeenCalledWith([0, 4], [0, 1]);
  });

  it('prevents drops when locked', () => {
    const moveRule = jest.fn();
    render(
      <div>
        <RuleGroupWithDndWrapper {...getRuleGroupProps({}, { moveRule })} path={[0]} disabled />
        <RuleGroupWithDndWrapper {...getRuleGroupProps({}, { moveRule })} path={[1]} />
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
});
