import { userEventSetup } from '@rqb-testing';
import { act, render, screen } from '@testing-library/react';
import * as React from 'react';
import * as ReactDnD from 'react-dnd';
import * as ReactDnDHTML5Backend from 'react-dnd-html5-backend';
import {
  simulateDrag,
  simulateDragDrop,
  simulateDragHover,
  wrapWithTestBackend,
} from 'react-dnd-test-utils';
import type {
  FullCombinator,
  FullField,
  FullOperator,
  QueryBuilderProps,
  RuleGroupType,
  RuleGroupTypeIC,
} from 'react-querybuilder';
import QueryBuilder, { TestID, standardClassnames as sc } from 'react-querybuilder';
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
const [QBforDnDIC, getDndBackendOriginalIC] = wrapWithTestBackend(
  ({
    canDrop,
    ...props
  }: QueryBuilderProps<RuleGroupTypeIC, FullField, FullOperator, FullCombinator> &
    Pick<QueryBuilderDndProps, 'canDrop'>) => (
    <QueryBuilderDnD dnd={{ ...ReactDnD, ...ReactDnDHTML5Backend }} canDrop={canDrop}>
      <QueryBuilder enableMountQueryChange={false} {...props} />
    </QueryBuilderDnD>
  )
);

// This is just a type guard against `undefined`
const getDndBackend = () => getDndBackendOriginal()!;
const getDndBackendIC = () => getDndBackendOriginalIC()!;

const getHandlerId = (el: HTMLElement, dragDrop: 'drag' | 'drop') => () =>
  el.getAttribute(`data-${dragDrop}monitorid`);

afterEach(() => {
  // Clear pressed keys
  globalThis.dispatchEvent(new Event('blur'));
});

it('does not have the drag class if not dragging', () => {
  render(<QBforDnD />);
  const ruleGroup = screen.getByTestId(TestID.ruleGroup);
  expect(ruleGroup).not.toHaveClass(sc.dndDragging);
});

it('has the drag class if dragging', () => {
  const dndDragging = 'my-dnd-dragging-class';
  render(
    <QBforDnD
      query={{ combinator: 'and', rules: [{ combinator: 'and', rules: [] }] }}
      controlClassnames={{ dndDragging }}
    />
  );
  const ruleGroup = screen.getAllByTestId(TestID.ruleGroup)[1];
  simulateDrag(getHandlerId(ruleGroup, 'drag'), getDndBackend());
  expect(ruleGroup).toHaveClass(sc.dndDragging, dndDragging);
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
          { combinator: 'and', rules: [] },
          { field: 'f1', operator: '=', value: 'v1' },
        ],
      }}
      controlClassnames={{ dndCopy }}
    />
  );
  const rule = screen.getByTestId(TestID.rule);
  const ruleGroupTarget = screen.getAllByTestId(TestID.ruleGroup)[1];
  await user.keyboard('{Alt>}');
  simulateDragHover(
    getHandlerId(rule, 'drag'),
    getHandlerId(ruleGroupTarget, 'drop'),
    getDndBackend()
  );
  expect(ruleGroupTarget.querySelector(`.${sc.header}`)).toHaveClass(sc.dndCopy, dndCopy);
  act(() => {
    getDndBackend().simulateEndDrag();
  });
  await user.keyboard('{/Alt}');
});

it('has the copy class if hovered over while Ctrl key is pressed', async () => {
  const dndGroup = 'my-dnd-group-class';
  render(
    <QBforDnD
      defaultQuery={{
        combinator: 'and',
        rules: [
          { combinator: 'and', rules: [] },
          { field: 'f1', operator: '=', value: 'v1' },
        ],
      }}
      controlClassnames={{ dndGroup }}
    />
  );
  const rule = screen.getByTestId(TestID.rule);
  const ruleGroupTarget = screen.getAllByTestId(TestID.ruleGroup)[1];
  await user.keyboard('{Control>}');
  simulateDragHover(
    getHandlerId(rule, 'drag'),
    getHandlerId(ruleGroupTarget, 'drop'),
    getDndBackend()
  );
  expect(ruleGroupTarget).toHaveClass(sc.dndGroup, dndGroup);
  act(() => {
    getDndBackend().simulateEndDrag();
  });
  await user.keyboard('{/Control}');
});

