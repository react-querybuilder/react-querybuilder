// @vitest-environment jsdom
import { userEventSetup } from '@rqb-testing';
import { render, screen, within } from '@testing-library/react';
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
import { ExprTestID, QueryBuilderExpressions } from '../index.ui';
import type { TranslationsExpr } from '../index.ui';
import type { ExpressionFunctionRegistry } from '../types';

// Expression control testIDs. Each editor derives child IDs from its root testID
// (`${root}-kind` / `-field` / `-fn` / `-value`); toggles use their own constants.
const lhsToggle = ExprTestID.exprLhsToggle;
const lhsEditor = ExprTestID.exprLhsEditor;
const lhsKind = `${lhsEditor}-kind`;
const lhsField = `${lhsEditor}-field`;
const lhsFn = `${lhsEditor}-fn`;
const rhsToggle = ExprTestID.exprRhsToggle;
const rhsEditor = ExprTestID.exprRhsEditor;
const rhsValue = `${rhsEditor}-value`;

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
  /** Defaults to `true` here (the harness exercises the LHS toggle) unlike the prop's own default. */
  showFieldExpressionToggle?: boolean;
  /** Left `undefined` so the provider's own `true` default applies unless a test opts out. */
  showValueExpressionToggle?: boolean;
  /** Per-key overrides for the expression-toggle labels/titles. */
  translations?: Partial<TranslationsExpr>;
}

