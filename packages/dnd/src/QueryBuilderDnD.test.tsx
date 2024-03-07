import { act, render, screen } from '@testing-library/react';
import * as React from 'react';
import * as reactDnDHTML5Backend from 'react-dnd-html5-backend/dist/index.js';
import {
  simulateDragDrop,
  simulateDragHover,
  wrapWithTestBackend,
} from 'react-dnd-test-utils/dist/index.js';
import * as reactDnD from 'react-dnd/dist/index.js';
import type {
  FullCombinator,
  FullField,
  FullOperator,
  QueryBuilderProps,
  RuleGroupType,
  RuleGroupTypeIC,
} from 'react-querybuilder';
import {
  QueryBuilder,
  TestID,
  getCompatContextProvider,
  standardClassnames,
} from 'react-querybuilder';
import { consoleMocks } from 'react-querybuilder/genericTests/index';
import { QueryBuilderDnD, QueryBuilderDndWithoutProvider } from './QueryBuilderDnD';

const getHandlerId = (el: HTMLElement, dragDrop: 'drag' | 'drop') => () =>
  el.getAttribute(`data-${dragDrop}monitorid`);

consoleMocks();

it('renders base QueryBuilder without enableDragAndDrop prop', async () => {
  await act(async () => {
    render(
      <QueryBuilderDnD>
        <QueryBuilder />
      </QueryBuilderDnD>
    );
  });
  expect(screen.getByTestId(TestID.ruleGroup).parentElement?.dataset.dnd).toBe('enabled');
});

it('acts as a pass-through for context', async () => {
  const combinatorSelectorClass = 'hello-dnd-world';
  const combinatorSelectorText = 'Add rule';
  const combinatorSelector = () => (
    <button className={combinatorSelectorClass}>{combinatorSelectorText}</button>
  );
  const TestCompatContextProvider = getCompatContextProvider({
    key: 'test',
    controlElements: { combinatorSelector },
  });
  await act(async () => {
    render(
      <TestCompatContextProvider>
        <QueryBuilderDnD>
          <QueryBuilder />
        </QueryBuilderDnD>
      </TestCompatContextProvider>
    );
  });
  expect(screen.getByText(combinatorSelectorText)).toHaveClass(combinatorSelectorClass);
});

it('renders base QueryBuilder without dnd provider without enableDragAndDrop prop', async () => {
  const [QBWoDndProvider] = wrapWithTestBackend(QueryBuilderDndWithoutProvider);
  await act(async () => {
    render(
      <QBWoDndProvider>
        <QueryBuilder />
      </QBWoDndProvider>
    );
  });
  expect(screen.getByTestId(TestID.ruleGroup).parentElement).toHaveAttribute(
    'data-dnd',
    'disabled'
  );
});

it('renders with dnd provider without dnd prop', async () => {
  await act(async () => {
    render(
      <QueryBuilderDnD>
        <QueryBuilder enableDragAndDrop />
      </QueryBuilderDnD>
    );
  });
  expect(screen.getByTestId(TestID.ruleGroup)).toBeInTheDocument();
});

it('renders without dnd provider without dnd prop', async () => {
  const [QBWoDndProvider] = wrapWithTestBackend(QueryBuilderDndWithoutProvider);
  await act(async () => {
    render(
      <QBWoDndProvider>
        <QueryBuilder enableDragAndDrop />
      </QBWoDndProvider>
    );
  });
  expect(screen.getByTestId(TestID.ruleGroup)).toBeInTheDocument();
});

