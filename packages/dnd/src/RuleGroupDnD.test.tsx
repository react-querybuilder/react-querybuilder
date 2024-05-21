import { act, render, screen } from '@testing-library/react';
import * as React from 'react';
import * as reactDnDHTML5Backend from 'react-dnd-html5-backend/dist/index.js';
import { simulateDrag, simulateDragDrop, wrapWithTestBackend } from 'react-dnd-test-utils';
import * as reactDnD from 'react-dnd/dist/index.js';
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

const [QBforDnD, getDndBackendOriginal] = wrapWithTestBackend(
  ({
    canDrop,
    ...props
  }: QueryBuilderProps<RuleGroupType, FullField, FullOperator, FullCombinator> &
    Pick<QueryBuilderDndProps, 'canDrop'>) => (
    <QueryBuilderDnD dnd={{ ...reactDnD, ...reactDnDHTML5Backend }} canDrop={canDrop}>
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
    <QueryBuilderDnD dnd={{ ...reactDnD, ...reactDnDHTML5Backend }} canDrop={canDrop}>
      <QueryBuilder enableMountQueryChange={false} {...props} />
    </QueryBuilderDnD>
  )
);

// This is just a type guard against `undefined`
const getDndBackend = () => getDndBackendOriginal()!;
const getDndBackendIC = () => getDndBackendOriginalIC()!;

const getHandlerId = (el: HTMLElement, dragDrop: 'drag' | 'drop') => () =>
  el.getAttribute(`data-${dragDrop}monitorid`);

it('does not have the drag class if not dragging', () => {
  render(<QBforDnD />);
  const ruleGroup = screen.getByTestId(TestID.ruleGroup);
  expect(ruleGroup).not.toHaveClass(sc.dndDragging);
});

it('has the drag class if dragging', () => {
  render(<QBforDnD query={{ combinator: 'and', rules: [{ combinator: 'and', rules: [] }] }} />);
  const ruleGroup = screen.getAllByTestId(TestID.ruleGroup)[1];
  simulateDrag(getHandlerId(ruleGroup, 'drag'), getDndBackend());
  expect(ruleGroup).toHaveClass(sc.dndDragging);
  act(() => {
    getDndBackend().simulateEndDrag();
  });
});

it('handles a dropped rule group', () => {
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
  for (const x of [0, 1, 2]) {
    expect(ruleGroups[x]).not.toHaveClass(sc.dndDragging);
    expect(ruleGroups[x]).not.toHaveClass(sc.dndOver);
  }
  expect(onQueryChange).toHaveBeenCalledWith(
    expect.objectContaining({
      rules: expect.arrayContaining([
        expect.objectContaining({
          rules: expect.arrayContaining([
            expect.objectContaining({ combinator: 'and', rules: [] }),
          ]),
        }),
      ]),
    })
  );
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
  expect(onQueryChange).toHaveBeenCalledWith(
    expect.objectContaining({
      rules: expect.arrayContaining([
        expect.objectContaining({
          rules: expect.arrayContaining([
            expect.objectContaining({ id: 'Steve' }),
            'and',
            expect.objectContaining({ rules: [] }),
            'and',
            expect.objectContaining({ id: 'Steve' }),
          ]),
        }),
      ]),
    })
  );
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
  expect(onQueryChange).toHaveBeenCalledWith(
    expect.objectContaining({
      rules: expect.arrayContaining([
        expect.objectContaining({
          rules: expect.arrayContaining([
            expect.objectContaining({ id: 'Steve' }),
            'and',
            expect.objectContaining({ id: '28' }),
            'and',
            expect.objectContaining({ id: 'Vai' }),
          ]),
        }),
      ]),
    })
  );
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
          { combinator: 'and', rules: [], disabled: true },
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
    dragging: expect.objectContaining({ path: [1], combinator: 'and', rules: [] }),
    hovering: expect.objectContaining({ path: [0], combinator: 'and', rules: [] }),
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
    dragging: expect.objectContaining({ path: [2], combinator: 'and', rules: [], not: true }),
    hovering: expect.objectContaining({ path: [0], combinator: 'and', rules: [] }),
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
    dragging: expect.objectContaining({ path: [4], rules: [], not: true }),
    hovering: expect.objectContaining({ path: [0], rules: [] }),
  });
  expect(onQueryChange).not.toHaveBeenCalled();
});
