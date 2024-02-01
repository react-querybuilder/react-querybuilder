'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import type { Field, RuleGroupType } from 'react-querybuilder';
import { QueryBuilder, formatQuery } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';

const fields: Field[] = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];

const initialQuery: RuleGroupType = {
  combinator: 'and',
  rules: [
    { field: 'firstName', operator: 'beginsWith', value: 'Stev' },
    { field: 'lastName', operator: 'in', value: 'Vai,Vaughan' },
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

// Lazy load the QueryBuilder component so it doesn't get rendered on the server.
// See https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading#skipping-ssr
export const NextQueryBuilder = dynamic(QB, { ssr: false });