// The drag-and-drop tests run once for QueryBuilderOriginal and once again
// for QueryBuilderDndWithoutProvider.
describe.each([{ QBctx: QueryBuilderDnD }, { QBctx: QueryBuilderDndWithoutProvider }])(
  'enableDragAndDrop ($QBctx.displayName)',
  ({ QBctx }) => {
    const [QBforDnD, getBackend] = wrapWithTestBackend(
      (props: QueryBuilderProps<RuleGroupType, FullField, FullOperator, FullCombinator>) => (
        <QBctx dnd={{ ...reactDnD, ...reactDnDHTML5Backend }}>
          <QueryBuilder {...props} />
        </QBctx>
      )
    );
    const [QBforDnDIC, getBackendIC] = wrapWithTestBackend(
      (props: QueryBuilderProps<RuleGroupTypeIC, FullField, FullOperator, FullCombinator>) => (
        <QBctx dnd={{ ...reactDnD, ...reactDnDHTML5Backend }}>
          <QueryBuilder {...props} />
        </QBctx>
      )
    );
    const gDnDBe = () => getBackend()!;
    const gDnDBeIC = () => getBackendIC()!;
    describe('standard rule groups', () => {
      it('sets data-dnd attribute appropriately', () => {
        const { container, rerender } = render(<QBforDnD enableDragAndDrop={false} />);
        expect(container.querySelectorAll('div')[0].dataset.dnd).toBe('disabled');
        rerender(<QBforDnD enableDragAndDrop />);
        expect(container.querySelectorAll('div')[0].dataset.dnd).toBe('enabled');
      });

      it('moves a rule down within the same group', () => {
        const onQueryChange = jest.fn<never, [RuleGroupType]>();
        render(
          <QBforDnD
            onQueryChange={onQueryChange}
            enableDragAndDrop
            query={{
              combinator: 'and',
              rules: [
                { id: '0', field: 'field0', operator: '=', value: '0' },
                { id: '1', field: 'field1', operator: '=', value: '1' },
              ],
            }}
          />
        );
        const rules = screen.getAllByTestId(TestID.rule);
        simulateDragDrop(getHandlerId(rules[0], 'drag'), getHandlerId(rules[1], 'drop'), gDnDBe());
        expect(onQueryChange).toHaveBeenCalledTimes(2);
        expect(onQueryChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            rules: [expect.objectContaining({ id: '1' }), expect.objectContaining({ id: '0' })],
          })
        );
      });

      it('moves a rule to a different group with a common ancestor', () => {
        const onQueryChange = jest.fn<never, [RuleGroupType]>();
        render(
          <QBforDnD
            onQueryChange={onQueryChange}
            enableDragAndDrop
            query={{
              combinator: 'and',
              rules: [
                {
                  id: '0',
                  combinator: 'and',
                  rules: [
                    { id: '1', field: 'field0', operator: '=', value: '1' },
                    { id: '2', field: 'field0', operator: '=', value: '2' },
                    { id: '3', combinator: 'and', rules: [] },
                  ],
                },
              ],
            }}
          />
        );
        const rule = screen.getAllByTestId(TestID.rule)[1]; // id 2
        const ruleGroup = screen.getAllByTestId(TestID.ruleGroup)[2]; // id 3
        simulateDragDrop(getHandlerId(rule, 'drag'), getHandlerId(ruleGroup, 'drop'), gDnDBe());
        expect(onQueryChange).toHaveBeenCalledTimes(2);
        expect(onQueryChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            rules: [
              expect.objectContaining({
                rules: expect.arrayContaining([
                  expect.anything(),
                  expect.objectContaining({
                    rules: [expect.objectContaining({ id: '2' })],
                  }),
                ]),
              }),
            ],
          })
        );
      });
    });

    describe('independent combinators', () => {
      it('swaps the first rule with the last within the same group', () => {
        const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
        render(
          <QBforDnDIC
            onQueryChange={onQueryChange}
            enableDragAndDrop
            query={{
              rules: [
                { field: 'field0', operator: '=', value: '0' },
                'and',
                { field: 'field1', operator: '=', value: '1' },
              ],
            }}
          />
        );
        const rules = screen.getAllByTestId(TestID.rule);
        simulateDragDrop(
          getHandlerId(rules[0], 'drag'),
          getHandlerId(rules[1], 'drop'),
          gDnDBeIC()
        );
        expect(onQueryChange).toHaveBeenCalledTimes(2);
        expect(onQueryChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            rules: [
              expect.objectContaining({ field: 'field1', operator: '=', value: '1' }),
              'and',
              expect.objectContaining({ field: 'field0', operator: '=', value: '0' }),
            ],
          })
        );
      });

      it('swaps the last rule with the first within the same group', () => {
        const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
        render(
          <QBforDnDIC
            onQueryChange={onQueryChange}
            enableDragAndDrop
            query={{
              rules: [
                { field: 'field0', operator: '=', value: '0' },
                'and',
                { field: 'field1', operator: '=', value: '1' },
              ],
            }}
          />
        );
        const rules = screen.getAllByTestId(TestID.rule);
        const ruleGroup = screen.getAllByTestId(TestID.ruleGroup)[0];
        simulateDragDrop(
          getHandlerId(rules[1], 'drag'),
          getHandlerId(ruleGroup, 'drop'),
          gDnDBeIC()
        );
        expect(onQueryChange).toHaveBeenCalledTimes(2);
        expect(onQueryChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            rules: [
              expect.objectContaining({ field: 'field1', operator: '=', value: '1' }),
              'and',
              expect.objectContaining({ field: 'field0', operator: '=', value: '0' }),
            ],
          })
        );
      });

      it('moves a rule from first to last within the same group', () => {
        const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
        render(
          <QBforDnDIC
            onQueryChange={onQueryChange}
            enableDragAndDrop
            query={{
              rules: [
                { field: 'field0', operator: '=', value: '0' },
                'and',
                { field: 'field1', operator: '=', value: '1' },
                'and',
                { field: 'field2', operator: '=', value: '2' },
              ],
            }}
          />
        );
        const rules = screen.getAllByTestId(TestID.rule);
        simulateDragDrop(
          getHandlerId(rules[0], 'drag'),
          getHandlerId(rules[2], 'drop'),
          gDnDBeIC()
        );
        expect(onQueryChange).toHaveBeenCalledTimes(2);
        expect(onQueryChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            rules: [
              expect.objectContaining({ field: 'field1', operator: '=', value: '1' }),
              'and',
              expect.objectContaining({ field: 'field2', operator: '=', value: '2' }),
              'and',
              expect.objectContaining({ field: 'field0', operator: '=', value: '0' }),
            ],
          })
        );
      });

      it('moves a rule from last to first within the same group', () => {
        const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
        render(
          <QBforDnDIC
            onQueryChange={onQueryChange}
            enableDragAndDrop
            query={{
              rules: [
                { field: 'field0', operator: '=', value: '0' },
                'and',
                { field: 'field1', operator: '=', value: '1' },
                'and',
                { field: 'field2', operator: '=', value: '2' },
              ],
            }}
          />
        );
        const rules = screen.getAllByTestId(TestID.rule);
        const ruleGroup = screen.getAllByTestId(TestID.ruleGroup)[0];
        simulateDragDrop(
          getHandlerId(rules[2], 'drag'),
          getHandlerId(ruleGroup, 'drop'),
          gDnDBeIC()
        );
        expect(onQueryChange).toHaveBeenCalledTimes(2);
        expect(onQueryChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            rules: [
              expect.objectContaining({ field: 'field2', operator: '=', value: '2' }),
              'and',
              expect.objectContaining({ field: 'field0', operator: '=', value: '0' }),
              'and',
              expect.objectContaining({ field: 'field1', operator: '=', value: '1' }),
            ],
          })
        );
      });

      it('moves a rule from last to middle by dropping on inline combinator', () => {
        const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
        render(
          <QBforDnDIC
            onQueryChange={onQueryChange}
            enableDragAndDrop
            query={{
              rules: [
                { field: 'field0', operator: '=', value: '0' },
                'and',
                { field: 'field1', operator: '=', value: '1' },
                'and',
                { field: 'field2', operator: '=', value: '2' },
              ],
            }}
          />
        );
        const rules = screen.getAllByTestId(TestID.rule);
        const combinators = screen.getAllByTestId(TestID.inlineCombinator);
        simulateDragDrop(
          getHandlerId(rules[2], 'drag'),
          getHandlerId(combinators[0], 'drop'),
          gDnDBeIC()
        );
        expect(onQueryChange).toHaveBeenCalledTimes(2);
        expect(onQueryChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            rules: [
              expect.objectContaining({ field: 'field0', operator: '=', value: '0' }),
              'and',
              expect.objectContaining({ field: 'field2', operator: '=', value: '2' }),
              'and',
              expect.objectContaining({ field: 'field1', operator: '=', value: '1' }),
            ],
          })
        );
      });

      it('moves a first-child rule to a different group as the first child', () => {
        const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
        render(
          <QBforDnDIC
            onQueryChange={onQueryChange}
            enableDragAndDrop
            query={{
              rules: [
                { field: 'field0', operator: '=', value: '0' },
                'and',
                {
                  rules: [
                    { field: 'field1', operator: '=', value: '1' },
                    'and',
                    { field: 'field2', operator: '=', value: '2' },
                  ],
                },
              ],
            }}
          />
        );
        const rule = screen.getAllByTestId(TestID.rule)[0];
        const ruleGroup = screen.getAllByTestId(TestID.ruleGroup)[1];
        simulateDragDrop(getHandlerId(rule, 'drag'), getHandlerId(ruleGroup, 'drop'), gDnDBeIC());
        expect(onQueryChange).toHaveBeenCalledTimes(2);
        expect(onQueryChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            rules: [
              expect.objectContaining({
                rules: [
                  expect.objectContaining({ field: 'field0', operator: '=', value: '0' }),
                  'and',
                  expect.objectContaining({ field: 'field1', operator: '=', value: '1' }),
                  'and',
                  expect.objectContaining({ field: 'field2', operator: '=', value: '2' }),
                ],
              }),
            ],
          })
        );
      });

      it('moves a middle-child rule to a different group as a middle child', () => {
        const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
        render(
          <QBforDnDIC
            onQueryChange={onQueryChange}
            enableDragAndDrop
            query={{
              rules: [
                { field: 'field0', operator: '=', value: '0' },
                'and',
                { field: 'field1', operator: '=', value: '1' },
                'and',
                { field: 'field2', operator: '=', value: '2' },
                'and',
                {
                  rules: [
                    { field: 'field3', operator: '=', value: '3' },
                    'and',
                    { field: 'field4', operator: '=', value: '4' },
                  ],
                },
              ],
            }}
          />
        );
        const dragRule = screen.getAllByTestId(TestID.rule)[1];
        const dropRule = screen.getAllByTestId(TestID.rule)[3];
        simulateDragDrop(
          getHandlerId(dragRule, 'drag'),
          getHandlerId(dropRule, 'drop'),
          gDnDBeIC()
        );
        expect(onQueryChange).toHaveBeenCalledTimes(2);
        expect(onQueryChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            rules: [
              expect.objectContaining({ field: 'field0', operator: '=', value: '0' }),
              'and',
              expect.objectContaining({ field: 'field2', operator: '=', value: '2' }),
              'and',
              expect.objectContaining({
                rules: [
                  expect.objectContaining({ field: 'field3', operator: '=', value: '3' }),
                  'and',
                  expect.objectContaining({ field: 'field1', operator: '=', value: '1' }),
                  'and',
                  expect.objectContaining({ field: 'field4', operator: '=', value: '4' }),
                ],
              }),
            ],
          })
        );
      });
    });
  }
);

