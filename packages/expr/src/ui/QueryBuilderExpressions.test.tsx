// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
import * as React from 'react';
import { useState } from 'react';
import type {
  Field,
  FieldSelectorProps,
  ParseNumbersPropConfig,
  QueryBuilderContextProvider,
  RuleGroupType,
  RuleType,
  ValueEditorProps,
} from 'react-querybuilder';
import { getCompatContextProvider, QueryBuilder } from 'react-querybuilder';
// Import through the public `/ui` barrel so the re-export modules are covered too.
import { QueryBuilderExpressions } from '../index.ui';
import type { ExpressionFunctionRegistry } from '../types';

const fields: Field[] = [
  { name: 'price', label: 'Price' },
  { name: 'qty', label: 'Qty' },
];

const initialQuery: RuleGroupType = {
  combinator: 'and',
  rules: [{ field: 'price', operator: '=', value: '' }],
};

interface AppProps {
  functions?: ExpressionFunctionRegistry;
  /** Optional outer compat provider, to test inherited-control delegation. */
  Outer?: QueryBuilderContextProvider;
  /** Threaded to the wrapped {@link QueryBuilder}, then on to the expression editors. */
  parseNumbers?: ParseNumbersPropConfig;
  /** Field list override (e.g. to give the sentinel field an `inputType`). */
  fields?: Field[];
}

// Stateful host: a controlled QueryBuilder wrapped by the expression provider, dumping the
// live query so assertions can read `rule.lhs` / `valueSource` / `value` after each edit.
const App = ({ functions, Outer, parseNumbers, fields: fieldsProp = fields }: AppProps) => {
  const [query, setQuery] = useState<RuleGroupType>(initialQuery);
  const inner = (
    <QueryBuilderExpressions functions={functions}>
      <QueryBuilder
        fields={fieldsProp}
        query={query}
        onQueryChange={setQuery}
        parseNumbers={parseNumbers}
      />
    </QueryBuilderExpressions>
  );
  return (
    <>
      {Outer ? <Outer>{inner}</Outer> : inner}
      <pre data-testid="q">{JSON.stringify(query)}</pre>
    </>
  );
};

const currentQuery = (): RuleGroupType => JSON.parse(`${screen.getByTestId('q').textContent}`);
const rule0 = (): RuleType => currentQuery().rules[0] as RuleType;

describe('left-hand side (field selector host)', () => {
  it('toggles an LHS expression on, edits it, then clears it', () => {
    render(<App />);

    // Off by default: no editor, toggle not pressed, `rule.lhs` absent.
    expect(rule0().lhs).toBeUndefined();
    expect(screen.getByTestId('expr-lhs-toggle')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByTestId('expr-lhs')).toBeNull();

    // Toggle on: seeds a field node from the first field.
    fireEvent.click(screen.getByTestId('expr-lhs-toggle'));
    expect(rule0().lhs).toEqual({ kind: 'field', field: 'price' });
    expect(screen.getByTestId('expr-lhs-toggle')).toHaveAttribute('aria-pressed', 'true');

    // Edit the field reference.
    fireEvent.change(screen.getByTestId('expr-lhs-field'), { target: { value: 'qty' } });
    expect(rule0().lhs).toEqual({ kind: 'field', field: 'qty' });

    // Switch to a function node (fresh default args, independent of the prior field edit).
    fireEvent.change(screen.getByTestId('expr-lhs-kind'), { target: { value: 'func' } });
    expect(rule0().lhs).toEqual({
      kind: 'func',
      fn: 'add',
      args: [
        { kind: 'field', field: 'price' },
        { kind: 'field', field: 'price' },
      ],
    });

    // Toggle off: clears `rule.lhs`.
    fireEvent.click(screen.getByTestId('expr-lhs-toggle'));
    expect(rule0().lhs).toBeUndefined();
    expect(screen.queryByTestId('expr-lhs')).toBeNull();
  });

  it('synthesizes field data when the sentinel field is unconfigured', () => {
    // `price` (the rule's field) is absent from this list, so the inputType resolver must
    // fall back to a synthesized field instead of choking on the fieldMap miss.
    render(<App fields={[{ name: 'qty', label: 'Qty' }]} />);

    fireEvent.click(screen.getByTestId('expr-lhs-toggle'));
    // Toggling still works; the seeded node uses the first available field.
    expect(rule0().lhs).toEqual({ kind: 'field', field: 'qty' });
  });
});

