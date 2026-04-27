// @vitest-environment jsdom
import type { RuleGroupType } from '@react-querybuilder/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SparqlSelectEditor } from './SparqlSelectEditor';

const emptyQuery: RuleGroupType = { combinator: 'and', rules: [] };

const queryWithPatterns: RuleGroupType = {
  combinator: 'and',
  rules: [
    {
      field: 'foaf:name',
      operator: 'binds',
      value: '?name',
      meta: { graphRole: 'pattern', subject: '?person' },
    },
    {
      field: 'foaf:age',
      operator: 'binds',
      value: '?age',
      meta: { graphRole: 'pattern', subject: '?person' },
    },
  ],
};

describe('SparqlSelectEditor', () => {
  it('should render detected variables', () => {
    const onVarsChange = vi.fn();
    const onPrefixesChange = vi.fn();
    render(
      <SparqlSelectEditor
        query={queryWithPatterns}
        onSelectVariablesChange={onVarsChange}
        onPrefixesChange={onPrefixesChange}
      />
    );
    expect(screen.getByTestId('sparql-select-editor')).toBeDefined();
    expect(screen.getByText('?person')).toBeDefined();
    expect(screen.getByText('?name')).toBeDefined();
    expect(screen.getByText('?age')).toBeDefined();
  });

  it('should show empty message when no pattern rules exist', () => {
    const onVarsChange = vi.fn();
    const onPrefixesChange = vi.fn();
    render(
      <SparqlSelectEditor
        query={emptyQuery}
        onSelectVariablesChange={onVarsChange}
        onPrefixesChange={onPrefixesChange}
      />
    );
    expect(screen.getByText(/No variables detected/)).toBeDefined();
  });

  it('should call onSelectVariablesChange when a variable is unchecked', async () => {
    const user = userEvent.setup();
    const onVarsChange = vi.fn();
    const onPrefixesChange = vi.fn();
    render(
      <SparqlSelectEditor
        query={queryWithPatterns}
        onSelectVariablesChange={onVarsChange}
        onPrefixesChange={onPrefixesChange}
      />
    );
    const checkboxes = screen.getAllByRole('checkbox');
    // Uncheck the first variable
    await user.click(checkboxes[0]);
    expect(onVarsChange).toHaveBeenCalled();
    const lastCall = onVarsChange.mock.calls[onVarsChange.mock.calls.length - 1][0];
    expect(lastCall).not.toContain('?person');
  });

  it('should show Reset button when selectVariables is manually set', () => {
    const onVarsChange = vi.fn();
    const onPrefixesChange = vi.fn();
    render(
      <SparqlSelectEditor
        query={queryWithPatterns}
        selectVariables={['?person']}
        onSelectVariablesChange={onVarsChange}
        onPrefixesChange={onPrefixesChange}
      />
    );
    expect(screen.getByText('Reset to auto-detect')).toBeDefined();
  });

  it('should call onSelectVariablesChange(undefined) on reset', async () => {
    const user = userEvent.setup();
    const onVarsChange = vi.fn();
    const onPrefixesChange = vi.fn();
    render(
      <SparqlSelectEditor
        query={queryWithPatterns}
        selectVariables={['?person']}
        onSelectVariablesChange={onVarsChange}
        onPrefixesChange={onPrefixesChange}
      />
    );
    await user.click(screen.getByText('Reset to auto-detect'));
    expect(onVarsChange).toHaveBeenCalledWith(undefined);
  });

  it('should render prefix declarations', () => {
    const onVarsChange = vi.fn();
    const onPrefixesChange = vi.fn();
    render(
      <SparqlSelectEditor
        query={emptyQuery}
        prefixes={{ foaf: 'http://xmlns.com/foaf/0.1/' }}
        onSelectVariablesChange={onVarsChange}
        onPrefixesChange={onPrefixesChange}
      />
    );
    expect(screen.getByText(/foaf/)).toBeDefined();
    expect(screen.getByText(/xmlns\.com/)).toBeDefined();
  });

  it('should add a prefix', async () => {
    const user = userEvent.setup();
    const onVarsChange = vi.fn();
    const onPrefixesChange = vi.fn();
    render(
      <SparqlSelectEditor
        query={emptyQuery}
        onSelectVariablesChange={onVarsChange}
        onPrefixesChange={onPrefixesChange}
      />
    );
    await user.type(screen.getByPlaceholderText('prefix'), 'ex');
    await user.type(screen.getByPlaceholderText('http://example.org/'), 'http://example.org/');
    await user.click(screen.getByText('Add'));
    expect(onPrefixesChange).toHaveBeenCalledWith({ ex: 'http://example.org/' });
  });

  it('should remove a prefix', async () => {
    const user = userEvent.setup();
    const onVarsChange = vi.fn();
    const onPrefixesChange = vi.fn();
    render(
      <SparqlSelectEditor
        query={emptyQuery}
        prefixes={{ foaf: 'http://xmlns.com/foaf/0.1/', ex: 'http://example.org/' }}
        onSelectVariablesChange={onVarsChange}
        onPrefixesChange={onPrefixesChange}
      />
    );
    const removeButtons = screen.getAllByText('×');
    await user.click(removeButtons[0]);
    expect(onPrefixesChange).toHaveBeenCalledWith({ ex: 'http://example.org/' });
  });
});