// Stateful host: a controlled QueryBuilder wrapped by the expression provider, dumping the
// live query so assertions can read `rule.lhs` / `valueSource` / `value` after each edit.
const App = ({
  functions,
  Outer,
  parseNumbers,
  fields: fieldsProp = fields,
  showFieldExpressionToggle = true,
  showValueExpressionToggle,
  translations,
}: AppProps) => {
  const [query, setQuery] = useState<RuleGroupType>(initialQuery);
  const inner = (
    <QueryBuilderExpressions
      functions={functions}
      showFieldExpressionToggle={showFieldExpressionToggle}
      showValueExpressionToggle={showValueExpressionToggle}
      translations={translations}>
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

const user = userEventSetup();

describe('left-hand side (field selector host)', () => {
  it('toggles an LHS expression on, edits it, then clears it', async () => {
    render(<App />);

    // Off by default: no editor, `rule.lhs` absent.
    expect(rule0().lhs).toBeUndefined();
    expect(screen.queryByTestId(lhsEditor)).toBeNull();

    // Toggle on: seeds a field node from the first field.
    await user.click(screen.getByTestId(lhsToggle));
    expect(rule0().lhs).toEqual({ kind: 'field', field: 'price' });

    // Edit the field reference.
    await user.selectOptions(screen.getByTestId(lhsField), 'qty');
    expect(rule0().lhs).toEqual({ kind: 'field', field: 'qty' });

    // Switch to a function node (fresh default args, independent of the prior field edit).
    await user.selectOptions(screen.getByTestId(lhsKind), 'func');
    expect(rule0().lhs).toEqual({
      kind: 'func',
      fn: 'add',
      args: [
        { kind: 'field', field: 'price' },
        { kind: 'field', field: 'price' },
      ],
    });

    // Toggle off: clears `rule.lhs`.
    await user.click(screen.getByTestId(lhsToggle));
    expect(rule0().lhs).toBeUndefined();
    expect(screen.queryByTestId(lhsEditor)).toBeNull();
  });

  it('synthesizes field data when the sentinel field is unconfigured', async () => {
    // `price` (the rule's field) is absent from this list, so the inputType resolver must
    // fall back to a synthesized field instead of choking on the fieldMap miss.
    render(<App fields={[{ name: 'qty', label: 'Qty' }]} />);

    await user.click(screen.getByTestId(lhsToggle));
    // Toggling still works; the seeded node uses the first available field.
    expect(rule0().lhs).toEqual({ kind: 'field', field: 'qty' });
  });

  it('renders the plain field selector when showFieldExpressionToggle is false', () => {
    render(<App showFieldExpressionToggle={false} />);
    // Gating off: no expression toggle/editor, just the inherited (default) field selector.
    expect(screen.queryByTestId(lhsToggle)).toBeNull();
    expect(screen.queryByTestId(lhsEditor)).toBeNull();
    expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0);
  });
});

describe('right-hand side (value editor host)', () => {
  it('toggles an RHS expression on, edits it, then disables it', async () => {
    render(<App />);

    // Off by default: standard editor (no expression node), source is the default `'value'`.
    expect(screen.queryByTestId(rhsEditor)).toBeNull();

    // Enable: flips `valueSource` to `'expression'` and seeds an empty value node.
    await user.click(screen.getByTestId(rhsToggle));
    expect(rule0().valueSource).toBe('expression');
    expect(rule0().value).toEqual({ kind: 'value', value: '' });

    // Edit the literal: written straight into `rule.value` via `handleOnChange`.
    await user.type(screen.getByTestId(rhsValue), '5');
    expect(rule0().value).toEqual({ kind: 'value', value: '5' });

    // Disable: reverts to `valueSource: 'value'` and resets the scalar value.
    await user.click(screen.getByTestId(rhsToggle));
    expect(rule0().valueSource).toBe('value');
    expect(rule0().value).toBe('');
    expect(screen.queryByTestId(rhsEditor)).toBeNull();
  });

  it("threads the QueryBuilder's parseNumbers through to the RHS literal", async () => {
    render(<App parseNumbers />);

    await user.click(screen.getByTestId(rhsToggle));
    // With parseNumbers enabled, a numeric literal is stored as an actual number.
    await user.type(screen.getByTestId(rhsValue), '5');
    expect(rule0().value).toEqual({ kind: 'value', value: 5 });
  });

  it('inherits the field inputType so a "-limited" parseNumbers parses for number fields', async () => {
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

    await user.click(screen.getByTestId(rhsToggle));
    await user.type(screen.getByTestId(rhsValue), '5');
    expect(rule0().value).toEqual({ kind: 'value', value: 5 });
  });

  it("seeds the field's default value into the RHS expression node", async () => {
    render(
      <App
        fields={[
          { name: 'price', label: 'Price', defaultValue: 'abc' },
          { name: 'qty', label: 'Qty' },
        ]}
      />
    );

    await user.click(screen.getByTestId(rhsToggle));
    // The seeded value node carries the field's configured `defaultValue`.
    expect(rule0().value).toEqual({ kind: 'value', value: 'abc' });
  });

  it('seeds the first value-list option when the field uses a select editor', async () => {
    render(
      <App
        fields={[
          {
            name: 'price',
            label: 'Price',
            valueEditorType: 'select',
            values: [
              { name: 'a', label: 'A' },
              { name: 'b', label: 'B' },
            ],
          },
          { name: 'qty', label: 'Qty' },
        ]}
      />
    );

    await user.click(screen.getByTestId(rhsToggle));
    // First option of the field's value list seeds the value node.
    expect(rule0().value).toEqual({ kind: 'value', value: 'a' });
  });

  it("seeds a field node when the field's first valueSource is 'field'", async () => {
    render(
      <App
        fields={[
          { name: 'price', label: 'Price', valueSources: ['field'] },
          { name: 'qty', label: 'Qty' },
        ]}
      />
    );

    await user.click(screen.getByTestId(rhsToggle));
    // `valueSource: 'field'` seeds a field node naming the first comparator-valid field.
    expect(rule0().value).toEqual({ kind: 'field', field: 'qty' });
  });

  it('renders the plain value editor when showValueExpressionToggle is false', () => {
    render(<App showValueExpressionToggle={false} />);
    // Gating off: no expression toggle/editor, just the inherited (default) value editor.
    expect(screen.queryByTestId(rhsToggle)).toBeNull();
    expect(screen.queryByTestId(rhsEditor)).toBeNull();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});

describe('function registry', () => {
  it('merges the `functions` prop over the built-ins', async () => {
    const functions: ExpressionFunctionRegistry = { power: { label: 'POW', arity: 2 } };
    render(<App functions={functions} />);

    await user.click(screen.getByTestId(lhsToggle));
    await user.selectOptions(screen.getByTestId(lhsKind), 'func');

    const fnSelect = screen.getByTestId(lhsFn);
    // Custom function is selectable alongside the retained built-ins.
    expect(within(fnSelect).getByRole('option', { name: 'POW' })).toBeInTheDocument();
    expect(within(fnSelect).getByRole('option', { name: '+' })).toBeInTheDocument();

    await user.selectOptions(fnSelect, 'power');
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

  it('renders inherited controls for the non-expression case, then overrides on enable', async () => {
    render(<App Outer={Outer} />);

    // Non-expression RHS delegates to the inherited editor; LHS hosts the inherited selector.
    expect(screen.getByTestId('custom-editor')).toBeInTheDocument();
    expect(screen.getByTestId('custom-field')).toBeInTheDocument();

    // Enabling the RHS expression swaps the rule's editor for the expression editor, whose
    // literal sub-input still renders via the inherited (themed) editor.
    await user.click(screen.getByTestId(rhsToggle));
    const exprRhs = screen.getByTestId(rhsEditor);
    expect(exprRhs).toBeInTheDocument();
    expect(within(exprRhs).getByTestId('custom-editor')).toBeInTheDocument();
  });
});

describe('expression toggle labels', () => {
  const exprGlyph = '𝑓(𝑥)'; // active (is an expression)
  const plainGlyph = '𝑥'; // inactive (plain field/value)

  it('shows state-indicating label/title for the LHS toggle', async () => {
    render(<App />);
    const lhs = () => screen.getByTestId(lhsToggle);

    // Off: plain-operand glyph, title naming the enable action.
    expect(lhs()).toHaveTextContent(plainGlyph);
    expect(lhs()).toHaveAttribute('title', 'Use a left-hand side expression');

    await user.click(lhs());
    // On: function glyph, title naming the revert action.
    expect(lhs()).toHaveTextContent(exprGlyph);
    expect(lhs()).toHaveAttribute('title', 'Use a left-hand side field');
  });

  it('shows state-indicating label/title for the RHS toggle', async () => {
    render(<App />);
    const rhs = () => screen.getByTestId(rhsToggle);

    expect(rhs()).toHaveTextContent(plainGlyph);
    expect(rhs()).toHaveAttribute('title', 'Use a right-hand side expression');

    await user.click(rhs());
    expect(rhs()).toHaveTextContent(exprGlyph);
    expect(rhs()).toHaveAttribute('title', 'Use a right-hand side value');
  });

  it('applies per-state translation overrides on both sides', async () => {
    render(
      <App
        translations={{
          exprToggleLHS: { label: 'LHS-OFF', title: 'lhs-off' },
          exprToggleLHSActive: { label: 'LHS-ON', title: 'lhs-on' },
          exprToggleRHS: { label: 'RHS-OFF', title: 'rhs-off' },
          exprToggleRHSActive: { label: 'RHS-ON', title: 'rhs-on' },
        }}
      />
    );

    // Inactive overrides applied up front.
    expect(screen.getByTestId(lhsToggle)).toHaveTextContent('LHS-OFF');
    expect(screen.getByTestId(rhsToggle)).toHaveTextContent('RHS-OFF');

    await user.click(screen.getByTestId(lhsToggle));
    await user.click(screen.getByTestId(rhsToggle));

    // Active overrides applied after enabling each side.
    expect(screen.getByTestId(lhsToggle)).toHaveTextContent('LHS-ON');
    expect(screen.getByTestId(lhsToggle)).toHaveAttribute('title', 'lhs-on');
    expect(screen.getByTestId(rhsToggle)).toHaveTextContent('RHS-ON');
    expect(screen.getByTestId(rhsToggle)).toHaveAttribute('title', 'rhs-on');
  });
});
