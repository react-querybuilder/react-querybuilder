import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { Field, RuleGroupType } from 'react-querybuilder';
import { QueryBuilder } from 'react-querybuilder';
import {
  CypherReturnEditor,
  GremlinProjectionEditor,
  SparqlSelectEditor,
  formatGraphQuery,
} from '../src';
import './styles.scss';

// ── Cypher Example ──────────────────────────────────────────────────────────

const cypherFields: Field[] = [
  { name: 'a.name', label: 'a.name' },
  { name: 'a.age', label: 'a.age' },
  { name: 'b.name', label: 'b.name' },
];

const initialCypherQuery: RuleGroupType = {
  combinator: 'and',
  rules: [
    {
      field: '_pattern',
      operator: '=',
      value: '',
      meta: {
        graphRole: 'pattern',
        nodeAlias: 'a',
        nodeLabel: 'Person',
        relType: 'KNOWS',
        targetAlias: 'b',
        targetLabel: 'Person',
        direction: 'outgoing',
      },
    },
    { field: 'a.age', operator: '>', value: '30' },
    { field: 'a.name', operator: 'contains', value: 'Alice' },
  ],
};

const CypherDemo = () => {
  const [query, setQuery] = useState(initialCypherQuery);
  const [includeReturn, setIncludeReturn] = useState(true);

  const output = useMemo(
    () => formatGraphQuery(query, { format: 'cypher', includeReturn }),
    [query, includeReturn]
  );

  return (
    <div className="graph-section">
      <h2>Cypher / GQL</h2>
      <QueryBuilder fields={cypherFields} query={query} onQueryChange={setQuery} />
      <div className="graph-companion">
        <strong>Projection</strong>
        <CypherReturnEditor
          query={query}
          includeReturn={includeReturn}
          onIncludeReturnChange={setIncludeReturn}
        />
      </div>
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
  rules: [
    {
      field: 'foaf:name',
      operator: '=',
      value: '?name',
      meta: { graphRole: 'pattern', subject: '?person' },
    },
    {
      field: 'foaf:age',
      operator: '=',
      value: '?age',
      meta: { graphRole: 'pattern', subject: '?person' },
    },
    { field: '?age', operator: '>', value: '30' },
  ],
};

const SparqlDemo = () => {
  const [query, setQuery] = useState(initialSparqlQuery);
  const [selectVariables, setSelectVariables] = useState<string[] | undefined>(undefined);
  const [prefixes, setPrefixes] = useState<Record<string, string>>({
    foaf: 'http://xmlns.com/foaf/0.1/',
  });

  const output = useMemo(
    () => formatGraphQuery(query, { format: 'sparql', selectVariables, prefixes }),
    [query, selectVariables, prefixes]
  );

  return (
    <div className="graph-section">
      <h2>SPARQL</h2>
      <QueryBuilder fields={sparqlFields} query={query} onQueryChange={setQuery} />
      <div className="graph-companion">
        <strong>Projection</strong>
        <SparqlSelectEditor
          query={query}
          selectVariables={selectVariables}
          onSelectVariablesChange={setSelectVariables}
          prefixes={prefixes}
          onPrefixesChange={setPrefixes}
        />
      </div>
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
    {
      field: '_pattern',
      operator: '=',
      value: '',
      meta: { graphRole: 'pattern', stepLabel: 'a', edgeLabel: 'knows', direction: 'out' },
    },
    { field: 'age', operator: '>', value: '30' },
    { field: 'name', operator: '=', value: 'Alice' },
  ],
};

const GremlinDemo = () => {
  const [query, setQuery] = useState(initialGremlinQuery);
  const [traversalSource, setTraversalSource] = useState('g');

  const output = useMemo(
    () => formatGraphQuery(query, { format: 'gremlin', traversalSource }),
    [query, traversalSource]
  );

  return (
    <div className="graph-section">
      <h2>Gremlin</h2>
      <QueryBuilder fields={gremlinFields} query={query} onQueryChange={setQuery} />
      <div className="graph-companion">
        <strong>Projection</strong>
        <GremlinProjectionEditor
          traversalSource={traversalSource}
          onTraversalSourceChange={setTraversalSource}
        />
      </div>
      <div className="graph-output">{output || <em>(empty)</em>}</div>
    </div>
  );
};

// ── App ─────────────────────────────────────────────────────────────────────

type GraphTab = 'cypher' | 'sparql' | 'gremlin';

const App = () => {
  const [tab, setTab] = useState<GraphTab>('cypher');

  const handleTabClick = useCallback((t: GraphTab) => () => setTab(t), []);

  const tabClass = (t: GraphTab) => `graph-tab${tab === t ? ' graph-tab--active' : ''}`;

  return (
    <div className="app-container">
      <h1>@react-querybuilder/graph</h1>
      <p>
        Companion component model — pattern rules (via <code>meta</code>) + filter rules (standard)
        + projection zone editors.
      </p>
      <nav className="graph-tabs">
        <button type="button" className={tabClass('cypher')} onClick={handleTabClick('cypher')}>
          Cypher / GQL
        </button>
        <button type="button" className={tabClass('sparql')} onClick={handleTabClick('sparql')}>
          SPARQL
        </button>
        <button type="button" className={tabClass('gremlin')} onClick={handleTabClick('gremlin')}>
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
