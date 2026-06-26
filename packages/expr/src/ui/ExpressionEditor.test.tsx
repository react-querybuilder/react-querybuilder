// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { useState } from 'react';
import { defaultFunctions } from '../defaultFunctions';
import type { ExpressionNode } from '../types';
import type { ExpressionFunctionRegistry } from '../types';
import { ExpressionEditor } from './ExpressionEditor';
import type { ExpressionFieldOption } from './expressionEditorUtils';

const FIELDS: ExpressionFieldOption[] = [
  { name: 'price', label: 'Price' },
  { name: 'qty', label: 'Qty' },
];

const Harness = ({
  initial,
  registry = defaultFunctions,
  fields = FIELDS,
}: {
  initial?: ExpressionNode;
  registry?: ExpressionFunctionRegistry;
  fields?: ExpressionFieldOption[];
}) => {
  const [node, setNode] = useState<ExpressionNode | undefined>(initial);
  return (
    <>
      <ExpressionEditor node={node} onChange={setNode} registry={registry} fields={fields} />
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
  expect(out()).toEqual({ kind: 'value', value: 'hello', valueType: undefined });
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

it('edits a literal as a string, then as a number via the toggle', () => {
  render(<Harness initial={{ kind: 'value', value: undefined }} />);
  // `?? ''` guard for a missing value
  expect(screen.getByTestId('expr-value')).toHaveValue('');

  fireEvent.change(screen.getByTestId('expr-value'), { target: { value: '100' } });
  expect(out()).toEqual({ kind: 'value', value: '100', valueType: undefined });

  // Enable numeric: existing string is coerced
  fireEvent.click(screen.getByTestId('expr-number'));
  expect(out()).toEqual({ kind: 'value', value: 100, valueType: 'number' });

  // Editing while numeric coerces input
  fireEvent.change(screen.getByTestId('expr-value'), { target: { value: '250' } });
  expect(out()).toEqual({ kind: 'value', value: 250, valueType: 'number' });

  // Disable numeric: value reverts to a string
  fireEvent.click(screen.getByTestId('expr-number'));
  expect(out()).toEqual({ kind: 'value', value: '250', valueType: undefined });
});

it('falls back to an empty string when disabling the number toggle on a nullish value', () => {
  render(<Harness initial={{ kind: 'value', value: undefined, valueType: 'number' }} />);
  expect(screen.getByTestId('expr-number')).toBeChecked();

  // Unchecking while `value` is nullish exercises the `?? ''` fallback.
  fireEvent.click(screen.getByTestId('expr-number'));
  expect(out()).toEqual({ kind: 'value', value: '', valueType: undefined });
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
  const registry: ExpressionFunctionRegistry = { weird: { name: 'weird', arity: 1 } };
  render(
    <Harness
      registry={registry}
      initial={{ kind: 'func', fn: 'weird', args: [{ kind: 'field', field: 'price' }] }}
    />
  );
  const option = sel('expr-fn').querySelector('option')!;
  expect(option.textContent).toBe('weird');
});
