import { act, render, screen } from '@testing-library/react';
import * as React from 'react';
import * as reactDnDHTML5Backend from 'react-dnd-html5-backend/dist/index.js';
import {
  simulateDrag,
  simulateDragDrop,
  simulateDragHover,
  wrapWithTestBackend,
} from 'react-dnd-test-utils';
import * as reactDnD from 'react-dnd/dist/index.js';
import type {
  FullCombinator,
  FullField,
  FullOperator,
  QueryBuilderProps,
  RuleGroupType,
} from 'react-querybuilder';
import { QueryBuilder, TestID, standardClassnames as sc } from 'react-querybuilder';
import { userEventSetup } from 'react-querybuilder/genericTests/index';
import { QueryBuilderDnD } from './QueryBuilderDnD';
import type { QueryBuilderDndProps } from './types';

const user = userEventSetup();

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

// This is just a type guard against `undefined`
const getDndBackend = () => getDndBackendOriginal()!;

const getHandlerId = (el: HTMLElement, dragDrop: 'drag' | 'drop') => () =>
  el.getAttribute(`data-${dragDrop}monitorid`);

it('does not have the drag class if not dragging', () => {
  render(<QBforDnD addRuleToNewGroups />);
  const rule = screen.getByTestId(TestID.rule);
  expect(rule).not.toHaveClass(sc.dndDragging);
});

it('has the drag class if dragging', () => {
  render(<QBforDnD addRuleToNewGroups />);
  const rule = screen.getByTestId(TestID.rule);
  simulateDrag(getHandlerId(rule, 'drag'), getDndBackend());
  expect(rule).toHaveClass(sc.dndDragging);
  act(() => {
    getDndBackend().simulateEndDrag();
  });
});

it('has the over class if hovered', () => {
  render(
    <QBforDnD
      defaultQuery={{
        combinator: 'and',
        rules: [
          { field: 'f1', operator: '=', value: 'v1' },
          { field: 'f1', operator: '=', value: 'v1' },
        ],
      }}
    />
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

it('handles a dropped rule', () => {
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
  expect(onQueryChange).toHaveBeenCalledWith(
    expect.objectContaining({
      rules: expect.arrayContaining([
        expect.objectContaining({ field: 'f2', operator: '=', value: 'v2' }),
        expect.objectContaining({ field: 'f1', operator: '=', value: 'v1' }),
      ]),
    })
  );
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
  expect(onQueryChange).toHaveBeenCalledWith(
    expect.objectContaining({
      rules: expect.arrayContaining([
        expect.objectContaining({ field: 'f2', operator: '=', value: 'v2' }),
        expect.objectContaining({ field: 'f1', operator: '=', value: 'v1' }),
        expect.objectContaining({ field: 'f2', operator: '=', value: 'v2' }),
      ]),
    })
  );
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
  expect(onQueryChange).toHaveBeenCalledWith(
    expect.objectContaining({
      rules: expect.arrayContaining([
        expect.objectContaining({ field: 'f2', operator: '=', value: 'v2' }),
        expect.objectContaining({ field: 'f1', operator: '=', value: 'v1' }),
      ]),
    })
  );
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
          { field: 'f1', operator: '=', value: 'v1' },
          { field: 'f2', operator: '=', value: 'v2' },
        ],
      }}
    />
  );
  const rules = screen.getAllByTestId(TestID.rule);
  simulateDragDrop(getHandlerId(rules[1], 'drag'), getHandlerId(rules[0], 'drop'), getDndBackend());
  expect(canDrop).toHaveBeenCalledWith({
    dragging: expect.objectContaining({ path: [1], field: 'f2', operator: '=', value: 'v2' }),
    hovering: expect.objectContaining({ path: [0], field: 'f1', operator: '=', value: 'v1' }),
  });
  expect(onQueryChange).not.toHaveBeenCalled();
});
