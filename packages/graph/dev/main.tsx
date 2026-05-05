import * as React from 'react';
import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { Field, RuleGroupType } from 'react-querybuilder';
import { formatQuery, QueryBuilder } from 'react-querybuilder';
import './styles.scss';

// ── Cypher Example ──────────────────────────────────────────────────────────

const cypherFields: Field[] = [
  { name: 'n.name', label: 'n.name' },
  { name: 'n.age', label: 'n.age' },
];

const initialCypherQuery: RuleGroupType = {
  combinator: 'and',
  rules: [
    { field: 'n.age', operator: '>', value: '30' },
    { field: 'n.name', operator: 'contains', value: 'Alice' },
  ],
};

const CypherDemo = () => {
  const [query, setQuery] = useState(initialCypherQuery);

  const output = useMemo(() => formatQuery(query, 'cypher'), [query]);

  return (
    <div className="graph-section">
      <h2>Cypher / GQL</h2>
      <QueryBuilder fields={cypherFields} query={query} onQueryChange={setQuery} />
      <div className="graph-output">{output || <em>(empty)</em>}</div>
    </div>
  );
};

// ── SPARQL Example ──────────────────────────────────────────────────────────

const sparqlFields: Field[] = [
  { name: '?name', label: '?name' },
  { name: '?age', label: '?age' },
];

const initialSparqlQuery: RuleGroupType = {
  combinator: 'and',
  rules: [{ field: '?age', operator: '>', value: '30' }],
};

const SparqlDemo = () => {
  const [query, setQuery] = useState(initialSparqlQuery);

  const output = useMemo(() => formatQuery(query, 'sparql'), [query]);

  return (
    <div className="graph-section">
      <h2>SPARQL</h2>
      <QueryBuilder fields={sparqlFields} query={query} onQueryChange={setQuery} />
      <div className="graph-output">{output || <em>(empty)</em>}</div>
    </div>
  );
};

// ── Gremlin Example ─────────────────────────────────────────────────────────

const gremlinFields: Field[] = [
  { name: 'age', label: 'age' },
  { name: 'name', label: 'name' },
];

const initialGremlinQuery: RuleGroupType = {
  combinator: 'and',
  rules: [
    { field: 'age', operator: '>', value: '30' },
    { field: 'name', operator: '=', value: 'Alice' },
  ],
};

const GremlinDemo = () => {
  const [query, setQuery] = useState(initialGremlinQuery);

  const output = useMemo(() => formatQuery(query, 'gremlin'), [query]);

  return (
    <div className="graph-section">
      <h2>Gremlin</h2>
      <QueryBuilder fields={gremlinFields} query={query} onQueryChange={setQuery} />
      <div className="graph-output">{output || <em>(empty)</em>}</div>
    </div>
  );
};

// ── App ─────────────────────────────────────────────────────────────────────

type GraphTab = 'cypher' | 'sparql' | 'gremlin';

const App = () => {
  const [tab, setTab] = useState<GraphTab>('cypher');

  const tabClass = (t: GraphTab) => `graph-tab${tab === t ? ' graph-tab--active' : ''}`;

  return (
    <div className="app-container">
      <h1>Graph Query Formats (core)</h1>
      <p>
        WHERE-clause formatters now live in <code>@react-querybuilder/core</code>. Use{' '}
        <code>formatQuery(query, 'cypher')</code>, <code>'sparql'</code>, or <code>'gremlin'</code>.
      </p>
      <nav className="graph-tabs">
        <button type="button" className={tabClass('cypher')} onClick={() => setTab('cypher')}>
          Cypher / GQL
        </button>
        <button type="button" className={tabClass('sparql')} onClick={() => setTab('sparql')}>
          SPARQL
        </button>
        <button type="button" className={tabClass('gremlin')} onClick={() => setTab('gremlin')}>
          Gremlin
        </button>
      </nav>
      {tab === 'cypher' && <CypherDemo />}
      {tab === 'sparql' && <SparqlDemo />}
      {tab === 'gremlin' && <GremlinDemo />}
    </div>
  );
};

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
