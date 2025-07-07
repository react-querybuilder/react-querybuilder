import { userEventSetup } from '@rqb-testing';
import { act, render, screen } from '@testing-library/react';
import * as React from 'react';
import * as ReactDnDHTML5Backend from 'react-dnd-html5-backend';
import {
  simulateDrag,
  simulateDragDrop,
  simulateDragHover,
  wrapWithTestBackend,
} from 'react-dnd-test-utils';
import * as ReactDnD from 'react-dnd';
import type {
  FullCombinator,
  FullField,
  FullOperator,
  QueryBuilderProps,
  RuleGroupType,
} from 'react-querybuilder';
import { QueryBuilder, TestID, standardClassnames as sc } from 'react-querybuilder';
import { QueryBuilderDnD } from './QueryBuilderDnD';
import type { QueryBuilderDndProps } from './types';

const user = userEventSetup();

const [QBforDnD, getDndBackendOriginal] = wrapWithTestBackend(
  ({
    canDrop,
    ...props
  }: QueryBuilderProps<RuleGroupType, FullField, FullOperator, FullCombinator> &
    Pick<QueryBuilderDndProps, 'canDrop'>) => (
    <QueryBuilderDnD dnd={{ ...ReactDnD, ...ReactDnDHTML5Backend }} canDrop={canDrop}>
      <QueryBuilder enableMountQueryChange={false} {...props} />
    </QueryBuilderDnD>
  )
);

// This is just a type guard against `undefined`
const getDndBackend = () => getDndBackendOriginal()!;

const getHandlerId = (el: HTMLElement, dragDrop: 'drag' | 'drop') => () =>
  el.getAttribute(`data-${dragDrop}monitorid`);

afterEach(() => {
  // Clear pressed keys
  globalThis.dispatchEvent(new Event('blur'));
});

it('does not have the drag class if not dragging', () => {
  render(<QBforDnD addRuleToNewGroups />);
  const rule = screen.getByTestId(TestID.rule);
  expect(rule).not.toHaveClass(sc.dndDragging);
});

it('has the drag class if dragging', () => {
  const dndDragging = 'my-dnd-dragging-class';
  render(<QBforDnD addRuleToNewGroups controlClassnames={{ dndDragging }} />);
  const rule = screen.getByTestId(TestID.rule);
  simulateDrag(getHandlerId(rule, 'drag'), getDndBackend());
  expect(rule).toHaveClass(sc.dndDragging, dndDragging);
  act(() => {
    getDndBackend().simulateEndDrag();
  });
});

it('has the over class if hovered', () => {
  const dndOver = 'my-dnd-over-class';
  render(
    <QBforDnD
      defaultQuery={{
        combinator: 'and',
        rules: [
          { field: 'f1', operator: '=', value: 'v1' },
          { field: 'f1', operator: '=', value: 'v1' },
        ],
      }}
      controlClassnames={{ dndOver }}
    />
  );
  const rules = screen.getAllByTestId(TestID.rule);
  simulateDragHover(
    getHandlerId(rules[0], 'drag'),
    getHandlerId(rules[1], 'drop'),
    getDndBackend()
  );
  expect(rules[1]).toHaveClass(sc.dndOver, dndOver);
  act(() => {
    getDndBackend().simulateEndDrag();
  });
});

it('has the copy class if hovered over while Alt key is pressed', async () => {
  const dndCopy = 'my-dnd-copy-class';
  render(
    <QBforDnD
      defaultQuery={{
        combinator: 'and',
        rules: [
          { field: 'f1', operator: '=', value: 'v1' },
          { field: 'f1', operator: '=', value: 'v1' },
        ],
      }}
      controlClassnames={{ dndCopy }}
    />
  );
  const rules = screen.getAllByTestId(TestID.rule);
  await user.keyboard('{Alt>}');
  simulateDragHover(
    getHandlerId(rules[0], 'drag'),
    getHandlerId(rules[1], 'drop'),
    getDndBackend()
  );
  expect(rules[1]).toHaveClass(sc.dndCopy, dndCopy);
  act(() => {
    getDndBackend().simulateEndDrag();
  });
  await user.keyboard('{/Alt}');
});

