import type { RuleGroupType, RuleGroupTypeIC } from '@react-querybuilder/core';
import { TestID } from '@react-querybuilder/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { QueryBuilder } from './QueryBuilder';

const user = userEvent.setup();

const nestedQuery: RuleGroupType = {
  combinator: 'and',
  rules: [
    { field: 'f1', operator: '=', value: 'v1' },
    {
      combinator: 'or',
      rules: [
        { field: 'f2', operator: '=', value: 'v2' },
        { field: 'f3', operator: '=', value: 'v3' },
      ],
    },
  ],
};

describe('ungroup functionality', () => {
  describe('showUngroupButtons prop', () => {
    it('does not show ungroup buttons by default', () => {
      render(<QueryBuilder query={nestedQuery} />);
      expect(screen.queryByTestId(TestID.ungroup)).not.toBeInTheDocument();
    });

    it('shows an ungroup button on non-root groups only', () => {
      render(<QueryBuilder showUngroupButtons query={nestedQuery} />);
      expect(screen.getAllByTestId(TestID.ungroup)).toHaveLength(1);
    });

    it('never shows an ungroup button on the root group', () => {
      render(<QueryBuilder showUngroupButtons query={{ combinator: 'and', rules: [] }} />);
      expect(screen.queryByTestId(TestID.ungroup)).not.toBeInTheDocument();
    });
  });

  describe('clicking the ungroup button', () => {
    it('promotes the subgroup rules into the parent group', async () => {
      const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
      render(<QueryBuilder showUngroupButtons query={nestedQuery} onQueryChange={onQueryChange} />);

      await user.click(screen.getByTestId(TestID.ungroup));

      const lastCall = onQueryChange.mock.calls.at(-1)![0];
      expect(lastCall.rules).toHaveLength(3);
      expect(lastCall.rules.map(r => (r as { field: string }).field)).toEqual(['f1', 'f2', 'f3']);
    });

    it('preserves alternation in independent combinator queries', async () => {
      const onQueryChange = vi.fn<(q: RuleGroupTypeIC) => void>();
      render(
        <QueryBuilder
          showUngroupButtons
          onQueryChange={onQueryChange}
          query={
            {
              rules: [
                { field: 'f1', operator: '=', value: 'v1' },
                'and',
                {
                  rules: [
                    { field: 'f2', operator: '=', value: 'v2' },
                    'or',
                    { field: 'f3', operator: '=', value: 'v3' },
                  ],
                },
              ],
            } satisfies RuleGroupTypeIC
          }
        />
      );

      await user.click(screen.getByTestId(TestID.ungroup));

      const lastCall = onQueryChange.mock.calls.at(-1)![0];
      expect(
        lastCall.rules.map(r => (typeof r === 'string' ? r : (r as { field: string }).field))
      ).toEqual(['f1', 'and', 'f2', 'or', 'f3']);
    });

    it('removes an empty subgroup', async () => {
      const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
      render(
        <QueryBuilder
          showUngroupButtons
          onQueryChange={onQueryChange}
          query={{
            combinator: 'and',
            rules: [
              { field: 'f1', operator: '=', value: 'v1' },
              { combinator: 'or', rules: [] },
            ],
          }}
        />
      );

      await user.click(screen.getByTestId(TestID.ungroup));

      expect(onQueryChange.mock.calls.at(-1)![0].rules).toHaveLength(1);
    });

    it('does nothing when the query builder is disabled', async () => {
      const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
      render(
        <QueryBuilder
          disabled
          showUngroupButtons
          query={nestedQuery}
          onQueryChange={onQueryChange}
        />
      );

      await user.click(screen.getByTestId(TestID.ungroup));

      expect(onQueryChange.mock.calls.at(-1)![0].rules).toHaveLength(2);
    });
  });

  describe('onUngroup callback', () => {
    it('cancels the ungroup when it returns false', async () => {
      const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
      render(
        <QueryBuilder
          showUngroupButtons
          query={nestedQuery}
          onQueryChange={onQueryChange}
          onUngroup={() => false}
        />
      );

      await user.click(screen.getByTestId(TestID.ungroup));

      expect(onQueryChange.mock.calls.at(-1)![0].rules).toHaveLength(2);
    });

    it('can intercept a negated group', async () => {
      const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
      const onUngroup = vi.fn((rg: RuleGroupType) => !rg.not);
      render(
        <QueryBuilder
          showUngroupButtons
          onQueryChange={onQueryChange}
          onUngroup={onUngroup}
          query={{
            combinator: 'and',
            rules: [
              { combinator: 'or', not: true, rules: [{ field: 'f1', operator: '=', value: 'v1' }] },
            ],
          }}
        />
      );

      await user.click(screen.getByTestId(TestID.ungroup));

      expect(onUngroup).toHaveBeenCalled();
      expect(onQueryChange.mock.calls.at(-1)![0].rules).toHaveLength(1);
      expect(onQueryChange.mock.calls.at(-1)![0].rules[0]).toHaveProperty('not', true);
    });

    it('applies a replacement query', async () => {
      const onQueryChange = vi.fn<(q: RuleGroupType) => void>();
      const replacement: RuleGroupType = { combinator: 'or', rules: [] };
      render(
        <QueryBuilder
          showUngroupButtons
          query={nestedQuery}
          onQueryChange={onQueryChange}
          onUngroup={() => replacement}
        />
      );

      await user.click(screen.getByTestId(TestID.ungroup));

      expect(onQueryChange.mock.calls.at(-1)![0]).toMatchObject({ combinator: 'or', rules: [] });
    });
  });
});
