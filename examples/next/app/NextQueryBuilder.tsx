'use client';

import { useState } from 'react';
import type { Field, RuleGroupType } from 'react-querybuilder';
import { QueryBuilder, formatQuery } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';

const fields: Field[] = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];

const initialQuery: RuleGroupType = {
  id: 'root',
  combinator: 'and',
  rules: [
    {
      id: 'rule1',
      field: 'firstName',
      operator: 'beginsWith',
      value: 'Stev',
    },
    {
      id: 'rule2',
      field: 'lastName',
      operator: 'in',
      value: 'Vai,Vaughan',
    },
  ],
};

const QB = () => {
  const [query, setQuery] = useState(initialQuery);

  return (
    <>
      <QueryBuilder fields={fields} query={query} onQueryChange={setQuery} />
      <h4>Query</h4>
      <pre>
        <code>{formatQuery(query, 'json')}</code>
      </pre>
    </>
  );
};

// NOTE: This only works if each object in the query hierarchy (including the query
// object itself) has a unique `id` property at the time of server rendering.
export const NextQueryBuilder = QB;

// If the query doesn't have `id`s, the component must be lazy-loaded without SSR
// to avoid conflicting props during hydration.
// See https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading#skipping-ssr

// Uncomment the following lines and remove the existing export to enable SSR-less lazy-loading
// import dynamic from 'next/dynamic';
// export const NextQueryBuilder = dynamic(() => Promise.resolve(QB), {
//   ssr: false,
// });