it('handles a dropped rule group on a rule group', () => {
  const onQueryChange = jest.fn();
  render(
    <QBforDnD
      onQueryChange={onQueryChange}
      query={{
        combinator: 'and',
        rules: [
          { combinator: 'and', rules: [] },
          { combinator: 'and', rules: [] },
        ],
      }}
    />
  );
  const ruleGroups = screen.getAllByTestId(TestID.ruleGroup);
  simulateDragDrop(
    getHandlerId(ruleGroups[2], 'drag'),
    getHandlerId(ruleGroups[1], 'drop'),
    getDndBackend()
  );
  for (const rg of ruleGroups) {
    expect(rg).not.toHaveClass(sc.dndDragging);
    expect(rg).not.toHaveClass(sc.dndOver);
  }
  expect(onQueryChange).toHaveBeenCalledWith({
    combinator: 'and',
    rules: [{ combinator: 'and', rules: [{ combinator: 'and', rules: [] }] }],
  });
});

it('copies a dropped rule group on a rule group', async () => {
  const onQueryChange = jest.fn();
  render(
    <QBforDnD
      onQueryChange={onQueryChange}
      query={{
        combinator: 'and',
        rules: [
          { combinator: 'and', rules: [] },
          { combinator: 'and', rules: [] },
        ],
      }}
    />
  );
  const ruleGroups = screen.getAllByTestId(TestID.ruleGroup);
  await user.keyboard('{Alt>}');
  simulateDragDrop(
    getHandlerId(ruleGroups[2], 'drag'),
    getHandlerId(ruleGroups[1], 'drop'),
    getDndBackend()
  );
  await user.keyboard('{/Alt}');
  for (const rg of ruleGroups) {
    expect(rg).not.toHaveClass(sc.dndDragging);
    expect(rg).not.toHaveClass(sc.dndOver);
  }
  expect(onQueryChange).toHaveBeenCalledWith({
    combinator: 'and',
    rules: [
      { combinator: 'and', rules: [{ id: expect.any(String), combinator: 'and', rules: [] }] },
      { combinator: 'and', rules: [] },
    ],
  });
});

it('groups a dropped rule group on a rule group', async () => {
  const onQueryChange = jest.fn();
  render(
    <QBforDnD
      onQueryChange={onQueryChange}
      query={{
        combinator: 'and',
        rules: [
          { combinator: 'and', rules: [] },
          { combinator: 'and', rules: [] },
        ],
      }}
    />
  );
  const ruleGroups = screen.getAllByTestId(TestID.ruleGroup);
  await user.keyboard('{Control>}');
  simulateDragDrop(
    getHandlerId(ruleGroups[2], 'drag'),
    getHandlerId(ruleGroups[1], 'drop'),
    getDndBackend()
  );
  await user.keyboard('{/Control}');
  for (const rg of ruleGroups) {
    expect(rg).not.toHaveClass(sc.dndDragging);
    expect(rg).not.toHaveClass(sc.dndOver);
  }
  expect(onQueryChange).toHaveBeenCalledWith({
    combinator: 'and',
    rules: [
      {
        id: expect.any(String),
        combinator: 'and',
        rules: [
          { id: expect.any(String), combinator: 'and', rules: [] },
          { id: expect.any(String), combinator: 'and', rules: [] },
        ],
      },
    ],
  });
});