it('has the group class if hovered over while Ctrl key is pressed', async () => {
  const dndGroup = 'my-dnd-group-class';
  render(
    <QBforDnD
      defaultQuery={{
        combinator: 'and',
        rules: [
          { field: 'f1', operator: '=', value: 'v1' },
          { field: 'f1', operator: '=', value: 'v1' },
        ],
      }}
      controlClassnames={{ dndGroup }}
    />
  );
  const rules = screen.getAllByTestId(TestID.rule);
  await user.keyboard('{Control>}');
  simulateDragHover(
    getHandlerId(rules[0], 'drag'),
    getHandlerId(rules[1], 'drop'),
    getDndBackend()
  );
  expect(rules[1]).toHaveClass(sc.dndGroup, dndGroup);
  await act(async () => {
    getDndBackend().simulateEndDrag();
    await user.keyboard('{/Control}');
  });
});

it('moves a dropped rule', () => {
  const onQueryChange = jest.fn();
  render(
    <QBforDnD
      onQueryChange={onQueryChange}
      query={{
        combinator: 'and',
        rules: [
          { field: 'f1', operator: '=', value: 'v1' },
          { field: 'f2', operator: '=', value: 'v2' },
        ],
      }}
    />
  );
  const rules = screen.getAllByTestId(TestID.rule);
  simulateDragDrop(getHandlerId(rules[0], 'drag'), getHandlerId(rules[1], 'drop'), getDndBackend());
  expect(rules[0]).not.toHaveClass(sc.dndDragging);
  expect(rules[1]).not.toHaveClass(sc.dndOver);
  expect(onQueryChange.mock.calls[0][0]).toMatchObject({
    rules: [
      { field: 'f2', operator: '=', value: 'v2' },
      { field: 'f1', operator: '=', value: 'v1' },
    ],
  });
});

it('groups a dropped rule', async () => {
  const onQueryChange = jest.fn();
  render(
    <QBforDnD
      onQueryChange={onQueryChange}
      query={{
        combinator: 'and',
        rules: [
          { field: 'f1', operator: '=', value: 'v1' },
          { field: 'f2', operator: '=', value: 'v2' },
        ],
      }}
    />
  );
  const rules = screen.getAllByTestId(TestID.rule);
  await user.keyboard('{Control>}');
  simulateDragDrop(getHandlerId(rules[0], 'drag'), getHandlerId(rules[1], 'drop'), getDndBackend());
  await user.keyboard('{/Control}');
  expect(rules[0]).not.toHaveClass(sc.dndDragging);
  expect(rules[1]).not.toHaveClass(sc.dndOver);
  expect(onQueryChange.mock.calls[0][0]).toMatchObject<RuleGroupType>({
    combinator: 'and',
    rules: [
      {
        combinator: 'and',
        rules: [
          { field: 'f2', operator: '=', value: 'v2' },
          { field: 'f1', operator: '=', value: 'v1' },
        ],
      },
    ],
  });
});

it('copies a dropped rule', async () => {
  const onQueryChange = jest.fn();
  render(
    <QBforDnD
      onQueryChange={onQueryChange}
      query={{
        combinator: 'and',
        rules: [
          { field: 'f1', operator: '=', value: 'v1' },
          { field: 'f2', operator: '=', value: 'v2' },
        ],
      }}
    />
  );
  const rules = screen.getAllByTestId(TestID.rule);
  await user.keyboard('{Alt>}');
  simulateDragDrop(getHandlerId(rules[0], 'drag'), getHandlerId(rules[1], 'drop'), getDndBackend());
  await user.keyboard('{/Alt}');
  expect(rules[0]).not.toHaveClass(sc.dndDragging);
  expect(rules[1]).not.toHaveClass(sc.dndOver);
  expect(onQueryChange.mock.calls[0][0]).toMatchObject<RuleGroupType>({
    combinator: 'and',
    rules: [
      { field: 'f1', operator: '=', value: 'v1' },
      { field: 'f2', operator: '=', value: 'v2' },
      { field: 'f1', operator: '=', value: 'v1' },
    ],
  });
});

