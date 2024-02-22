'use client';

import { useState } from 'react';
import type { Field, RuleGroupType } from 'react-querybuilder';
import { QueryBuilder, formatQuery } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';
import { ClientOnly } from './ClientOnly';

const fields: Field[] = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];

const initialQuery: RuleGroupType = {
  combinator: 'and',
  rules: [
    {
      field: 'firstName',
      operator: 'beginsWith',
      value: 'Stev',
    },
    {
      field: 'lastName',
      operator: 'in',
      value: 'Vai,Vaughan',
    },
  ],
};

// NOTE: This works without the `ClientOnly` wrapper as long as each object in the query
// hierarchy (including the query object itself) has a unique `id` property at the time of
// server rendering.
export const NextQueryBuilder = () => {
  const [query, setQuery] = useState(initialQuery);

  return (
    <>
      <ClientOnly>
        <QueryBuilder fields={fields} query={query} onQueryChange={setQuery} />
      </ClientOnly>
      <h4>Query</h4>
      <pre>
        <code>{formatQuery(query, 'json')}</code>
      </pre>
    </>
  );
};

// If the query doesn't have `id`s, the component must be lazy-loaded without SSR
// to avoid conflicting props during hydration.
// See https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading#skipping-ssr

// Uncomment the following lines, remove the existing export, and rename the component `QB` to enable
// SSR-less lazy-loading:
// import dynamic from 'next/dynamic';
// export const NextQueryBuilder = dynamic(() => Promise.resolve(QB), {
//   ssr: false,
// });
