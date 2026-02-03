import { userEventSetup } from '@rqb-testing';
import { act, render, screen } from '@testing-library/react';
import * as React from 'react';
import * as reactDnD from 'react-dnd';
import * as reactDnDHTML5Backend from 'react-dnd-html5-backend';
import { simulateDragDrop, simulateDragHover, wrapWithTestBackend } from 'react-dnd-test-utils';
import * as reactDnDTouchBackend from 'react-dnd-touch-backend';
import type {
  Field,
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
import { QueryBuilderDnD, QueryBuilderDndWithoutProvider } from './QueryBuilderDnD';

const user = userEventSetup();

const getHandlerId = (el: HTMLElement, dragDrop: 'drag' | 'drop') => () =>
  el.getAttribute(`data-${dragDrop}monitorid`);

afterEach(() => {
  // Clear pressed keys
  globalThis.dispatchEvent(new Event('blur'));
});

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
  expect(screen.getByTestId(TestID.ruleGroup).parentElement?.dataset.dnd).toBe('enabled');
});

it('renders with dnd provider without dnd prop', async () => {
  await act(async () => {
    render(
      <QueryBuilderDnD>
        <QueryBuilder />
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
        <QueryBuilder />
      </QBWoDndProvider>
    );
  });
  expect(screen.getByTestId(TestID.ruleGroup).parentElement?.dataset.dnd).toBe('enabled');
});