it('copies a dropped rule for grouping', async () => {
  const onQueryChange = jest.fn();
  render(
    <QBforDnD
      onQueryChange={onQueryChange}
      query={{
        combinator: 'and',
        rules: [
          { field: 'f1', operator: '=', value: 'v1' },
          { field: 'f2', operator: '=', value: 'v2' },
        ],
      }}
    />
  );
  const rules = screen.getAllByTestId(TestID.rule);
  await user.keyboard('{Control>}{Alt>}');
  simulateDragDrop(getHandlerId(rules[0], 'drag'), getHandlerId(rules[1], 'drop'), getDndBackend());
  await user.keyboard('{/Alt}{/Control}');
  expect(rules[0]).not.toHaveClass(sc.dndDragging);
  expect(rules[1]).not.toHaveClass(sc.dndOver);
  expect(onQueryChange.mock.calls[0][0]).toMatchObject<RuleGroupType>({
    combinator: 'and',
    rules: [
      { field: 'f1', operator: '=', value: 'v1' },
      {
        combinator: 'and',
        rules: [
          { field: 'f2', operator: '=', value: 'v2' },
          { field: 'f1', operator: '=', value: 'v1' },
        ],
      },
    ],
  });
});

it('aborts move if dropped on itself', () => {
  const onQueryChange = jest.fn();
  render(
    <QBforDnD
      onQueryChange={onQueryChange}
      query={{
        combinator: 'and',
        rules: [{ field: 'f1', operator: '=', value: 'v1' }],
      }}
    />
  );
  const rule = screen.getByTestId(TestID.rule);
  simulateDragDrop(getHandlerId(rule, 'drag'), getHandlerId(rule, 'drop'), getDndBackend());
  expect(rule).not.toHaveClass(sc.dndDragging);
  expect(rule).not.toHaveClass(sc.dndOver);
  expect(onQueryChange).not.toHaveBeenCalled();
});

it('aborts group if dropped on itself', async () => {
  const onQueryChange = jest.fn();
  render(
    <QBforDnD
      onQueryChange={onQueryChange}
      query={{
        combinator: 'and',
        rules: [{ field: 'f1', operator: '=', value: 'v1' }],
      }}
    />
  );
  const rule = screen.getByTestId(TestID.rule);
  await user.keyboard('{Control>}');
  simulateDragDrop(getHandlerId(rule, 'drag'), getHandlerId(rule, 'drop'), getDndBackend());
  await user.keyboard('{/Control}');
  expect(rule).not.toHaveClass(sc.dndDragging);
  expect(rule).not.toHaveClass(sc.dndOver);
  expect(onQueryChange).not.toHaveBeenCalled();
});

it('handles drops even when locked', () => {
  const onQueryChange = jest.fn();
  render(
    <QBforDnD
      onQueryChange={onQueryChange}
      query={{
        combinator: 'and',
        rules: [
          { field: 'f1', operator: '=', value: 'v1' },
          { field: 'f2', operator: '=', value: 'v2', disabled: true },
        ],
      }}
    />
  );
  const rules = screen.getAllByTestId(TestID.rule);
  simulateDragDrop(getHandlerId(rules[0], 'drag'), getHandlerId(rules[1], 'drop'), getDndBackend());
  expect(rules[0]).not.toHaveClass(sc.dndDragging);
  expect(rules[1]).not.toHaveClass(sc.dndOver);
  expect(onQueryChange.mock.calls[0][0]).toMatchObject({
    rules: [
      { field: 'f2', operator: '=', value: 'v2' },
      { field: 'f1', operator: '=', value: 'v1' },
    ],
  });
});

