// @vitest-environment jsdom
import { userEventSetup } from '@rqb-testing';
import { render, screen, within } from '@testing-library/react';
import * as React from 'react';
import { useState } from 'react';
import type {
  Field,
  FieldSelectorProps,
  QueryBuilderContextProvider,
  RuleGroupType,
  RuleType,
  ValueEditorProps,
  ValueSourceSelectorProps,
} from 'react-querybuilder';
import { getCompatContextProvider, QueryBuilder, TestID } from 'react-querybuilder';
// Import through the public `/ui` barrel so the re-export modules are covered too.
import { ExprTestID, QueryBuilderExpressions } from '../index.ui';
import type { AllowFunctionsOnLHS, TranslationsExpr } from '../index.ui';
import type { ExpressionFunctionRegistry } from '../types';

// Core control testIDs we drive: field selector, value editor, value-source selector.
const fieldSel = TestID.fields;
const valueEditor = TestID.valueEditor;
const valueSourceSel = TestID.valueSourceSelector;
// LHS unary-function wrapper selector + RHS nested expression editor (children derive
// `${rhsEditor}-fn` / `-arg0-kind` / `-arg0-field` / `-arg0-value`).
const lhsFn = ExprTestID.exprLhsFnSelector;
const rhsEditor = ExprTestID.exprRhsEditor;

// `expression` is offered as a value source, so the RHS expression editor is reachable
// through the standard value-source selector rather than a bespoke toggle.
const fields: Field[] = [
  { name: 'price', label: 'Price', valueSources: ['value', 'expression'] },
  { name: 'qty', label: 'Qty', valueSources: ['value', 'expression'] },
];

const initialQuery: RuleGroupType = {
  combinator: 'and',
  rules: [{ field: 'price', operator: '=', value: '' }],
};

interface AppProps {
  functions?: ExpressionFunctionRegistry;
  /** Optional outer compat provider, to test inherited-control delegation. */
  Outer?: QueryBuilderContextProvider;
  /** Field list override. */
  fields?: Field[];
  /** Gates the LHS unary-function wrapper (default `false`, matching the prop's own default). */
  allowFunctionsOnLHS?: AllowFunctionsOnLHS;
  /** Per-key overrides for the expression UI labels/titles. */
  translations?: Partial<TranslationsExpr>;
}