it('does not pass dnd classes down to nested rules and groups', async () => {
  const [QueryBuilderWrapped, getDndBackend] = wrapWithTestBackend(
    (props: QueryBuilderProps<RuleGroupType, FullField, FullOperator, FullCombinator>) => (
      <QueryBuilderDnD dnd={{ ...reactDnD, ...reactDnDHTML5Backend }}>
        <QueryBuilder {...props} />
      </QueryBuilderDnD>
    )
  );
  render(
    <QueryBuilderWrapped
      fields={[{ name: 'field1', label: 'Field 1' }]}
      enableDragAndDrop
      query={{
        combinator: 'and',
        rules: [
          { field: 'field1', operator: '=', value: '1' },
          { field: 'field1', operator: '=', value: '1' },
          {
            combinator: 'and',
            rules: [
              { field: 'field1', operator: '=', value: '1' },
              {
                combinator: 'and',
                rules: [
                  { field: 'field1', operator: '=', value: '1' },
                  { field: 'field1', operator: '=', value: '1' },
                ],
              },
            ],
          },
        ],
      }}
    />
  );
  const dragRule = screen.getAllByTestId(TestID.rule)[4];
  const dropGroup = screen.getAllByTestId(TestID.ruleGroup)[0];
  simulateDragHover(
    getHandlerId(dragRule, 'drag'),
    getHandlerId(dropGroup, 'drop'),
    getDndBackend()!
  );
  for (let ruleIdx = 0; ruleIdx < 4; ruleIdx++) {
    expect(screen.getAllByTestId(TestID.rule)[ruleIdx]).not.toHaveClass(standardClassnames.dndOver);
  }
  for (let ruleGroupIdx = 1; ruleGroupIdx < 2; ruleGroupIdx++) {
    expect(screen.getAllByTestId(TestID.rule)[ruleGroupIdx]).not.toHaveClass(
      standardClassnames.dndOver
    );
  }
});

