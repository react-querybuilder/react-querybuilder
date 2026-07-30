import type { RuleGroupType } from '@react-querybuilder/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { useState } from 'react';
import { QueryBuilder } from '../../components/QueryBuilder';
import { QueryBuilderHistory, useQueryBuilderHistory } from '../index';

const user = userEvent.setup();

const fields = [{ name: 'f1', label: 'F1' }];
const startQuery: RuleGroupType = {
  id: 'g',
  combinator: 'and',
  rules: [{ id: 'r1', field: 'f1', operator: '=', value: '' }],
};

/** Toolbar rendered outside the query builder, addressing it by `qbId`. */
const Toolbar = ({ qbId }: { qbId: string }) => {
  const { undo, redo, clear, canUndo, canRedo, past, future } = useQueryBuilderHistory(qbId);
  return (
    <div>
      <button type="button" data-testid="undo" onClick={undo} disabled={!canUndo}>
        undo
      </button>
      <button type="button" data-testid="redo" onClick={redo} disabled={!canRedo}>
        redo
      </button>
      <button type="button" data-testid="clear" onClick={clear}>
        clear
      </button>
      <span data-testid="past-count">{past.length}</span>
      <span data-testid="future-count">{future.length}</span>
    </div>
  );
};

const valueEditor = () => screen.getByTestId<HTMLInputElement>('value-editor');
const pastCount = () => Number(screen.getByTestId('past-count').textContent);
const futureCount = () => Number(screen.getByTestId('future-count').textContent);

describe('uncontrolled mode', () => {
  const Uncontrolled = () => (
    <QueryBuilderHistory coalesceMs={0}>
      <Toolbar qbId="uc" />
      <QueryBuilder qbId="uc" fields={fields} defaultQuery={startQuery} />
    </QueryBuilderHistory>
  );

  it('undoes and redoes an edit', async () => {
    render(<Uncontrolled />);
    expect(screen.getByTestId('undo')).toBeDisabled();

    await user.type(valueEditor(), 'ab');
    expect(valueEditor().value).toBe('ab');
    expect(pastCount()).toBe(2);

    await user.click(screen.getByTestId('undo'));
    expect(valueEditor().value).toBe('a');

    await user.click(screen.getByTestId('undo'));
    expect(valueEditor().value).toBe('');
    expect(screen.getByTestId('undo')).toBeDisabled();

    await user.click(screen.getByTestId('redo'));
    expect(valueEditor().value).toBe('a');
    await user.click(screen.getByTestId('redo'));
    expect(valueEditor().value).toBe('ab');
    expect(screen.getByTestId('redo')).toBeDisabled();
  });

  it('undoes a structural change', async () => {
    render(<Uncontrolled />);
    expect(screen.getAllByTestId('rule')).toHaveLength(1);

    await user.click(screen.getByTestId('add-rule'));
    expect(screen.getAllByTestId('rule')).toHaveLength(2);

    await user.click(screen.getByTestId('undo'));
    expect(screen.getAllByTestId('rule')).toHaveLength(1);
  });

  it('clears history without changing the query', async () => {
    render(<Uncontrolled />);
    await user.type(valueEditor(), 'ab');

    await user.click(screen.getByTestId('clear'));
    expect(pastCount()).toBe(0);
    expect(futureCount()).toBe(0);
    expect(valueEditor().value).toBe('ab');
  });

  it('discards the redo stack after a new edit', async () => {
    render(<Uncontrolled />);
    await user.type(valueEditor(), 'ab');
    await user.click(screen.getByTestId('undo'));
    expect(futureCount()).toBe(1);

    await user.type(valueEditor(), 'z');
    expect(futureCount()).toBe(0);
  });
});

describe('controlled mode', () => {
  const Controlled = () => {
    const [query, setQuery] = useState(startQuery);
    return (
      <QueryBuilderHistory coalesceMs={0}>
        <Toolbar qbId="ctl" />
        <QueryBuilder qbId="ctl" fields={fields} query={query} onQueryChange={setQuery} />
      </QueryBuilderHistory>
    );
  };

  it('undoes and redoes an edit', async () => {
    render(<Controlled />);

    await user.type(valueEditor(), 'ab');
    expect(valueEditor().value).toBe('ab');

    await user.click(screen.getByTestId('undo'));
    expect(valueEditor().value).toBe('a');

    await user.click(screen.getByTestId('redo'));
    expect(valueEditor().value).toBe('ab');
  });
});

