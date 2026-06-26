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

const fields: Field[] = [
  { name: 'price', label: 'Price' },
  { name: 'quantity', label: 'Quantity' },
  { name: 'discount', label: 'Discount' },
  { name: '(expression)', label: 'ƒ(x) Expression' },
];

// `price * quantity >= 100`: LHS expression on `rule.lhs`, scalar RHS in `value`.
const initialQuery: RuleGroupType = {
  combinator: 'and',
  rules: [
    { field: 'discount', operator: '<', value: 10 },
    {
      field: '(expression)',
      operator: '>=',
      value: 100,
      lhs: {
        kind: 'func',
        fn: 'multiply',
        args: [
          { kind: 'field', field: 'price' },
          { kind: 'field', field: 'quantity' },
        ],
      },
    },
  ],
};

// expr exposes no extra harness toggles; stable identity avoids reducer churn.
const noExtraOptions: Record<string, boolean> = {};

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

  const devApp = useDevApp(noExtraOptions, exportFormats);

  // Override the default demo fields with expr-specific fields incl. the `(expression)` sentinel.
  const queryBuilderProps = useMemo(
    () => ({ ...devApp.commonRQBProps, fields }),
    [devApp.commonRQBProps]
  );

  return (
    <DevLayout {...devApp}>
      <QueryBuilderExpressions>
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
