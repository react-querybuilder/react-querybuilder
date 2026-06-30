// @vitest-environment jsdom
import { userEventSetup } from '@rqb-testing';
import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { useState } from 'react';
import type { FullField, InputType, ParseNumbersPropConfig, Schema } from 'react-querybuilder';
import { defaultControlElements } from 'react-querybuilder';
import { defaultFunctions } from '../defaultFunctions';
import type { ExpressionFunctionRegistry, ExpressionNode } from '../types';
import { ExpressionEditor } from './ExpressionEditor';

const user = userEventSetup();

// Minimal schema: only `controls` (for nested selectors/editor), the classname fields the
// default value editor reads, and `parseNumbers` (threaded to the literal editor) are
// exercised at runtime.
const makeSchema = (parseNumbers?: ParseNumbersPropConfig): Schema<FullField, string> =>
  ({
    fields: [
      { name: 'price', value: 'price', label: 'Price' },
      { name: 'qty', value: 'qty', label: 'Qty' },
    ],
    controls: defaultControlElements,
    classNames: {},
    suppressStandardClassnames: false,
    parseNumbers,
  }) as unknown as Schema<FullField, string>;

const Harness = ({
  initial,
  registry = defaultFunctions,
  parseNumbers,
  inputType,
  hideKindSelector,
}: {
  initial?: ExpressionNode;
  registry?: ExpressionFunctionRegistry;
  parseNumbers?: ParseNumbersPropConfig;
  inputType?: InputType | null;
  hideKindSelector?: boolean;
}) => {
  const [node, setNode] = useState<ExpressionNode | undefined>(initial);
  return (
    <>
      <ExpressionEditor
        node={node}
        onChange={setNode}
        registry={registry}
        schema={makeSchema(parseNumbers)}
        inputType={inputType}
        hideKindSelector={hideKindSelector}
      />
      <pre data-testid="out">{JSON.stringify(node)}</pre>
    </>
  );
};

const out = (): ExpressionNode => JSON.parse(`${screen.getByTestId('out').textContent}`);
const sel = (id: string) => screen.getByTestId(id);

it('defaults an undefined node to an editable value node', async () => {
  render(<Harness />);
  expect(sel('expr-kind')).toHaveValue('value');
  await user.type(screen.getByTestId('expr-value'), 'hello');
  expect(out()).toEqual({ kind: 'value', value: 'hello' });
});

it('switches between node kinds, seeding sensible defaults', async () => {
  render(<Harness initial={{ kind: 'field', field: 'price' }} />);

  await user.selectOptions(sel('expr-kind'), 'func');
  expect(out()).toEqual({
    kind: 'func',
    fn: 'add',
    args: [
      { kind: 'field', field: 'price' },
      { kind: 'field', field: 'price' },
    ],
  });

  await user.selectOptions(sel('expr-kind'), 'value');
  expect(out()).toEqual({ kind: 'value', value: '' });

  await user.selectOptions(sel('expr-kind'), 'field');
  expect(out()).toEqual({ kind: 'field', field: 'price' });
});

it('edits a field reference', async () => {
  render(<Harness initial={{ kind: 'field', field: 'price' }} />);
  await user.selectOptions(sel('expr-field'), 'qty');
  expect(out()).toEqual({ kind: 'field', field: 'qty' });
});

it('keeps a literal as a string when parseNumbers is off (no "#" toggle)', async () => {
  render(<Harness initial={{ kind: 'value', value: undefined }} />);
  // No numeric toggle is rendered.
  expect(screen.queryByTestId('expr-number')).toBeNull();
  // `?? ''` guard for a missing value
  expect(screen.getByTestId('expr-value')).toHaveValue('');

  await user.type(screen.getByTestId('expr-value'), '100');
  expect(out()).toEqual({ kind: 'value', value: '100' });
});

it('parses a numeric literal when parseNumbers threads through from the schema', async () => {
  render(<Harness initial={{ kind: 'value', value: '' }} parseNumbers />);

  await user.type(screen.getByTestId('expr-value'), '250');
  expect(out()).toEqual({ kind: 'value', value: 250 });
});

it('leaves a non-numeric literal untouched when parseNumbers is on', async () => {
  render(<Harness initial={{ kind: 'value', value: '' }} parseNumbers />);

  // Strict parse returns the original string for non-numeric input.
  await user.type(screen.getByTestId('expr-value'), 'abc');
  expect(out()).toEqual({ kind: 'value', value: 'abc' });
});

it('inherits inputType so "-limited" parseNumbers parses for a number field', async () => {
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
  await user.type(screen.getByTestId('expr-value'), '5');
  expect(out()).toEqual({ kind: 'value', value: 5 });
});

it('leaves "-limited" parseNumbers as a no-op for a non-number field', async () => {
  render(
    <Harness
      initial={{ kind: 'value', value: '' }}
      parseNumbers="strict-limited"
      inputType="text"
    />
  );

  await user.type(screen.getByTestId('expr-value'), '5');
  expect(out()).toEqual({ kind: 'value', value: '5' });
});

it('edits a function node, resizing args and editing nested args', async () => {
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
  await user.selectOptions(sel('expr-arg0-field'), 'qty');
  expect(out()).toMatchObject({ fn: 'multiply', args: [{ field: 'qty' }, { field: 'qty' }] });

  // Switch to a unary function: args shrink, first preserved
  await user.selectOptions(sel('expr-fn'), 'abs');
  expect(out()).toEqual({ kind: 'func', fn: 'abs', args: [{ kind: 'field', field: 'qty' }] });

  // Switch back to binary: args grow, new slot defaulted
  await user.selectOptions(sel('expr-fn'), 'multiply');
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

it('hides the root kind selector while keeping function controls when hideKindSelector is set', () => {
  render(
    <Harness
      hideKindSelector
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

  // Root `kind` selector suppressed...
  expect(screen.queryByTestId('expr-kind')).toBeNull();
  // ...but the function selector and its nested-argument editors still render.
  expect(sel('expr-fn')).toBeInTheDocument();
  expect(sel('expr-arg0-field')).toBeInTheDocument();
  // Nested arguments keep their own kind selectors so users can pick fields/values/calls.
  expect(sel('expr-arg0-kind')).toBeInTheDocument();
});