it('copies a dropped rule group on a rule group for grouping', async () => {
  const onQueryChange = jest.fn();
  render(
    <QBforDnD
      onQueryChange={onQueryChange}
      query={{
        combinator: 'and',
        rules: [
          { combinator: 'and', rules: [] },
          { combinator: 'and', rules: [] },
        ],
      }}
    />
  );
  const ruleGroups = screen.getAllByTestId(TestID.ruleGroup);
  await user.keyboard('{Control>}{Alt>}');
  simulateDragDrop(
    getHandlerId(ruleGroups[2], 'drag'),
    getHandlerId(ruleGroups[1], 'drop'),
    getDndBackend()
  );
  await user.keyboard('{/Alt}{/Control}');
  for (const rg of ruleGroups) {
    expect(rg).not.toHaveClass(sc.dndDragging);
    expect(rg).not.toHaveClass(sc.dndOver);
  }
  expect(onQueryChange).toHaveBeenCalledWith({
    combinator: 'and',
    rules: [
      {
        id: expect.any(String),
        combinator: 'and',
        rules: [
          { id: expect.any(String), combinator: 'and', rules: [] },
          { id: expect.any(String), combinator: 'and', rules: [] },
        ],
      },
      { combinator: 'and', rules: [] },
    ],
  });
});

it('aborts move if dropped on itself', () => {
  const onQueryChange = jest.fn();
  render(
    <QBforDnD
      onQueryChange={onQueryChange}
      query={{ combinator: 'and', rules: [{ combinator: 'and', rules: [] }] }}
    />
  );
  const ruleGroup = screen.getAllByTestId(TestID.ruleGroup)[1];
  simulateDragDrop(
    getHandlerId(ruleGroup, 'drag'),
    getHandlerId(ruleGroup, 'drop'),
    getDndBackend()
  );
  expect(ruleGroup).not.toHaveClass(sc.dndDragging);
  expect(ruleGroup).not.toHaveClass(sc.dndOver);
  expect(onQueryChange).not.toHaveBeenCalled();
});

it('aborts move if source item is first child of this group', () => {
  const onQueryChange = jest.fn();
  render(
    <QBforDnD
      onQueryChange={onQueryChange}
      query={{
        combinator: 'and',
        rules: [
          {
            combinator: 'and',
            rules: [{ id: 'rg1', combinator: 'and', rules: [] }],
          },
        ],
      }}
    />
  );
  const ruleGroups = screen.getAllByTestId(TestID.ruleGroup);
  simulateDragDrop(
    getHandlerId(ruleGroups[2], 'drag'),
    getHandlerId(ruleGroups[1], 'drop'),
    getDndBackend()
  );
  expect(onQueryChange).not.toHaveBeenCalled();
});

it('handles drops on combinator between rules', () => {
  const onQueryChange = jest.fn();
  render(
    <QBforDnD
      onQueryChange={onQueryChange}
      showCombinatorsBetweenRules
      query={{
        combinator: 'and',
        rules: [
          {
            combinator: 'and',
            rules: [
              { id: '0', field: 'firstName', operator: '=', value: '0' },
              { id: '1', field: 'firstName', operator: '=', value: '1' },
              { id: '2', field: 'firstName', operator: '=', value: '2' },
            ],
          },
        ],
      }}
    />
  );
  const rules = screen.getAllByTestId(TestID.rule);
  const combinatorEls = screen.getAllByTestId(TestID.inlineCombinator);
  simulateDragDrop(
    getHandlerId(rules[2], 'drag'),
    getHandlerId(combinatorEls[1], 'drop'),
    getDndBackend()
  );
  expect(onQueryChange).not.toHaveBeenCalled();
  simulateDragDrop(
    getHandlerId(rules[2], 'drag'),
    getHandlerId(combinatorEls[0], 'drop'),
    getDndBackend()
  );
  expect(onQueryChange).toHaveBeenCalledWith({
    combinator: 'and',
    rules: [
      {
        combinator: 'and',
        rules: [
          { id: '0', field: 'firstName', operator: '=', value: '0' },
          { id: '2', field: 'firstName', operator: '=', value: '2' },
          { id: '1', field: 'firstName', operator: '=', value: '1' },
        ],
      },
    ],
  });
});

