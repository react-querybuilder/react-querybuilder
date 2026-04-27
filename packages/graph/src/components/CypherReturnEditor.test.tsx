// @vitest-environment jsdom
import type { RuleGroupType } from '@react-querybuilder/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CypherReturnEditor } from './CypherReturnEditor';

const emptyQuery: RuleGroupType = { combinator: 'and', rules: [] };

const queryWithPatterns: RuleGroupType = {
  combinator: 'and',
  rules: [
    {
      field: '_pattern',
      operator: '=',
      value: '',
      meta: {
        graphRole: 'pattern',
        nodeAlias: 'a',
        nodeLabel: 'Person',
        relType: 'KNOWS',
        targetAlias: 'b',
        targetLabel: 'Person',
        direction: 'outgoing',
      },
    },
    { field: 'a.name', operator: '=', value: 'Alice' },
  ],
};

describe('CypherReturnEditor', () => {
  it('should render with default includeReturn=true', () => {
    const handleChange = vi.fn();
    render(<CypherReturnEditor query={queryWithPatterns} onIncludeReturnChange={handleChange} />);
    expect(screen.getByTestId('cypher-return-editor')).toBeDefined();
    expect(screen.getByText(/Returning:/)).toBeDefined();
    expect(screen.getByText('a, b')).toBeDefined();
  });

  it('should show empty message when no pattern rules exist', () => {
    const handleChange = vi.fn();
    render(<CypherReturnEditor query={emptyQuery} onIncludeReturnChange={handleChange} />);
    expect(screen.getByText(/No aliases bound/)).toBeDefined();
  });

  it('should hide aliases when includeReturn is false', () => {
    const handleChange = vi.fn();
    render(
      <CypherReturnEditor
        query={queryWithPatterns}
        includeReturn={false}
        onIncludeReturnChange={handleChange}
      />
    );
    expect(screen.queryByText(/Returning:/)).toBeNull();
  });

  it('should call onIncludeReturnChange when toggled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <CypherReturnEditor
        query={queryWithPatterns}
        includeReturn={true}
        onIncludeReturnChange={handleChange}
      />
    );
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('should respect disabled prop', () => {
    const handleChange = vi.fn();
    render(<CypherReturnEditor query={emptyQuery} onIncludeReturnChange={handleChange} disabled />);
    expect(screen.getByRole('checkbox')).toHaveProperty('disabled', true);
  });
});
