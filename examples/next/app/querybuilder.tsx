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

const addRule = (
  <div
    style={{
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fff',
      fontSize: 32,
      fontWeight: 600,
    }}> 
    <svg viewBox="97.99 74.522 259.218 257.147" xmlns="http://www.w3.org/2000/svg">
      <rect x="98.826" y="74.522" width="211.98" height="36.718" fill="rgb(148, 210, 242)" />
      <rect x="99.608" y="130.399" width="169.032" height="36.718" fill="rgb(148, 210, 242)" />
      <rect x="98.539" y="184.18" width="126.387" height="36.718" fill="rgb(148, 210, 242)" />
      <rect x="99.535" y="238.547" width="82.122" height="36.718" fill="rgb(148, 210, 242)" />
      <rect x="98.914" y="290.671" width="38.011" height="38.718" fill="rgb(148, 210, 242)" />
      <rect x="179.166" y="239.978" width="175.602" height="36.718" fill="rgb(91, 220, 97)" />
      <rect x="272.055" y="130.568" width="82.683" height="36.718" fill="rgb(91, 220, 97)" />
      <rect x="312.791" y="76.568" width="40.924" height="36.718" fill="rgba(0, 0, 0, 0)" strokeWidth={4} stroke="rgb(148, 210, 242)" />
      <rect x="224.894" y="185.48" width="128.599" height="36.718" fill="rgba(0, 0, 0, 0)" strokeWidth={4} stroke="rgb(148, 210, 242)" />
      <rect x="137.57" y="292.748" width="215.565" height="36.718" fill="rgba(0, 0, 0, 0)" strokeWidth={4} stroke="rgb(148, 210, 242)" />
      <rect x="357.257" y="47.647" width="45.633" height="256.557" fill="rgb(39, 106, 140)" transform="matrix(1, 0, -0.832505, 1, -6.016057, 27.465117)" />
    </svg>
    <div style={{ marginTop: 20 }}>React Query Builder</div>
  </div>
);

export const QB = () => {
  const [query, setQuery] = useState(initialQuery);

  return (
    <>
      <QueryBuilder
        fields={fields}
        query={query}
        onQueryChange={(q) => setQuery(q)}
        translations={{
          addRule: {
            label: addRule as any
          }
        }}
      />
      <h4>Query</h4>
      <pre>
        <code>{formatQuery(query, "json")}</code>
      </pre>
    </>
  );
};
