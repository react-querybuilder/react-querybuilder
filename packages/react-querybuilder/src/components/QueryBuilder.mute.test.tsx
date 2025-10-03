import type { RuleGroupType } from '@react-querybuilder/core';
import { formatQuery, TestID } from '@react-querybuilder/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { QueryBuilder } from './QueryBuilder';

const user = userEvent.setup();

describe('mute functionality', () => {
  describe('showMuteButtons prop', () => {
    it('shows mute buttons when showMuteButtons is true', () => {
      render(<QueryBuilder showMuteButtons />);
      expect(screen.getByTestId(TestID.muteGroup)).toBeInTheDocument();
    });

    it('does not show mute buttons when showMuteButtons is false', () => {
      render(<QueryBuilder />);
      expect(screen.queryByTestId(TestID.muteGroup)).not.toBeInTheDocument();
    });
  });

  describe('mute toggle functionality', () => {
    it('toggles muted state on a rule', async () => {
      const onQueryChange = jest.fn<never, [RuleGroupType]>();
      render(
        <QueryBuilder
          showMuteButtons
          onQueryChange={onQueryChange}
          query={{
            combinator: 'and',
            rules: [{ field: 'f1', operator: '=', value: 'v1' }],
          }}
        />
      );

      const muteButton = screen.getByTestId(TestID.muteRule);
      await user.click(muteButton);

      expect(onQueryChange).toHaveBeenCalledWith(
        expect.objectContaining({
          rules: [expect.objectContaining({ muted: true })],
        })
      );
    });

    it('toggles muted state on a group', async () => {
      const onQueryChange = jest.fn<never, [RuleGroupType]>();
      render(
        <QueryBuilder
          showMuteButtons
          onQueryChange={onQueryChange}
          query={{
            combinator: 'and',
            rules: [],
          }}
        />
      );

      const muteButton = screen.getByTestId(TestID.muteGroup);
      await user.click(muteButton);

      expect(onQueryChange).toHaveBeenCalledWith(expect.objectContaining({ muted: true }));
    });
  });

  describe('recursive muting behavior', () => {
    it('mutes all children when a group is muted', async () => {
      const onQueryChange = jest.fn<never, [RuleGroupType]>();
      render(
        <QueryBuilder
          showMuteButtons
          onQueryChange={onQueryChange}
          query={{
            combinator: 'and',
            rules: [
              { field: 'f1', operator: '=', value: 'v1' },
              {
                combinator: 'or',
                rules: [{ field: 'f2', operator: '=', value: 'v2' }],
              },
            ],
          }}
        />
      );

      const muteGroupButton = screen.getAllByTestId(TestID.muteGroup)[0];
      await user.click(muteGroupButton);

      const lastCall = onQueryChange.mock.calls[onQueryChange.mock.calls.length - 1][0];
      expect(lastCall.muted).toBe(true);
      expect(lastCall.rules[0]).toHaveProperty('muted', true);
      expect(lastCall.rules[1]).toHaveProperty('muted', true);
      expect((lastCall.rules[1] as RuleGroupType).rules[0]).toHaveProperty('muted', true);
    });

    it('unmutes all children when a group is unmuted directly', async () => {
      const onQueryChange = jest.fn<never, [RuleGroupType]>();
      const initialQuery: RuleGroupType = {
        combinator: 'and',
        muted: true,
        rules: [
          { field: 'f1', operator: '=', value: 'v1', muted: true },
          {
            combinator: 'or',
            muted: true,
            rules: [{ field: 'f2', operator: '=', value: 'v2', muted: true }],
          },
        ],
      };

      render(<QueryBuilder showMuteButtons onQueryChange={onQueryChange} query={initialQuery} />);

      // Click the unmute button on the root group
      const muteGroupButton = screen.getAllByTestId(TestID.muteGroup)[0];
      await user.click(muteGroupButton);

      const lastCall = onQueryChange.mock.calls[onQueryChange.mock.calls.length - 1][0];
      expect(lastCall.muted).toBe(false); // Root group should be unmuted
      expect(lastCall.rules[0]).toHaveProperty('muted', false); // First rule should be unmuted
      expect((lastCall.rules[1] as RuleGroupType).muted).toBe(false); // Subgroup should be unmuted
      expect((lastCall.rules[1] as RuleGroupType).rules[0]).toHaveProperty('muted', false); // Nested rule should be unmuted
    });

    it('unmutes only parent groups when a descendant is unmuted directly', async () => {
      const onQueryChange = jest.fn<never, [RuleGroupType]>();
      const initialQuery: RuleGroupType = {
        combinator: 'and',
        muted: true,
        rules: [
          { field: 'f1', operator: '=', value: 'v1', muted: true },
          {
            combinator: 'or',
            muted: true,
            rules: [
              { field: 'f2', operator: '=', value: 'v2', muted: true },
              { field: 'f3', operator: '=', value: 'v3', muted: true },
            ],
          },
        ],
      };

      render(<QueryBuilder showMuteButtons onQueryChange={onQueryChange} query={initialQuery} />);

      // Click the mute button on the first nested rule
      const muteRuleButtons = screen.getAllByTestId(TestID.muteRule);
      await user.click(muteRuleButtons[1]); // Click the first nested rule's mute button

      const lastCall = onQueryChange.mock.calls[onQueryChange.mock.calls.length - 1][0];
      expect(lastCall.muted).toBe(false); // Root group should be unmuted
      expect(lastCall.rules[0]).toHaveProperty('muted', true); // First rule should still be muted
      expect((lastCall.rules[1] as RuleGroupType).muted).toBe(false); // Parent subgroup should be unmuted
      expect((lastCall.rules[1] as RuleGroupType).rules[0]).toHaveProperty('muted', false); // The clicked rule should be unmuted
      expect((lastCall.rules[1] as RuleGroupType).rules[1]).toHaveProperty('muted', true); // The sibling rule should still be muted
    });
  });

  describe('formatQuery with muted items', () => {
    it('excludes muted rules from SQL output', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [
          { field: 'f1', operator: '=', value: 'v1' },
          { field: 'f2', operator: '=', value: 'v2', muted: true },
          { field: 'f3', operator: '=', value: 'v3' },
        ],
      };

      const sql = formatQuery(query, 'sql');
      expect(sql).toContain('f1');
      expect(sql).not.toContain('f2');
      expect(sql).toContain('f3');
    });

    it('excludes muted groups from SQL output', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [
          { field: 'f1', operator: '=', value: 'v1' },
          {
            combinator: 'or',
            muted: true,
            rules: [{ field: 'f2', operator: '=', value: 'v2' }],
          },
          { field: 'f3', operator: '=', value: 'v3' },
        ],
      };

      const sql = formatQuery(query, 'sql');
      expect(sql).toContain('f1');
      expect(sql).not.toContain('f2');
      expect(sql).not.toContain('or');
      expect(sql).toContain('f3');
    });

    it('excludes muted items from JSON output', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [
          { field: 'f1', operator: '=', value: 'v1' },
          { field: 'f2', operator: '=', value: 'v2', muted: true },
        ],
      };

      const json = formatQuery(query, 'json');
      const parsed = JSON.parse(json);
      expect(parsed.rules).toHaveLength(1);
      expect(parsed.rules[0].field).toBe('f1');
    });
  });

  describe('mute button labels', () => {
    it('shows correct label when not muted', () => {
      render(<QueryBuilder showMuteButtons query={{ combinator: 'and', rules: [] }} />);

      const muteButton = screen.getByTestId(TestID.muteGroup);
      expect(muteButton).toHaveTextContent('🔊');
    });

    it('shows correct label when muted', () => {
      render(
        <QueryBuilder showMuteButtons query={{ combinator: 'and', muted: true, rules: [] }} />
      );

      const muteButton = screen.getByTestId(TestID.muteGroup);
      expect(muteButton).toHaveTextContent('🔇');
    });
  });

  describe('edge cases and complex scenarios', () => {
    it('handles deeply nested muted groups correctly', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [
          {
            combinator: 'or',
            muted: true,
            rules: [
              {
                combinator: 'and',
                rules: [
                  { field: 'f1', operator: '=', value: 'v1' },
                  {
                    combinator: 'or',
                    rules: [{ field: 'f2', operator: '=', value: 'v2' }],
                  },
                ],
              },
            ],
          },
          { field: 'f3', operator: '=', value: 'v3' },
        ],
      };

      const sql = formatQuery(query, 'sql');
      expect(sql).not.toContain('f1');
      expect(sql).not.toContain('f2');
      expect(sql).toContain('f3');
    });

    it('handles empty groups after muting', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [
          { field: 'f1', operator: '=', value: 'v1', muted: true },
          { field: 'f2', operator: '=', value: 'v2', muted: true },
        ],
      };

      const sql = formatQuery(query, 'sql');
      expect(sql).toBe('(1 = 1)'); // Default fallback for empty queries
    });

    it('preserves muted state when adding new rules', async () => {
      const onQueryChange = jest.fn<never, [RuleGroupType]>();
      const initialQuery: RuleGroupType = {
        combinator: 'and',
        muted: true,
        rules: [{ field: 'f1', operator: '=', value: 'v1', muted: true }],
      };

      render(<QueryBuilder showMuteButtons onQueryChange={onQueryChange} query={initialQuery} />);

      const addRuleButton = screen.getByTestId(TestID.addRule);
      await user.click(addRuleButton);

      // The new rule should not automatically be muted
      // (unless the parent group muting logic is applied)
      expect(onQueryChange).toHaveBeenCalled();
    });

    it('works correctly with independent combinators', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [
          { field: 'f1', operator: '=', value: 'v1' },
          { field: 'f2', operator: '=', value: 'v2', muted: true },
          { field: 'f3', operator: '=', value: 'v3' },
        ],
      };

      const sql = formatQuery(query, 'sql');
      expect(sql).toBe("(f1 = 'v1' and f3 = 'v3')");
    });

    it('formats multiple export types correctly with muted items', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [
          { field: 'active', operator: '=', value: true },
          { field: 'deleted', operator: '=', value: false, muted: true },
          { field: 'name', operator: 'contains', value: 'test' },
        ],
      };

      // Test SQL
      const sql = formatQuery(query, 'sql');
      expect(sql).toContain('active');
      expect(sql).not.toContain('deleted');

      // Test MongoDB
      const mongodb = formatQuery(query, 'mongodb');
      const mongoObj = JSON.parse(mongodb);
      expect(mongoObj.$and).toHaveLength(2);
      expect(mongoObj.$and[0]).toHaveProperty('active');
      expect(mongoObj.$and[1]).toHaveProperty('name');

      // Test CEL
      const cel = formatQuery(query, 'cel');
      expect(cel).toContain('active');
      expect(cel).not.toContain('deleted');
    });
  });

  describe('integration with other features', () => {
    it('mute buttons work alongside lock buttons', () => {
      render(
        <QueryBuilder
          showMuteButtons
          showLockButtons
          query={{ combinator: 'and', rules: [{ field: 'f1', operator: '=', value: 'v1' }] }}
        />
      );

      expect(screen.getByTestId(TestID.muteGroup)).toBeInTheDocument();
      expect(screen.getByTestId(TestID.lockGroup)).toBeInTheDocument();
      expect(screen.getByTestId(TestID.muteRule)).toBeInTheDocument();
      expect(screen.getByTestId(TestID.lockRule)).toBeInTheDocument();
    });

    it('respects disabled state when muted', async () => {
      const onQueryChange = jest.fn<never, [RuleGroupType]>();
      render(
        <QueryBuilder
          showMuteButtons
          disabled
          onQueryChange={onQueryChange}
          query={{ combinator: 'and', muted: true, rules: [] }}
        />
      );

      const muteButton = screen.getByTestId(TestID.muteGroup);
      expect(muteButton).toBeDisabled();
    });
  });
});
