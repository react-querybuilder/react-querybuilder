// `bun start` dev page for the expressions package (served via utils/devapp/server.ts).
// Mirrors packages/expr/dev/main.tsx but resolves the package from its built `dist` (the
// `@react-querybuilder/expr` specifiers) rather than `../src`. Demonstrates the core storage
// contract — LHS on `rule.lhs`, RHS via `valueSource: 'expression'` — through
// `QueryBuilderExpressions`, with live expr-aware SQL / parameterized / JSONLogic output.
import {
  expressionRuleProcessorJsonLogic,
  expressionRuleProcessorParameterized,
  expressionRuleProcessorSQL,
} from '@react-querybuilder/expr';
import { QueryBuilderExpressions } from '@react-querybuilder/expr/ui';
import * as React from 'react';
import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { Field, RuleGroupType } from 'react-querybuilder';
import { formatQuery, QueryBuilder } from 'react-querybuilder';
import { DevLayout } from '../DevLayout';
import { useDevApp } from '../useDevApp';
import '@react-querybuilder/expr/dist/expressions.css';

const fields: Field[] = [
  // `price` additionally allows an expression on its right-hand side.
  { name: 'price', label: 'Price', valueSources: ['value', 'expression'] },
  { name: 'quantity', label: 'Quantity' },
  { name: 'discount', label: 'Discount' },
];

const initialQuery: RuleGroupType = {
  combinator: 'and',
  rules: [
    // LHS unary wrapper: `ABS(discount) > 5`.
    {
      field: 'discount',
      operator: '>',
      value: 5,
      lhs: { kind: 'func', fn: 'abs', args: [{ kind: 'field', field: 'discount' }] },
    },
    // RHS expression: `price = (quantity * 2)`.
    {
      field: 'price',
      operator: '=',
      valueSource: 'expression',
      value: {
        kind: 'func',
        fn: 'multiply',
        args: [
          { kind: 'field', field: 'quantity' },
          { kind: 'value', value: 2 },
        ],
      },
    },
  ],
};

// Toggle the LHS function wrapper on/off; stable identity avoids reducer churn.
const extraOptions: Record<string, boolean> = {
  allowFunctionsOnLHS: true,
};

const App = () => {
  const [query, setQuery] = useState(initialQuery);

  // Pre-compute expr-aware exports; the shared harness renders these in its output panel.
  // (Standard formatQuery would drop `lhs` / mangle `valueSource: 'expression'`.)
  const exportFormats = useMemo(
    () => ({
      sql: formatQuery(query, { format: 'sql', ruleProcessor: expressionRuleProcessorSQL }),
      parameterized: JSON.stringify(
        formatQuery(query, {
          format: 'parameterized',
          ruleProcessor: expressionRuleProcessorParameterized,
        }),
        null,
        2
      ),
      jsonlogic: JSON.stringify(
        formatQuery(query, {
          format: 'jsonlogic',
          ruleProcessor: expressionRuleProcessorJsonLogic,
        }),
        null,
        2
      ),
    }),
    [query]
  );

  const devApp = useDevApp(extraOptions, exportFormats);

  // Override the default demo fields with the expr-specific fields.
  const queryBuilderProps = useMemo(
    () => ({ ...devApp.commonRQBProps, fields }),
    [devApp.commonRQBProps]
  );

  return (
    <DevLayout {...devApp}>
      <QueryBuilderExpressions allowFunctionsOnLHS={devApp.optVals.allowFunctionsOnLHS}>
        <QueryBuilder {...queryBuilderProps} query={query} onQueryChange={setQuery} />
      </QueryBuilderExpressions>
    </DevLayout>
  );
};

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