describe('right-hand side (value editor host)', () => {
  it('toggles an RHS expression on, edits it, then disables it', () => {
    render(<App />);

    // Off by default: standard editor (no expression node), source is the default `'value'`.
    expect(screen.getByTestId('expr-rhs-toggle')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByTestId('expr-rhs')).toBeNull();

    // Enable: flips `valueSource` to `'expression'` and seeds an empty value node.
    fireEvent.click(screen.getByTestId('expr-rhs-toggle'));
    expect(rule0().valueSource).toBe('expression');
    expect(rule0().value).toEqual({ kind: 'value', value: '' });
    expect(screen.getByTestId('expr-rhs-toggle')).toHaveAttribute('aria-pressed', 'true');

    // Edit the literal: written straight into `rule.value` via `handleOnChange`.
    fireEvent.change(screen.getByTestId('expr-rhs-value'), { target: { value: '5' } });
    expect(rule0().value).toEqual({ kind: 'value', value: '5' });

    // Disable: reverts to `valueSource: 'value'` and resets the scalar value.
    fireEvent.click(screen.getByTestId('expr-rhs-toggle'));
    expect(rule0().valueSource).toBe('value');
    expect(rule0().value).toBe('');
    expect(screen.queryByTestId('expr-rhs')).toBeNull();
  });

  it("threads the QueryBuilder's parseNumbers through to the RHS literal", () => {
    render(<App parseNumbers />);

    fireEvent.click(screen.getByTestId('expr-rhs-toggle'));
    // With parseNumbers enabled, a numeric literal is stored as an actual number.
    fireEvent.change(screen.getByTestId('expr-rhs-value'), { target: { value: '5' } });
    expect(rule0().value).toEqual({ kind: 'value', value: 5 });
  });

  it('inherits the field inputType so a "-limited" parseNumbers parses for number fields', () => {
    // `strict-limited` only parses when the field's resolved inputType is `'number'`.
    render(
      <App
        parseNumbers="strict-limited"
        fields={[
          { name: 'price', label: 'Price', inputType: 'number' },
          { name: 'qty', label: 'Qty' },
        ]}
      />
    );

    fireEvent.click(screen.getByTestId('expr-rhs-toggle'));
    fireEvent.change(screen.getByTestId('expr-rhs-value'), { target: { value: '5' } });
    expect(rule0().value).toEqual({ kind: 'value', value: 5 });
  });
});

describe('function registry', () => {
  it('merges the `functions` prop over the built-ins', () => {
    const functions: ExpressionFunctionRegistry = { power: { label: 'POW', arity: 2 } };
    render(<App functions={functions} />);

    fireEvent.click(screen.getByTestId('expr-lhs-toggle'));
    fireEvent.change(screen.getByTestId('expr-lhs-kind'), { target: { value: 'func' } });

    const fnSelect = screen.getByTestId('expr-lhs-fn');
    // Custom function is selectable alongside the retained built-ins.
    expect(within(fnSelect).getByRole('option', { name: 'POW' })).toBeInTheDocument();
    expect(within(fnSelect).getByRole('option', { name: '+' })).toBeInTheDocument();

    fireEvent.change(fnSelect, { target: { value: 'power' } });
    expect(rule0().lhs).toMatchObject({ kind: 'func', fn: 'power' });
  });
});

describe('inherited (compat) controls', () => {
  const CustomValueEditor = (_props: ValueEditorProps) => (
    <span data-testid="custom-editor">custom</span>
  );
  const CustomFieldSelector = (_props: FieldSelectorProps) => (
    <span data-testid="custom-field">custom</span>
  );
  const Outer: QueryBuilderContextProvider = getCompatContextProvider({
    controlElements: { valueEditor: CustomValueEditor, fieldSelector: CustomFieldSelector },
  });

  it('renders inherited controls for the non-expression case, then overrides on enable', () => {
    render(<App Outer={Outer} />);

    // Non-expression RHS delegates to the inherited editor; LHS hosts the inherited selector.
    expect(screen.getByTestId('custom-editor')).toBeInTheDocument();
    expect(screen.getByTestId('custom-field')).toBeInTheDocument();

    // Enabling the RHS expression swaps the rule's editor for the expression editor, whose
    // literal sub-input still renders via the inherited (themed) editor.
    fireEvent.click(screen.getByTestId('expr-rhs-toggle'));
    const exprRhs = screen.getByTestId('expr-rhs');
    expect(exprRhs).toBeInTheDocument();
    expect(within(exprRhs).getByTestId('custom-editor')).toBeInTheDocument();
  });
});
