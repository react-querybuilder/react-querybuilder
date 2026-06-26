// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { useState } from 'react';
import type { FullField, InputType, ParseNumbersPropConfig, Schema } from 'react-querybuilder';
import { defaultControlElements } from 'react-querybuilder';
import { defaultFunctions } from '../defaultFunctions';
import type { ExpressionNode } from '../types';
import type { ExpressionFunctionRegistry } from '../types';
import { ExpressionEditor } from './ExpressionEditor';
import type { ExpressionFieldOption } from './expressionEditorUtils';

const FIELDS: ExpressionFieldOption[] = [
  { name: 'price', label: 'Price' },
  { name: 'qty', label: 'Qty' },
];

// Minimal schema: only `controls` (for nested selectors/editor), the classname fields the
// default value editor reads, and `parseNumbers` (threaded to the literal editor) are
// exercised at runtime.
const makeSchema = (parseNumbers?: ParseNumbersPropConfig): Schema<FullField, string> =>
  ({
    controls: defaultControlElements,
    classNames: {},
    suppressStandardClassnames: false,
    parseNumbers,
  }) as unknown as Schema<FullField, string>;

const Harness = ({
  initial,
  registry = defaultFunctions,
  fields = FIELDS,
  parseNumbers,
  inputType,
}: {
  initial?: ExpressionNode;
  registry?: ExpressionFunctionRegistry;
  fields?: ExpressionFieldOption[];
  parseNumbers?: ParseNumbersPropConfig;
  inputType?: InputType | null;
}) => {
  const [node, setNode] = useState<ExpressionNode | undefined>(initial);
  return (
    <>
      <ExpressionEditor
        node={node}
        onChange={setNode}
        registry={registry}
        fields={fields}
        schema={makeSchema(parseNumbers)}
        inputType={inputType}
      />
      <pre data-testid="out">{JSON.stringify(node)}</pre>
    </>
  );
};

const out = (): ExpressionNode => JSON.parse(`${screen.getByTestId('out').textContent}`);
const sel = (id: string) => screen.getByTestId(id);

it('defaults an undefined node to an editable value node', () => {
  render(<Harness />);
  expect(sel('expr-kind')).toHaveValue('value');
  fireEvent.change(screen.getByTestId('expr-value'), { target: { value: 'hello' } });
  expect(out()).toEqual({ kind: 'value', value: 'hello' });
});

it('switches between node kinds, seeding sensible defaults', () => {
  render(<Harness initial={{ kind: 'field', field: 'price' }} />);

  fireEvent.change(sel('expr-kind'), { target: { value: 'func' } });
  expect(out()).toEqual({
    kind: 'func',
    fn: 'add',
    args: [
      { kind: 'field', field: 'price' },
      { kind: 'field', field: 'price' },
    ],
  });

  fireEvent.change(sel('expr-kind'), { target: { value: 'value' } });
  expect(out()).toEqual({ kind: 'value', value: '' });

  fireEvent.change(sel('expr-kind'), { target: { value: 'field' } });
  expect(out()).toEqual({ kind: 'field', field: 'price' });
});

it('edits a field reference', () => {
  render(<Harness initial={{ kind: 'field', field: 'price' }} />);
  fireEvent.change(sel('expr-field'), { target: { value: 'qty' } });
  expect(out()).toEqual({ kind: 'field', field: 'qty' });
});

it('keeps a literal as a string when parseNumbers is off (no "#" toggle)', () => {
  render(<Harness initial={{ kind: 'value', value: undefined }} />);
  // No numeric toggle is rendered.
  expect(screen.queryByTestId('expr-number')).toBeNull();
  // `?? ''` guard for a missing value
  expect(screen.getByTestId('expr-value')).toHaveValue('');

  fireEvent.change(screen.getByTestId('expr-value'), { target: { value: '100' } });
  expect(out()).toEqual({ kind: 'value', value: '100' });
});

it('parses a numeric literal when parseNumbers threads through from the schema', () => {
  render(<Harness initial={{ kind: 'value', value: '' }} parseNumbers />);

  fireEvent.change(screen.getByTestId('expr-value'), { target: { value: '250' } });
  expect(out()).toEqual({ kind: 'value', value: 250 });

  // Non-numeric input is left untouched (numeric-quantity returns NaN -> original string).
  fireEvent.change(screen.getByTestId('expr-value'), { target: { value: 'abc' } });
  expect(out()).toEqual({ kind: 'value', value: 'abc' });
});

it('uses numeric-quantity for enhanced parsing (fractions, trailing text)', () => {
  render(<Harness initial={{ kind: 'value', value: '' }} parseNumbers="enhanced" />);

  // Fraction/mixed-number parsing is beyond the old `Number()`-based coercion.
  fireEvent.change(screen.getByTestId('expr-value'), { target: { value: '1 1/2' } });
  expect(out()).toEqual({ kind: 'value', value: 1.5 });

  // Enhanced mode tolerates trailing non-numeric characters.
  fireEvent.change(screen.getByTestId('expr-value'), { target: { value: '3px' } });
  expect(out()).toEqual({ kind: 'value', value: 3 });
});

it('inherits inputType so "-limited" parseNumbers parses for a number field', () => {
  render(
    <Harness
      initial={{ kind: 'value', value: '' }}
      parseNumbers="strict-limited"
      inputType="number"
    />
  );

  // The literal editor renders as a number input (inherited from the field config).
  expect(screen.getByTestId('expr-value')).toHaveAttribute('type', 'number');

  // `-limited` only parses for `inputType: 'number'`, which we now inherit.
  fireEvent.change(screen.getByTestId('expr-value'), { target: { value: '5' } });
  expect(out()).toEqual({ kind: 'value', value: 5 });
});

it('leaves "-limited" parseNumbers as a no-op for a non-number field', () => {
  render(
    <Harness
      initial={{ kind: 'value', value: '' }}
      parseNumbers="strict-limited"
      inputType="text"
    />
  );

  fireEvent.change(screen.getByTestId('expr-value'), { target: { value: '5' } });
  expect(out()).toEqual({ kind: 'value', value: '5' });
});

it('edits a function node, resizing args and editing nested args', () => {
  render(
    <Harness
      initial={{
        kind: 'func',
        fn: 'multiply',
        args: [
          { kind: 'field', field: 'price' },
          { kind: 'field', field: 'qty' },
        ],
      }}
    />
  );

  // Edit a nested arg
  fireEvent.change(sel('expr-arg0-field'), { target: { value: 'qty' } });
  expect(out()).toMatchObject({ fn: 'multiply', args: [{ field: 'qty' }, { field: 'qty' }] });

  // Switch to a unary function: args shrink, first preserved
  fireEvent.change(sel('expr-fn'), { target: { value: 'abs' } });
  expect(out()).toEqual({ kind: 'func', fn: 'abs', args: [{ kind: 'field', field: 'qty' }] });

  // Switch back to binary: args grow, new slot defaulted
  fireEvent.change(sel('expr-fn'), { target: { value: 'multiply' } });
  expect(out()).toEqual({
    kind: 'func',
    fn: 'multiply',
    args: [
      { kind: 'field', field: 'qty' },
      { kind: 'field', field: 'price' },
    ],
  });
});

it('labels function options by key when no label is defined', () => {
  const registry: ExpressionFunctionRegistry = { weird: { arity: 1 } };
  render(
    <Harness
      registry={registry}
      initial={{ kind: 'func', fn: 'weird', args: [{ kind: 'field', field: 'price' }] }}
    />
  );
  const option = sel('expr-fn').querySelector('option')!;
  expect(option.textContent).toBe('weird');
});
