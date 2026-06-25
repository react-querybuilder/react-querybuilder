// Minimal dev harness for the expressions package. The interactive expression
// builder UI lands in a later milestone (M4); for now this demonstrates the
// data model + export processors (M1/M2) against a hand-built expression query.
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import type { Field, RuleGroupType } from 'react-querybuilder';
import { formatQuery, QueryBuilder } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';
import type { ExpressionNode } from '../src';
import {
  expressionRuleProcessorJsonLogic,
  expressionRuleProcessorParameterized,
  expressionRuleProcessorSQL,
} from '../src';

const fields: Field[] = [
  { name: 'price', label: 'Price' },
  { name: 'quantity', label: 'Quantity' },
  { name: 'discount', label: 'Discount' },
  { name: '(expression)', label: 'ƒ(x) Expression' },
];

// `price * quantity` — LHS expression stored on `rule.lhs`.
const priceTimesQuantity: ExpressionNode = {
  kind: 'func',
  fn: 'multiply',
  args: [
    { kind: 'field', field: 'price' },
    { kind: 'field', field: 'quantity' },
  ],
};

// `price * quantity >= 100`
const query: RuleGroupType = {
  combinator: 'and',
  rules: [
    { field: 'discount', operator: '<', value: 10 },
    { field: '(expression)', operator: '>=', value: 100, lhs: priceTimesQuantity },
  ],
};

function App() {
  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
      <h2>@react-querybuilder/expr — dev harness</h2>
      <QueryBuilder fields={fields} defaultQuery={query} />
      <h3>SQL</h3>
      <pre>{formatQuery(query, { format: 'sql', ruleProcessor: expressionRuleProcessorSQL })}</pre>
      <h3>Parameterized</h3>
      <pre>
        {JSON.stringify(
          formatQuery(query, {
            format: 'parameterized',
            ruleProcessor: expressionRuleProcessorParameterized,
          }),
          null,
          2
        )}
      </pre>
      <h3>JSONLogic</h3>
      <pre>
        {JSON.stringify(
          formatQuery(query, {
            format: 'jsonlogic',
            ruleProcessor: expressionRuleProcessorJsonLogic,
          }),
          null,
          2
        )}
      </pre>
    </div>
  );
}

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