// The drag-and-drop tests run once for QueryBuilderDnD and once again
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
        <QBctx dnd={{ ...reactDnD, ...reactDnDTouchBackend }} hideDefaultDragPreview>
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
        rerender(<QBforDnD />);
        expect(container.querySelectorAll('div')[0].dataset.dnd).toBe('enabled');
      });

      it('moves a rule down within the same group', () => {
        const onQueryChange = jest.fn<never, [RuleGroupType]>();
        render(
          <QBforDnD
            onQueryChange={onQueryChange}
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
        expect(onQueryChange).toHaveBeenLastCalledWith({
          combinator: 'and',
          rules: [
            { id: '1', field: 'field1', operator: '=', value: '1' },
            { id: '0', field: 'field0', operator: '=', value: '0' },
          ],
        });
      });

      it('moves a rule to a different group with a common ancestor', () => {
        const onQueryChange = jest.fn<never, [RuleGroupType]>();
        render(
          <QBforDnD
            onQueryChange={onQueryChange}
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
        expect(onQueryChange).toHaveBeenLastCalledWith({
          combinator: 'and',
          rules: [
            {
              id: '0',
              combinator: 'and',
              rules: [
                { id: '1', field: 'field0', operator: '=', value: '1' },
                {
                  id: '3',
                  combinator: 'and',
                  rules: [{ id: '2', field: 'field0', operator: '=', value: '2' }],
                },
              ],
            },
          ],
        });
      });
    });

    describe('independent combinators', () => {
      it('swaps the first rule with the last within the same group', () => {
        const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
        render(
          <QBforDnDIC
            onQueryChange={onQueryChange}
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
        expect(onQueryChange).toHaveBeenLastCalledWith({
          rules: [
            { field: 'field1', operator: '=', value: '1' },
            'and',
            { field: 'field0', operator: '=', value: '0' },
          ],
        });
      });

      it('swaps the last rule with the first within the same group', () => {
        const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
        render(
          <QBforDnDIC
            onQueryChange={onQueryChange}
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
        expect(onQueryChange).toHaveBeenLastCalledWith({
          rules: [
            { field: 'field1', operator: '=', value: '1' },
            'and',
            { field: 'field0', operator: '=', value: '0' },
          ],
        });
      });

      it('moves a rule from first to last within the same group', () => {
        const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
        render(
          <QBforDnDIC
            onQueryChange={onQueryChange}
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
        expect(onQueryChange).toHaveBeenLastCalledWith({
          rules: [
            { field: 'field1', operator: '=', value: '1' },
            'and',
            { field: 'field2', operator: '=', value: '2' },
            'and',
            { field: 'field0', operator: '=', value: '0' },
          ],
        });
      });

      it('moves a rule from last to first within the same group', () => {
        const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
        render(
          <QBforDnDIC
            onQueryChange={onQueryChange}
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
        expect(onQueryChange).toHaveBeenLastCalledWith({
          rules: [
            { field: 'field2', operator: '=', value: '2' },
            'and',
            { field: 'field0', operator: '=', value: '0' },
            'and',
            { field: 'field1', operator: '=', value: '1' },
          ],
        });
      });

      it('moves a rule from last to middle by dropping on inline combinator', () => {
        const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
        render(
          <QBforDnDIC
            onQueryChange={onQueryChange}
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
        expect(onQueryChange).toHaveBeenLastCalledWith({
          rules: [
            { field: 'field0', operator: '=', value: '0' },
            'and',
            { field: 'field2', operator: '=', value: '2' },
            'and',
            { field: 'field1', operator: '=', value: '1' },
          ],
        });
      });

      it('copies a rule by dropping on inline combinator with alt key pressed', async () => {
        const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
        render(
          <QBforDnDIC
            onQueryChange={onQueryChange}
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
        await user.keyboard('{Alt>}');
        simulateDragDrop(
          getHandlerId(rules[2], 'drag'),
          getHandlerId(combinators[0], 'drop'),
          gDnDBeIC()
        );
        await user.keyboard('{/Alt}');
        expect(onQueryChange).toHaveBeenCalledTimes(2);
        expect(onQueryChange).toHaveBeenLastCalledWith({
          rules: [
            { field: 'field0', operator: '=', value: '0' },
            'and',
            { id: expect.any(String), field: 'field2', operator: '=', value: '2' },
            'and',
            { field: 'field1', operator: '=', value: '1' },
            'and',
            { field: 'field2', operator: '=', value: '2' },
          ],
        });
      });

      it('moves a first-child rule to a different group as the first child', () => {
        const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
        render(
          <QBforDnDIC
            onQueryChange={onQueryChange}
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
        expect(onQueryChange).toHaveBeenLastCalledWith({
          rules: [
            {
              rules: [
                { field: 'field0', operator: '=', value: '0' },
                'and',
                { field: 'field1', operator: '=', value: '1' },
                'and',
                { field: 'field2', operator: '=', value: '2' },
              ],
            },
          ],
        });
      });

      it('moves a middle-child rule to a different group as a middle child', () => {
        const onQueryChange = jest.fn<never, [RuleGroupTypeIC]>();
        render(
          <QBforDnDIC
            onQueryChange={onQueryChange}
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
        const [, dragRule, , dropRule] = screen.getAllByTestId(TestID.rule);
        simulateDragDrop(
          getHandlerId(dragRule, 'drag'),
          getHandlerId(dropRule, 'drop'),
          gDnDBeIC()
        );
        expect(onQueryChange).toHaveBeenCalledTimes(2);
        expect(onQueryChange).toHaveBeenLastCalledWith({
          rules: [
            { field: 'field0', operator: '=', value: '0' },
            'and',
            { field: 'field2', operator: '=', value: '2' },
            'and',
            {
              rules: [
                { field: 'field3', operator: '=', value: '3' },
                'and',
                { field: 'field1', operator: '=', value: '1' },
                'and',
                { field: 'field4', operator: '=', value: '4' },
              ],
            },
          ],
        });
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
  const [, dragRule, , dropRule] = screen.getAllByTestId(TestID.rule);
  expect(() =>
    simulateDragDrop(
      getHandlerId(dragRule, 'drag'),
      getHandlerId(dropRule, 'drop'),
      getDndBackend()!
    )
  ).toThrow();
  expect(onQueryChange).not.toHaveBeenCalled();
});

it('respects custom copyModeModifierKey', async () => {
  const [QueryBuilderWrapped, getDndBackend] = wrapWithTestBackend(
    (props: QueryBuilderProps<RuleGroupType, FullField, FullOperator, FullCombinator>) => (
      <QueryBuilderDnD
        dnd={{ ...reactDnD, ...reactDnDHTML5Backend }}
        // "ctrl" instead of default "alt"
        copyModeModifierKey="ctrl"
        // "shift" instead of default "ctrl"
        groupModeModifierKey="shift">
        <QueryBuilder {...props} />
      </QueryBuilderDnD>
    )
  );
  const onQueryChange = jest.fn<never, [RuleGroupType]>();
  render(
    <QueryBuilderWrapped
      fields={[
        { name: 'field1', label: 'Field 1' },
        { name: 'field2', label: 'Field 2' },
        { name: 'field3', label: 'Field 3' },
      ]}
      enableMountQueryChange={false}
      onQueryChange={onQueryChange}
      query={{
        combinator: 'and',
        rules: [
          { field: 'field1', operator: '=', value: '1' },
          { field: 'field2', operator: '=', value: '2' },
          { field: 'field3', operator: '=', value: '3' },
        ],
      }}
    />
  );
  const [dropRule, , dragRule] = screen.getAllByTestId(TestID.rule);
  await user.keyboard('{Control>}');
  simulateDragDrop(
    getHandlerId(dragRule, 'drag'),
    getHandlerId(dropRule, 'drop'),
    getDndBackend()!
  );
  await user.keyboard('{/Control}');
  expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
    combinator: 'and',
    rules: [
      { field: 'field1', operator: '=', value: '1' },
      { id: expect.any(String), field: 'field3', operator: '=', value: '3' },
      { field: 'field2', operator: '=', value: '2' },
      { field: 'field3', operator: '=', value: '3' },
    ],
  });
});

it('respects custom groupModeModifierKey', async () => {
  const [QueryBuilderWrapped, getDndBackend] = wrapWithTestBackend(
    (props: QueryBuilderProps<RuleGroupType, FullField, FullOperator, FullCombinator>) => (
      <QueryBuilderDnD
        dnd={{ ...reactDnD, ...reactDnDHTML5Backend }}
        // "ctrl" instead of default "alt"
        copyModeModifierKey="ctrl"
        // "shift" instead of default "ctrl"
        groupModeModifierKey="shift">
        <QueryBuilder {...props} />
      </QueryBuilderDnD>
    )
  );
  const onQueryChange = jest.fn<never, [RuleGroupType]>();
  render(
    <QueryBuilderWrapped
      fields={[
        { name: 'field1', label: 'Field 1' },
        { name: 'field2', label: 'Field 2' },
      ]}
      enableMountQueryChange={false}
      onQueryChange={onQueryChange}
      query={{
        combinator: 'and',
        rules: [
          { field: 'field1', operator: '=', value: '1' },
          { field: 'field2', operator: '=', value: '2' },
        ],
      }}
    />
  );
  const [dropRule, dragRule] = screen.getAllByTestId(TestID.rule);
  await user.keyboard('{Shift>}');
  simulateDragDrop(
    getHandlerId(dragRule, 'drag'),
    getHandlerId(dropRule, 'drop'),
    getDndBackend()!
  );
  await user.keyboard('{/Shift}');
  expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({
    combinator: 'and',
    rules: [
      {
        combinator: 'and',
        rules: [
          { field: 'field1', operator: '=', value: '1' },
          { field: 'field2', operator: '=', value: '2' },
        ],
      },
    ],
  });
});

it('can move rules/groups to different query builders', async () => {
  const onQueryChange = jest.fn<never, [RuleGroupType]>();
  const fields: Field[] = [
    { name: 'field1', label: 'Field 1' },
    { name: 'field2', label: 'Field 2' },
    { name: 'field3', label: 'Field 3' },
    { name: 'field4', label: 'Field 4' },
  ];
  const query1: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 'field1', operator: '=', value: '1' },
      { field: 'field2', operator: '=', value: '2' },
    ],
  };
  const query2: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 'field3', operator: '=', value: '3' },
      { field: 'field4', operator: '=', value: '4' },
    ],
  };
  const [QueryBuilderWrapped, getDndBackend] = wrapWithTestBackend(
    (props: QueryBuilderProps<RuleGroupType, FullField, FullOperator, FullCombinator>) => (
      <QueryBuilderDnD dnd={{ ...reactDnD, ...reactDnDHTML5Backend }}>
        <QueryBuilder {...props} query={query1} />
        <QueryBuilder {...props} query={query2} />
      </QueryBuilderDnD>
    )
  );
  render(<QueryBuilderWrapped fields={fields} enableDragAndDrop onQueryChange={onQueryChange} />);
  const [dropRule, _1, _2, dragRule] = screen.getAllByTestId(TestID.rule);
  simulateDragDrop(
    getHandlerId(dragRule, 'drag'),
    getHandlerId(dropRule, 'drop'),
    getDndBackend()!
  );
  expect(onQueryChange).toHaveBeenCalledWith({
    combinator: 'and',
    rules: [
      { field: 'field1', operator: '=', value: '1' },
      {
        field: 'field4',
        operator: '=',
        value: '4',
        id: expect.any(String),
        path: expect.arrayContaining([expect.any(Number)]),
        qbId: expect.any(String),
      },
      { field: 'field2', operator: '=', value: '2' },
    ],
  });
  expect(onQueryChange).toHaveBeenCalledWith({
    combinator: 'and',
    rules: [{ field: 'field3', operator: '=', value: '3' }],
  });
});

it('can group rules/groups to different query builders', async () => {
  const onQueryChange = jest.fn<never, [RuleGroupType]>();
  const fields: Field[] = [
    { name: 'field1', label: 'Field 1' },
    { name: 'field2', label: 'Field 2' },
    { name: 'field3', label: 'Field 3' },
    { name: 'field4', label: 'Field 4' },
  ];
  const query1: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 'field1', operator: '=', value: '1' },
      { field: 'field2', operator: '=', value: '2' },
    ],
  };
  const query2: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 'field3', operator: '=', value: '3' },
      { field: 'field4', operator: '=', value: '4' },
    ],
  };
  const [QueryBuilderWrapped, getDndBackend] = wrapWithTestBackend(
    (props: QueryBuilderProps<RuleGroupType, FullField, FullOperator, FullCombinator>) => (
      <QueryBuilderDnD dnd={{ ...reactDnD, ...reactDnDHTML5Backend }}>
        <QueryBuilder {...props} query={query1} />
        <QueryBuilder {...props} query={query2} />
      </QueryBuilderDnD>
    )
  );
  render(<QueryBuilderWrapped fields={fields} enableDragAndDrop onQueryChange={onQueryChange} />);
  const [dropRule, _1, _2, dragRule] = screen.getAllByTestId(TestID.rule);
  await user.keyboard('{Control>}');
  simulateDragDrop(
    getHandlerId(dragRule, 'drag'),
    getHandlerId(dropRule, 'drop'),
    getDndBackend()!
  );
  await user.keyboard('{/Control}');
  expect(onQueryChange).toHaveBeenCalledWith({
    combinator: 'and',
    rules: [
      {
        id: expect.any(String),
        combinator: 'and',
        rules: [
          { id: expect.any(String), field: 'field1', operator: '=', value: '1' },
          {
            field: 'field4',
            operator: '=',
            value: '4',
            id: expect.any(String),
            path: expect.arrayContaining([expect.any(Number)]),
            qbId: expect.any(String),
          },
        ],
      },
      { field: 'field2', operator: '=', value: '2' },
    ],
  });
  expect(onQueryChange).toHaveBeenCalledWith({
    combinator: 'and',
    rules: [{ field: 'field3', operator: '=', value: '3' }],
  });
});
