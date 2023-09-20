"use client";

import { useState } from "react";
import type { Field, RuleGroupType } from "react-querybuilder";
import { QueryBuilder, formatQuery } from "react-querybuilder";
import "react-querybuilder/dist/query-builder.css";

const fields: Field[] = [
  { name: "firstName", label: "First Name" },
  { name: "lastName", label: "Last Name" },
];

const initialQuery: RuleGroupType = {
  combinator: "and",
  rules: [
    { field: "firstName", operator: "beginsWith", value: "Stev" },
    { field: "lastName", operator: "in", value: "Vai,Vaughan" },
  ],
};

export const NextQueryBuilder = () => {
  const [query, setQuery] = useState(initialQuery);

  return (
    <>
      <QueryBuilder
        fields={fields}
        query={query}
        onQueryChange={(q) => setQuery(q)}
      />
      <h4>Query</h4>
      <pre>
        <code>{formatQuery(query, "json")}</code>
      </pre>
    </>
  );
};