it('handles rule group drops on independent combinators', () => {
  const onQueryChange = jest.fn();
  render(
    <QBforDnDIC
      onQueryChange={onQueryChange}
      defaultQuery={{
        rules: [
          {
            rules: [
              { id: 'Steve', field: 'firstName', operator: '=', value: 'Steve' },
              'and',
              { id: 'Vai', field: 'lastName', operator: '=', value: 'Vai' },
            ],
          },
          'and',
          { rules: [] },
        ],
      }}
    />
  );
  const ruleGroups = screen.getAllByTestId(TestID.ruleGroup);
  const combinatorEls = screen.getAllByTestId(TestID.inlineCombinator);
  simulateDragDrop(
    getHandlerId(ruleGroups[2], 'drag'),
    getHandlerId(combinatorEls[0], 'drop'),
    getDndBackendIC()
  );
  expect(ruleGroups[2]).not.toHaveClass(sc.dndDragging);
  expect(combinatorEls[1]).not.toHaveClass(sc.dndOver);
  expect(onQueryChange).toHaveBeenCalledWith({
    id: expect.any(String),
    rules: [
      {
        id: expect.any(String),
        rules: [
          { id: 'Steve', field: 'firstName', operator: '=', value: 'Steve' },
          'and',
          { id: expect.any(String), rules: [] },
          'and',
          { id: 'Vai', field: 'lastName', operator: '=', value: 'Vai' },
        ],
      },
    ],
  });
});

it('handles rule drops on independent combinators', () => {
  const onQueryChange = jest.fn();
  render(
    <QBforDnDIC
      onQueryChange={onQueryChange}
      defaultQuery={{
        rules: [
          {
            rules: [
              { id: 'Steve', field: 'firstName', operator: '=', value: 'Steve' },
              'and',
              { id: 'Vai', field: 'lastName', operator: '=', value: 'Vai' },
              'and',
              { id: '28', field: 'age', operator: '>', value: 28 },
            ],
          },
        ],
      }}
    />
  );
  const rules = screen.getAllByTestId(TestID.rule);
  const combinatorEls = screen.getAllByTestId(TestID.inlineCombinator);
  simulateDragDrop(
    getHandlerId(rules[2], 'drag'),
    getHandlerId(combinatorEls[0], 'drop'),
    getDndBackendIC()
  );
  expect(onQueryChange).toHaveBeenCalledWith({
    id: expect.any(String),
    rules: [
      {
        id: expect.any(String),
        rules: [
          { id: 'Steve', field: 'firstName', operator: '=', value: 'Steve' },
          'and',
          { id: '28', field: 'age', operator: '>', value: 28 },
          'and',
          { id: 'Vai', field: 'lastName', operator: '=', value: 'Vai' },
        ],
      },
    ],
  });
});

it('prevents drops when locked', () => {
  const onQueryChange = jest.fn();
  render(
    <QBforDnD
      onQueryChange={onQueryChange}
      disabled={[[0]]}
      query={{
        combinator: 'and',
        rules: [
          { combinator: 'and', rules: [] },
          { combinator: 'and', rules: [] },
        ],
      }}
    />
  );
  const ruleGroups = screen.getAllByTestId(TestID.ruleGroup);
  expect(ruleGroups[1]).toHaveClass(sc.disabled);
  simulateDragDrop(
    getHandlerId(ruleGroups[2], 'drag'),
    getHandlerId(ruleGroups[1], 'drop'),
    getDndBackend()
  );
  expect(onQueryChange).not.toHaveBeenCalled();
});

it('respects custom canDrop', () => {
  const onQueryChange = jest.fn();
  const canDrop = jest.fn(() => false);
  render(
    <QBforDnD
      canDrop={canDrop}
      onQueryChange={onQueryChange}
      query={{
        combinator: 'and',
        rules: [
          { combinator: 'and', rules: [] },
          { combinator: 'and', rules: [] },
        ],
      }}
    />
  );
  const ruleGroups = screen.getAllByTestId(TestID.ruleGroup);
  simulateDragDrop(
    getHandlerId(ruleGroups[2], 'drag'),
    getHandlerId(ruleGroups[1], 'drop'),
    getDndBackend()
  );
  expect(canDrop).toHaveBeenCalledWith({
    dragging: { path: [1], combinator: 'and', rules: [], qbId: expect.any(String) },
    hovering: {
      path: [0],
      combinator: 'and',
      rules: [],
      qbId: expect.any(String),
      id: expect.any(String),
    },
  });
  expect(onQueryChange).not.toHaveBeenCalled();
});

