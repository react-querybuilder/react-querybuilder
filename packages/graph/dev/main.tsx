// oxlint-disable react_perf/jsx-no-new-function-as-prop react_perf/jsx-no-new-object-as-prop

import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type {
  ActionProps,
  Field,
  RuleGroupType,
  RuleType,
  ValueEditorProps,
} from 'react-querybuilder';
import { QueryBuilder, ValueEditor, update } from 'react-querybuilder';
import type { GraphLang, GraphMetaBase } from '../src';
import {
  CypherReturnEditor,
  GraphMetaEditor,
  GremlinProjectionEditor,
  SparqlSelectEditor,
  formatGraphQuery,
} from '../src';
import './styles.scss';

// ── Default pattern meta per language ───────────────────────────────────────

const defaultPatternMeta: Record<GraphLang, GraphMetaBase> = {
  cypher: { graphRole: 'pattern', nodeAlias: '', nodeLabel: '', direction: 'outgoing' },
  gql: { graphRole: 'pattern', nodeAlias: '', nodeLabel: '', direction: 'outgoing' },
  sparql: { graphRole: 'pattern', subject: '' },
  gremlin: { graphRole: 'pattern', stepLabel: '', edgeLabel: '', direction: 'out' },
};

// ── Custom "Add Rule" action ────────────────────────────────────────────────

/**
 * Replaces the default "+ Rule" button with two buttons:
 * - **+ Rule** adds a normal filter rule
 * - **+ Pattern** adds a rule pre-populated with `graphRole: 'pattern'` meta
 *
 * The "+ Pattern" button passes `{ addAsPattern: true }` as the `context`
 * argument to `handleOnClick`, which is forwarded to `onAddRule`.
 */
const GraphAddRuleAction = (props: ActionProps) => {
  const {
    handleOnClick,
    disabled,
    className,
    schema: {
      controls: { actionElement: GenericActionElement },
    },
  } = props;

  return (
    <span className="graph-addRuleActions">
      <GenericActionElement {...props} />
      <GenericActionElement
        {...props}
        label="+ Pattern"
        title="Add graph pattern rule"
        disabled={disabled}
        handleOnClick={e => handleOnClick(e, { addAsPattern: true })}
        className={className + ' graph-addPatternAction'}
      />
    </span>
  );
};

// ── onAddRule callback ──────────────────────────────────────────────────────

/**
 * Returns an `onAddRule` handler for the given graph language.
 * When the "+ Pattern" button triggers a rule add, the handler sets the
 * rule's `field` to `'_pattern'` and populates `meta` with language defaults.
 */
const makeOnAddRule =
  (graphLang: GraphLang) =>
  (
    rule: RuleType,
    _parentPath: number[],
    _query: RuleGroupType,
    ctx?: { addAsPattern?: boolean }
  ) => {
    if (ctx?.addAsPattern) {
      return {
        ...rule,
        field: '_pattern',
        operator: '=',
        value: '',
        meta: { ...defaultPatternMeta[graphLang] },
      };
    }
    return true;
  };

// ── Custom Value Editor ─────────────────────────────────────────────────────

/**
 * A value editor that renders {@link GraphMetaEditor} for pattern rules
 * (those with `meta.graphRole === 'pattern'`) and falls back to the
 * default {@link ValueEditor} for everything else.
 *
 * Pass `graphLang` via the QueryBuilder `context` prop.
 */
const GraphValueEditor = (props: ValueEditorProps) => {
  const { rule, schema, path, context } = props;
  const graphLang = (context?.graphLang ?? 'cypher') as GraphLang;
  const meta = rule.meta as Record<string, unknown> | undefined;

  if (meta?.graphRole === 'pattern') {
    const handleMetaChange = (newMeta: GraphMetaBase) => {
      const updated = update(schema.getQuery() as RuleGroupType, 'meta', newMeta, path);
      schema.dispatchQuery(updated);
    };

    return (
      <GraphMetaEditor
        rule={rule}
        handleOnChange={handleMetaChange}
        graphLang={graphLang}
        disabled={props.disabled}
      />
    );
  }

  return <ValueEditor {...props} />;
};

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

  const onAddRule = useMemo(() => makeOnAddRule('cypher'), []);

  return (
    <div className="graph-section">
      <h2>Cypher / GQL</h2>
      <QueryBuilder
        fields={cypherFields}
        query={query}
        onQueryChange={setQuery}
        controlElements={{ valueEditor: GraphValueEditor, addRuleAction: GraphAddRuleAction }}
        context={{ graphLang: 'cypher' as GraphLang }}
        onAddRule={onAddRule}
      />
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

  const onAddRule = useMemo(() => makeOnAddRule('sparql'), []);

  return (
    <div className="graph-section">
      <h2>SPARQL</h2>
      <QueryBuilder
        fields={sparqlFields}
        query={query}
        onQueryChange={setQuery}
        controlElements={{ valueEditor: GraphValueEditor, addRuleAction: GraphAddRuleAction }}
        context={{ graphLang: 'sparql' as GraphLang }}
        onAddRule={onAddRule}
      />
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

  const onAddRule = useMemo(() => makeOnAddRule('gremlin'), []);

  return (
    <div className="graph-section">
      <h2>Gremlin</h2>
      <QueryBuilder
        fields={gremlinFields}
        query={query}
        onQueryChange={setQuery}
        controlElements={{ valueEditor: GraphValueEditor, addRuleAction: GraphAddRuleAction }}
        context={{ graphLang: 'gremlin' as GraphLang }}
        onAddRule={onAddRule}
      />
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
