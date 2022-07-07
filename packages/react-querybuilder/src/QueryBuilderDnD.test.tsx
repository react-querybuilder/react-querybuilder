import { act, render, screen } from '@testing-library/react';
import * as reactDnD from 'react-dnd';
import * as reactDnDHTML5Backend from 'react-dnd-html5-backend';
import { simulateDragDrop, wrapWithTestBackend } from 'react-dnd-test-utils';
import { TestID } from './defaults';
import { QueryBuilder } from './QueryBuilder';
import { QueryBuilderWithDndProvider, QueryBuilderWithoutDndProvider } from './QueryBuilderDnD';
import type { QueryBuilderProps, RuleGroupType, RuleGroupTypeAny, RuleGroupTypeIC } from './types';
import { formatQuery } from './utils';

const getHandlerId = (el: HTMLElement, dragDrop: 'drag' | 'drop') => () =>
  el.getAttribute(`data-${dragDrop}monitorid`);

export const stripQueryIds = (query: RuleGroupTypeAny): RuleGroupTypeAny =>
  JSON.parse(formatQuery(query, 'json_without_ids'));

it('renders with dnd provider without dnd prop', async () => {
  await act(async () => {
    render(<QueryBuilderWithDndProvider enableDragAndDrop />);
    await new Promise(r => setTimeout(r, 500));
  });
  expect(screen.getByTestId(TestID.ruleGroup)).toBeInTheDocument();
});

it('renders without dnd provider without dnd prop', async () => {
  const [QBWoDndProvider] = wrapWithTestBackend(QueryBuilderWithoutDndProvider);
  await act(async () => {
    render(<QBWoDndProvider enableDragAndDrop />);
    await new Promise(r => setTimeout(r, 500));
  });
  expect(screen.getByTestId(TestID.ruleGroup)).toBeInTheDocument();
});

// The drag-and-drop tests run once for QueryBuilderOriginal and once again
// for QueryBuilderWithoutDndProvider.
describe.each([{ QB: QueryBuilder }, { QB: QueryBuilderWithoutDndProvider }])(
  'enableDragAndDrop ($QB.displayName)',
  ({ QB }) => {
    const [QBforDnD, getBackend] = wrapWithTestBackend(
      (props: QueryBuilderProps<RuleGroupType | RuleGroupTypeIC>) => (
        <QB {...props} dnd={{ ...reactDnD, ...reactDnDHTML5Backend }} />
      )
    );
    const gDnDBe = () => getBackend()!;
    describe('standard rule groups', () => {
      it('should set data-dnd attribute appropriately', () => {
        const { container, rerender } = render(<QBforDnD />);
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
          not: false,
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
          not: false,
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
          not: false,
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
          not: false,
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
          not: false,
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
          not: false,
          rules: [
            {
              not: false,
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
          not: false,
          rules: [
            { field: 'field0', operator: '=', value: '0' },
            'and',
            { field: 'field2', operator: '=', value: '2' },
            'and',
            {
              not: false,
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

it('prevents changes when disabled', async () => {
  const [QueryBuilderWrapped, getDndBackend] = wrapWithTestBackend(
    (props: QueryBuilderProps<RuleGroupType | RuleGroupTypeIC>) => (
      <QueryBuilder {...props} dnd={{ ...reactDnD, ...reactDnDHTML5Backend }} />
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