it('respects custom canDrop on inline combinators', () => {
  const onQueryChange = jest.fn();
  const canDrop = jest.fn(() => false);
  render(
    <QBforDnD
      canDrop={canDrop}
      onQueryChange={onQueryChange}
      showCombinatorsBetweenRules
      defaultQuery={{
        combinator: 'and',
        rules: [
          { combinator: 'and', rules: [] },
          { combinator: 'and', rules: [] },
          { combinator: 'and', rules: [], not: true },
        ],
      }}
    />
  );
  const ruleGroups = screen.getAllByTestId(TestID.ruleGroup);
  const combinators = screen.getAllByTestId(TestID.inlineCombinator);
  simulateDragDrop(
    getHandlerId(ruleGroups[3], 'drag'),
    getHandlerId(combinators[0], 'drop'),
    getDndBackend()
  );
  expect(canDrop).toHaveBeenCalledWith({
    dragging: {
      path: [2],
      combinator: 'and',
      rules: [],
      not: true,
      qbId: expect.any(String),
      id: expect.any(String),
    },
    hovering: {
      path: [0],
      combinator: 'and',
      rules: [],
      qbId: expect.any(String),
      id: expect.any(String),
    },
  });
  expect(onQueryChange).not.toHaveBeenCalled();
});

it('respects custom canDrop on independent combinators', () => {
  const onQueryChange = jest.fn();
  const canDrop = jest.fn(() => false);
  render(
    <QBforDnDIC
      canDrop={canDrop}
      onQueryChange={onQueryChange}
      defaultQuery={{
        rules: [{ rules: [] }, 'and', { rules: [] }, 'or', { rules: [], not: true }],
      }}
    />
  );
  const ruleGroups = screen.getAllByTestId(TestID.ruleGroup);
  const combinators = screen.getAllByTestId(TestID.inlineCombinator);
  simulateDragDrop(
    getHandlerId(ruleGroups[3], 'drag'),
    getHandlerId(combinators[0], 'drop'),
    getDndBackendIC()
  );
  expect(canDrop).toHaveBeenCalledWith({
    dragging: { path: [4], rules: [], not: true, qbId: expect.any(String), id: expect.any(String) },
    hovering: { path: [0], rules: [], qbId: expect.any(String), id: expect.any(String) },
  });
  expect(onQueryChange).not.toHaveBeenCalled();
});

it('respects updated canDrop function between renders', () => {
  const firstCanDrop = jest.fn(() => false);
  const secondCanDrop = jest.fn(() => false);

  const query = {
    combinator: 'and',
    rules: [
      { combinator: 'and', rules: [] },
      { combinator: 'and', rules: [] },
    ],
  };

  const { rerender } = render(<QBforDnD canDrop={firstCanDrop} query={query} />);

  // First drag attempt - should use firstCanDrop
  const ruleGroups = screen.getAllByTestId(TestID.ruleGroup);
  simulateDragDrop(
    getHandlerId(ruleGroups[2], 'drag'),
    getHandlerId(ruleGroups[1], 'drop'),
    getDndBackend()
  );

  const firstCanDropCallCount = firstCanDrop.mock.calls.length;

  // Rerender with secondCanDrop
  rerender(<QBforDnD canDrop={secondCanDrop} query={query} />);

  // Second drag attempt - should use secondCanDrop
  simulateDragDrop(
    getHandlerId(ruleGroups[2], 'drag'),
    getHandlerId(ruleGroups[1], 'drop'),
    getDndBackend()
  );

  // Verify that only secondCanDrop was called in the second attempt
  expect(firstCanDrop).toHaveBeenCalledTimes(firstCanDropCallCount);
  expect(secondCanDrop).toHaveBeenCalled();
});