it('prevents changes when disabled', async () => {
  const [QueryBuilderWrapped, getDndBackend] = wrapWithTestBackend(
    (props: QueryBuilderProps<RuleGroupTypeIC, FullField, FullOperator, FullCombinator>) => (
      <QueryBuilderDnD dnd={{ ...reactDnD, ...reactDnDHTML5Backend }}>
        <QueryBuilder {...props} />
      </QueryBuilderDnD>
    )
  );
  const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
  render(
    <QueryBuilderWrapped
      fields={[
        { name: 'field0', label: 'Field 0' },
        { name: 'field1', label: 'Field 1' },
        { name: 'field2', label: 'Field 2' },
        { name: 'field3', label: 'Field 3' },
        { name: 'field4', label: 'Field 4' },
      ]}
      enableMountQueryChange={false}
      onQueryChange={onQueryChange}
      enableDragAndDrop
      disabled
      query={{
        rules: [
          { field: 'field0', operator: '=', value: '0' },
          'and',
          { field: 'field1', operator: '=', value: '1' },
          'and',
          { field: 'field2', operator: '=', value: '2' },
          'and',
          {
            rules: [
              { field: 'field3', operator: '=', value: '3' },
              'and',
              { field: 'field4', operator: '=', value: '4' },
            ],
          },
        ],
      }}
    />
  );
  const dragRule = screen.getAllByTestId(TestID.rule)[1];
  const dropRule = screen.getAllByTestId(TestID.rule)[3];
  expect(() =>
    simulateDragDrop(
      getHandlerId(dragRule, 'drag'),
      getHandlerId(dropRule, 'drop'),
      getDndBackend()!
    )
  ).toThrow();
  expect(onQueryChange).not.toHaveBeenCalled();
});
