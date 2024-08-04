'use client';

import { useState , useDeferredValue} from 'react';
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

/**
 * NOTE: This can work without the `ClientOnly` wrapper as long as each object in
 * the query hierarchy (including the query object itself) already has a unique
 * `id` property at the time of server rendering. You can use the `prepareRuleGroup`
 * function to add `id`s automatically.
 */
export const NextQueryBuilder = () => {
  const [query, setQuery] = useState(initialQuery);
  const differedQuery = useDeferredValue(query);

  return (
    <>
      <ClientOnly>
        <QueryBuilder fields={fields} query={query} onQueryChange={setQuery} />
      </ClientOnly>
      <h4>Query</h4>
      <pre>
        <code>{formatQuery(differedQuery, 'json')}</code>
      </pre>
    </>
  );
};

/**
 * If the query doesn't have `id`s and you don't want to use `ClientOnly`, the component must
 * be lazy-loaded without SSR to avoid hydration errors. See
 * https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading#skipping-ssr.
 * To enable SSR-less lazy-loading, uncomment the following lines, remove the existing export
 * declaration, and rename the function component `QB`:
 */
// import dynamic from 'next/dynamic';
// export const NextQueryBuilder = dynamic(() => Promise.resolve(QB), {
//   ssr: false,
// });