// Stateful host: a controlled QueryBuilder wrapped by the expression provider, dumping the
// live query so assertions can read `rule.lhs` / `valueSource` / `value` after each edit.
const App = ({
  functions,
  Outer,
  fields: fieldsProp = fields,
  allowFunctionsOnLHS,
  translations,
}: AppProps) => {
  const [query, setQuery] = useState<RuleGroupType>(initialQuery);
  const inner = (
    <QueryBuilderExpressions
      functions={functions}
      allowFunctionsOnLHS={allowFunctionsOnLHS}
      translations={translations}>
      <QueryBuilder fields={fieldsProp} query={query} onQueryChange={setQuery} />
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

const user = userEventSetup();

describe('left-hand side function wrapper', () => {
  it('renders the plain field selector when allowFunctionsOnLHS is false (default)', () => {
    render(<App />);
    // Gating off: no wrapper selector, just the inherited (default) field selector.
    expect(screen.queryByTestId(lhsFn)).toBeNull();
    expect(screen.getByTestId(fieldSel)).toBeInTheDocument();
    expect(rule0().lhs).toBeUndefined();
  });

  it('wraps the field in a unary function, then clears it', async () => {
    render(<App allowFunctionsOnLHS />);

    // Wrapper visible, "no function" selected, `rule.lhs` absent.
    const fnSel = screen.getByTestId(lhsFn);
    expect(fnSel).toHaveValue('');
    expect(rule0().lhs).toBeUndefined();

    // Only unary functions are offered (plus the "no function" sentinel); binary `+` is not.
    expect(within(fnSel).getByRole('option', { name: '—' })).toBeInTheDocument();
    expect(within(fnSel).getByRole('option', { name: 'ABS' })).toBeInTheDocument();
    expect(within(fnSel).queryByRole('option', { name: '+' })).toBeNull();

    // Choose `abs`: wraps the current field.
    await user.selectOptions(fnSel, 'abs');
    expect(rule0().lhs).toEqual({
      kind: 'func',
      fn: 'abs',
      args: [{ kind: 'field', field: 'price' }],
    });

    // Back to "no function": clears `rule.lhs`.
    await user.selectOptions(screen.getByTestId(lhsFn), '');
    expect(rule0().lhs).toBeUndefined();
  });

  it('re-points the wrapper to the new field on field change', async () => {
    render(<App allowFunctionsOnLHS />);

    await user.selectOptions(screen.getByTestId(lhsFn), 'abs');
    // Field change re-wraps atomically so the stored expression names the current field.
    await user.selectOptions(screen.getByTestId(fieldSel), 'qty');
    expect(rule0().field).toBe('qty');
    expect(rule0().lhs).toEqual({
      kind: 'func',
      fn: 'abs',
      args: [{ kind: 'field', field: 'qty' }],
    });
  });

  it('changes the field without a wrapper when no function is selected', async () => {
    render(<App allowFunctionsOnLHS />);
    // No wrapper chosen: a field change updates `field` and leaves `lhs` absent.
    await user.selectOptions(screen.getByTestId(fieldSel), 'qty');
    expect(rule0().field).toBe('qty');
    expect(rule0().lhs).toBeUndefined();
  });

  it('gates the wrapper per field with a predicate, dropping lhs when disallowed', async () => {
    render(<App allowFunctionsOnLHS={f => f === 'price'} />);

    // `price` is allowed: wrapper visible.
    expect(screen.getByTestId(lhsFn)).toBeInTheDocument();
    await user.selectOptions(screen.getByTestId(lhsFn), 'abs');
    expect(rule0().lhs).toEqual({
      kind: 'func',
      fn: 'abs',
      args: [{ kind: 'field', field: 'price' }],
    });

    // Switching to the disallowed `qty` drops the wrapper and the stored `lhs`.
    await user.selectOptions(screen.getByTestId(fieldSel), 'qty');
    expect(rule0().field).toBe('qty');
    expect(rule0().lhs).toBeUndefined();
    expect(screen.queryByTestId(lhsFn)).toBeNull();
  });

  it('merges a custom unary function into the wrapper options', async () => {
    const functions: ExpressionFunctionRegistry = {
      neg: { label: 'NEG', arity: 1 },
      raw: { arity: 1 },
    };
    render(<App allowFunctionsOnLHS functions={functions} />);

    const fnSel = screen.getByTestId(lhsFn);
    // Custom unary function joins the retained built-in unary `abs`; binary `+` is excluded.
    expect(within(fnSel).getByRole('option', { name: 'NEG' })).toBeInTheDocument();
    expect(within(fnSel).getByRole('option', { name: 'ABS' })).toBeInTheDocument();
    expect(within(fnSel).queryByRole('option', { name: '+' })).toBeNull();
    // A label-less function falls back to its registry key for the option text.
    expect(within(fnSel).getByRole('option', { name: 'raw' })).toBeInTheDocument();

    await user.selectOptions(fnSel, 'neg');
    expect(rule0().lhs).toEqual({
      kind: 'func',
      fn: 'neg',
      args: [{ kind: 'field', field: 'price' }],
    });
  });
});

describe('right-hand side expression value source', () => {
  it('renders the standard value editor until the expression source is selected', () => {
    render(<App />);
    // Two value sources are offered, defaulting to the scalar editor (no expression node).
    expect(screen.getByTestId(valueSourceSel)).toBeInTheDocument();
    expect(screen.getByTestId(valueEditor)).toBeInTheDocument();
    expect(screen.queryByTestId(rhsEditor)).toBeNull();
  });

  it('seeds and edits an expression when the expression source is selected', async () => {
    render(<App />);

    // Selecting `expression` flips the source and seeds a default function node.
    await user.selectOptions(screen.getByTestId(valueSourceSel), 'expression');
    expect(rule0().valueSource).toBe('expression');
    expect(rule0().value).toEqual({
      kind: 'func',
      fn: 'add',
      args: [
        { kind: 'field', field: 'price' },
        { kind: 'field', field: 'price' },
      ],
    });

    // The root node's `kind` selector is hidden (it is always a function call).
    expect(screen.getByTestId(rhsEditor)).toBeInTheDocument();
    expect(screen.getByTestId(`${rhsEditor}-fn`)).toBeInTheDocument();
    expect(screen.queryByTestId(`${rhsEditor}-kind`)).toBeNull();

    // Editing a nested argument writes straight into the stored node.
    await user.selectOptions(screen.getByTestId(`${rhsEditor}-arg0-field`), 'qty');
    expect((rule0().value as { args: unknown[] }).args[0]).toEqual({ kind: 'field', field: 'qty' });
  });

  it('reverts to a scalar value when switching back to the value source', async () => {
    render(<App />);

    await user.selectOptions(screen.getByTestId(valueSourceSel), 'expression');
    expect(rule0().valueSource).toBe('expression');

    // Switching away delegates to the standard handler, resetting the scalar value.
    await user.selectOptions(screen.getByTestId(valueSourceSel), 'value');
    expect(rule0().valueSource).toBe('value');
    expect(rule0().value).toBe('');
    expect(screen.queryByTestId(rhsEditor)).toBeNull();
  });

  it('relabels the expression option via translations', () => {
    render(<App translations={{ valueSourceExpression: { label: 'EXPR' } }} />);
    expect(
      within(screen.getByTestId(valueSourceSel)).getByRole('option', { name: 'EXPR' })
    ).toBeInTheDocument();
  });

  it('merges a custom function into the expression editor function options', async () => {
    const functions: ExpressionFunctionRegistry = { power: { label: 'POW', arity: 2 } };
    render(<App functions={functions} />);

    await user.selectOptions(screen.getByTestId(valueSourceSel), 'expression');
    const fnSel = screen.getByTestId(`${rhsEditor}-fn`);
    // Both custom and built-in functions are selectable for the expression root.
    expect(within(fnSel).getByRole('option', { name: 'POW' })).toBeInTheDocument();
    expect(within(fnSel).getByRole('option', { name: '+' })).toBeInTheDocument();

    await user.selectOptions(fnSel, 'power');
    expect(rule0().value).toMatchObject({ kind: 'func', fn: 'power' });
  });
});

describe('inherited (compat) controls', () => {
  const CustomValueEditor = (_props: ValueEditorProps) => (
    <span data-testid="custom-editor">custom</span>
  );
  const CustomFieldSelector = (_props: FieldSelectorProps) => (
    <span data-testid="custom-field">custom</span>
  );
  const CustomValueSourceSelector = (_props: ValueSourceSelectorProps) => (
    <span data-testid="custom-vss">custom</span>
  );

  it('hosts inherited field selector and value editor, overriding on expression enable', async () => {
    const Outer = getCompatContextProvider({
      controlElements: { valueEditor: CustomValueEditor, fieldSelector: CustomFieldSelector },
    });
    render(<App Outer={Outer} />);

    // LHS hosts the inherited field selector; the non-expression RHS delegates to the editor.
    expect(screen.getByTestId('custom-field')).toBeInTheDocument();
    expect(screen.getByTestId('custom-editor')).toBeInTheDocument();

    // Enabling the expression swaps the rule's editor for the expression editor; a literal
    // argument still renders via the inherited (themed) editor.
    await user.selectOptions(screen.getByTestId(valueSourceSel), 'expression');
    const exprRhs = screen.getByTestId(rhsEditor);
    expect(exprRhs).toBeInTheDocument();
    await user.selectOptions(screen.getByTestId(`${rhsEditor}-arg0-kind`), 'value');
    expect(within(exprRhs).getByTestId('custom-editor')).toBeInTheDocument();
  });

  it('hosts an inherited value-source selector', () => {
    const Outer = getCompatContextProvider({
      controlElements: { valueSourceSelector: CustomValueSourceSelector },
    });
    render(<App Outer={Outer} />);
    // The expression provider delegates rendering to the inherited value-source selector.
    expect(screen.getByTestId('custom-vss')).toBeInTheDocument();
  });
});