it('prevents "group" drops when locked', async () => {
  const onQueryChange = jest.fn();
  render(
    <QBforDnD
      onQueryChange={onQueryChange}
      disabled={[[0]]}
      query={{
        combinator: 'and',
        rules: [
          { field: 'f1', operator: '=', value: 'v1' },
          { field: 'f2', operator: '=', value: 'v2' },
        ],
      }}
    />
  );
  const rules = screen.getAllByTestId(TestID.rule);
  await user.keyboard('{Ctrl>}');
  simulateDragDrop(getHandlerId(rules[1], 'drag'), getHandlerId(rules[0], 'drop'), getDndBackend());
  await user.keyboard('{/Ctrl}');
  expect(rules[0]).not.toHaveClass(sc.dndDragging);
  expect(rules[1]).not.toHaveClass(sc.dndOver);
  expect(onQueryChange).not.toHaveBeenCalled();
});

it('respects custom canDrop', () => {
  const onQueryChange = jest.fn();
  const canDrop = jest.fn((..._args: unknown[]) => false);
  render(
    <QBforDnD
      canDrop={canDrop}
      onQueryChange={onQueryChange}
      query={{
        combinator: 'and',
        rules: [
          { field: 'f1', operator: '=', value: 'v1' },
          { field: 'f2', operator: '=', value: 'v2' },
        ],
      }}
    />
  );
  const rules = screen.getAllByTestId(TestID.rule);
  simulateDragDrop(getHandlerId(rules[1], 'drag'), getHandlerId(rules[0], 'drop'), getDndBackend());
  expect(canDrop).toHaveBeenCalledWith({
    dragging: { path: [1], field: 'f2', operator: '=', value: 'v2', qbId: expect.any(String) },
    hovering: {
      path: [0],
      field: 'f1',
      operator: '=',
      value: 'v1',
      qbId: expect.any(String),
      id: expect.any(String),
    },
  });
  expect(onQueryChange).not.toHaveBeenCalled();
});

it('respects updated canDrop function between renders', () => {
  const firstCanDrop = jest.fn((..._args: unknown[]) => false);
  const secondCanDrop = jest.fn((..._args: unknown[]) => false);
  const onQueryChange = jest.fn();

  const query = {
    combinator: 'and',
    rules: [
      { field: 'f1', operator: '=', value: 'v1' },
      { field: 'f2', operator: '=', value: 'v2' },
    ],
  };

  const { rerender } = render(
    <QBforDnD canDrop={firstCanDrop} query={query} onQueryChange={onQueryChange} />
  );

  // First drag attempt - should use firstCanDrop
  const rules = screen.getAllByTestId(TestID.rule);
  simulateDragDrop(getHandlerId(rules[1], 'drag'), getHandlerId(rules[0], 'drop'), getDndBackend());

  expect(firstCanDrop).toHaveBeenCalledWith({
    dragging: { path: [1], field: 'f2', operator: '=', value: 'v2', qbId: expect.any(String) },
    hovering: {
      path: [0],
      field: 'f1',
      operator: '=',
      value: 'v1',
      qbId: expect.any(String),
      id: expect.any(String),
    },
  });

  const firstCanDropCallCount = firstCanDrop.mock.calls.length;

  // Rerender with secondCanDrop
  rerender(<QBforDnD canDrop={secondCanDrop} query={query} onQueryChange={onQueryChange} />);

  // Second drag attempt - should use secondCanDrop
  simulateDragDrop(getHandlerId(rules[1], 'drag'), getHandlerId(rules[0], 'drop'), getDndBackend());

  expect(secondCanDrop).toHaveBeenCalledWith({
    dragging: { path: [1], field: 'f2', operator: '=', value: 'v2', qbId: expect.any(String) },
    hovering: {
      path: [0],
      field: 'f1',
      operator: '=',
      value: 'v1',
      qbId: expect.any(String),
      id: expect.any(String),
    },
  });

  // Verify that only secondCanDrop was called in the second attempt
  expect(firstCanDrop).toHaveBeenCalledTimes(firstCanDropCallCount);
  expect(secondCanDrop).toHaveBeenCalled();
});
