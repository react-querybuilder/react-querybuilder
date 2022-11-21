import type {
  QueryBuilderProps,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleGroupTypeIC,
} from '@react-querybuilder/ts';
import { act, render, screen } from '@testing-library/react';
import * as reactDnD from 'react-dnd';
import * as reactDnDHTML5Backend from 'react-dnd-html5-backend';
import { simulateDragDrop, simulateDragHover, wrapWithTestBackend } from 'react-dnd-test-utils';
import {
  formatQuery,
  getCompatContextProvider,
  QueryBuilder,
  standardClassnames,
  TestID,
} from 'react-querybuilder';
import { QueryBuilderDnD, QueryBuilderDndWithoutProvider } from './QueryBuilderDnD';

const getHandlerId = (el: HTMLElement, dragDrop: 'drag' | 'drop') => () =>
  el.getAttribute(`data-${dragDrop}monitorid`);

export const stripQueryIds = (query: RuleGroupTypeAny): RuleGroupTypeAny =>
  JSON.parse(formatQuery(query, 'json_without_ids'));

const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
afterEach(() => {
  consoleError.mockReset();
  consoleWarn.mockReset();
});

it('renders base QueryBuilder without enableDragAndDrop prop', async () => {
  await act(async () => {
    render(
      <QueryBuilderDnD>
        <QueryBuilder />
      </QueryBuilderDnD>
    );
    await new Promise(r => setTimeout(r, 500));
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
    await new Promise(r => setTimeout(r, 500));
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
    await new Promise(r => setTimeout(r, 500));
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
    await new Promise(r => setTimeout(r, 500));
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
    await new Promise(r => setTimeout(r, 500));
  });
  expect(screen.getByTestId(TestID.ruleGroup)).toBeInTheDocument();
});

// The drag-and-drop tests run once for QueryBuilderOriginal and once again
// for QueryBuilderDndWithoutProvider.
describe.each([{ QBctx: QueryBuilderDnD }, { QBctx: QueryBuilderDndWithoutProvider }])(
  'enableDragAndDrop ($QBctx.displayName)',
  ({ QBctx }) => {
    const [QBforDnD, getBackend] = wrapWithTestBackend(
      (props: QueryBuilderProps<RuleGroupType | RuleGroupTypeIC>) => (
        <QBctx dnd={{ ...reactDnD, ...reactDnDHTML5Backend }}>
          <QueryBuilder {...props} />
        </QBctx>
      )
    );
    const gDnDBe = () => getBackend()!;
    describe('standard rule groups', () => {
      it('should set data-dnd attribute appropriately', () => {
        const { container, rerender } = render(<QBforDnD enableDragAndDrop={false} />);
        expect(container.querySelectorAll('div')[0].dataset.dnd).toBe('disabled');
        rerender(<QBforDnD enableDragAndDrop />);
        expect(container.querySelectorAll('div')[0].dataset.dnd).toBe('enabled');
      });

      it('moves a rule down within the same group', () => {
        const onQueryChange = jest.fn();
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
        expect((onQueryChange.mock.calls[1][0] as RuleGroupType).rules.map(r => r.id)).toEqual([
          '1',
          '0',
        ]);
      });

      it('moves a rule to a different group with a common ancestor', () => {
        const onQueryChange = jest.fn();
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
        expect((onQueryChange.mock.calls[1][0] as RuleGroupType).rules).toHaveLength(1);
        expect(
          ((onQueryChange.mock.calls[1][0] as RuleGroupType).rules[0] as RuleGroupType).rules
        ).toHaveLength(2);
        expect(
          (
            ((onQueryChange.mock.calls[1][0] as RuleGroupType).rules[0] as RuleGroupType)
              .rules[1] as RuleGroupType
          ).rules[0]
        ).toHaveProperty('id', '2');
      });
    });

    describe('independent combinators', () => {
      it('swaps the first rule with the last within the same group', () => {
        const onQueryChange = jest.fn();
        render(
          <QBforDnD
            independentCombinators
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
        simulateDragDrop(getHandlerId(rules[0], 'drag'), getHandlerId(rules[1], 'drop'), gDnDBe());
        expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
          rules: [
            { field: 'field1', operator: '=', value: '1' },
            'and',
            { field: 'field0', operator: '=', value: '0' },
          ],
        });
      });

      it('swaps the last rule with the first within the same group', () => {
        const onQueryChange = jest.fn();
        render(
          <QBforDnD
            independentCombinators
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
        simulateDragDrop(getHandlerId(rules[1], 'drag'), getHandlerId(ruleGroup, 'drop'), gDnDBe());
        expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
          rules: [
            { field: 'field1', operator: '=', value: '1' },
            'and',
            { field: 'field0', operator: '=', value: '0' },
          ],
        });
      });

      it('moves a rule from first to last within the same group', () => {
        const onQueryChange = jest.fn();
        render(
          <QBforDnD
            independentCombinators
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
        simulateDragDrop(getHandlerId(rules[0], 'drag'), getHandlerId(rules[2], 'drop'), gDnDBe());
        expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
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
        const onQueryChange = jest.fn();
        render(
          <QBforDnD
            independentCombinators
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
        simulateDragDrop(getHandlerId(rules[2], 'drag'), getHandlerId(ruleGroup, 'drop'), gDnDBe());
        expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
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
        const onQueryChange = jest.fn();
        render(
          <QBforDnD
            independentCombinators
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
          gDnDBe()
        );
        expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
          rules: [
            { field: 'field0', operator: '=', value: '0' },
            'and',
            { field: 'field2', operator: '=', value: '2' },
            'and',
            { field: 'field1', operator: '=', value: '1' },
          ],
        });
      });

      it('moves a first-child rule to a different group as the first child', () => {
        const onQueryChange = jest.fn();
        render(
          <QBforDnD
            independentCombinators
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
        simulateDragDrop(getHandlerId(rule, 'drag'), getHandlerId(ruleGroup, 'drop'), gDnDBe());
        expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
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
        const onQueryChange = jest.fn();
        render(
          <QBforDnD
            independentCombinators
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
        simulateDragDrop(getHandlerId(dragRule, 'drag'), getHandlerId(dropRule, 'drop'), gDnDBe());
        expect(stripQueryIds(onQueryChange.mock.calls[1][0])).toEqual({
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
    (props: QueryBuilderProps<RuleGroupType | RuleGroupTypeIC>) => (
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
    (props: QueryBuilderProps<RuleGroupType | RuleGroupTypeIC>) => (
      <QueryBuilderDnD dnd={{ ...reactDnD, ...reactDnDHTML5Backend }}>
        <QueryBuilder {...props} />
      </QueryBuilderDnD>
    )
  );
  const onQueryChange = jest.fn();
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
      independentCombinators
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