describe('coalescing', () => {
  it('merges a typing burst into a single undo step', async () => {
    render(
      <QueryBuilderHistory coalesceMs={10_000}>
        <Toolbar qbId="co" />
        <QueryBuilder qbId="co" fields={fields} defaultQuery={startQuery} />
      </QueryBuilderHistory>
    );

    await user.type(valueEditor(), 'hello');
    expect(valueEditor().value).toBe('hello');
    expect(pastCount()).toBe(1);

    await user.click(screen.getByTestId('undo'));
    expect(valueEditor().value).toBe('');
  });
});

describe('multiple query builders', () => {
  it('keeps histories independent', async () => {
    render(
      <QueryBuilderHistory coalesceMs={0}>
        <Toolbar qbId="m1" />
        <QueryBuilder qbId="m1" fields={fields} defaultQuery={startQuery} />
        <QueryBuilder qbId="m2" fields={fields} defaultQuery={startQuery} />
      </QueryBuilderHistory>
    );

    const [editor1, editor2] = screen.getAllByTestId<HTMLInputElement>('value-editor');
    await user.type(editor2, 'xy');
    expect(pastCount()).toBe(0);

    await user.type(editor1, 'ab');
    expect(pastCount()).toBe(2);

    await user.click(screen.getByTestId('undo'));
    expect(editor1.value).toBe('a');
    // The unrelated query builder is untouched
    expect(editor2.value).toBe('xy');
  });
});

describe('without a provider', () => {
  it('works with library defaults', async () => {
    render(
      <>
        <Toolbar qbId="np" />
        <QueryBuilder qbId="np" fields={fields} defaultQuery={startQuery} />
      </>
    );

    await user.click(screen.getByTestId('add-rule'));
    expect(pastCount()).toBe(1);
    await user.click(screen.getByTestId('undo'));
    expect(screen.getAllByTestId('rule')).toHaveLength(1);
  });
});

describe('unregistered query builders', () => {
  it('records nothing when the hook is not used', async () => {
    render(
      <QueryBuilderHistory>
        <Toolbar qbId="other" />
        <QueryBuilder qbId="unrecorded" fields={fields} defaultQuery={startQuery} />
      </QueryBuilderHistory>
    );

    await user.click(screen.getByTestId('add-rule'));
    expect(pastCount()).toBe(0);
  });
});

describe('no-op guards', () => {
  /** Always-enabled controls, so undo/redo can be invoked with nothing to restore. */
  const ForcedToolbar = ({ qbId }: { qbId: string }) => {
    const { undo, redo } = useQueryBuilderHistory(qbId);
    return (
      <>
        <button type="button" data-testid="force-undo" onClick={undo} />
        <button type="button" data-testid="force-redo" onClick={redo} />
      </>
    );
  };

  it('does nothing when there is no history to navigate', async () => {
    render(
      <QueryBuilderHistory>
        <ForcedToolbar qbId="noop" />
        <QueryBuilder qbId="noop" fields={fields} defaultQuery={startQuery} />
      </QueryBuilderHistory>
    );

    await user.click(screen.getByTestId('force-undo'));
    await user.click(screen.getByTestId('force-redo'));
    expect(valueEditor().value).toBe('');
    expect(screen.getAllByTestId('rule')).toHaveLength(1);
  });

  it('does nothing for a qbId with no query builder', async () => {
    render(
      <QueryBuilderHistory>
        <ForcedToolbar qbId="nonexistent" />
      </QueryBuilderHistory>
    );

    await user.click(screen.getByTestId('force-undo'));
    await user.click(screen.getByTestId('force-redo'));
    // No query builder is registered under this id, so there is nothing to restore
    expect(screen.queryByTestId('rule')).toBeNull();
  });
});
