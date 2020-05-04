import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { nanoid } from 'nanoid';
import QueryBuilder, { formatQuery } from '../src';
import '../src/query-builder.scss';

const preparedFields = {
  primary: [{ name: 'firstName', label: 'First Name' }, { name: 'lastName', label: 'Last Name' }],
  secondary: [
    { name: 'age', label: 'Age' },
    { name: 'isMusician', label: 'Is a musician' },
    { name: 'instrument', label: 'Instrument' }
  ],
  generic: [
    { name: 'firstName', label: 'First name' },
    { name: 'lastName', label: 'Last name' },
    { name: 'age', label: 'Age' },
    { name: 'gender', label: 'Gender' },
    { name: 'height', label: 'Height' },
    { name: 'job', label: 'Job' }
  ]
};

const preparedQueries = {
  primary: {
    id: `g-${nanoid()}`,
    rules: [
      {
        id: `r-${nanoid()}`,
        field: 'firstName',
        value: 'Steve',
        operator: '='
      },
      {
        id: `r-${nanoid()}`,
        field: 'lastName',
        value: 'Vai',
        operator: '='
      }
    ],
    combinator: 'and',
    not: false
  },
  secondary: {
    id: `g-${nanoid()}`,
    rules: [
      {
        field: 'age',
        id: `r-${nanoid()}`,
        operator: '>',
        value: '28'
      },
      {
        field: 'isMusician',
        id: `r-${nanoid()}`,
        operator: '=',
        value: true
      },
      {
        field: 'instrument',
        id: `r-${nanoid()}`,
        operator: '=',
        value: 'Guitar'
      }
    ],
    combinator: 'or',
    not: false
  },
  generic: {
    combinator: 'and',
    not: false,
    rules: []
  }
};

const getOperators = (field) => {
  switch (field) {
    case 'instrument':
    case 'isMusician':
      return [{ name: '=', label: 'is' }];

    default:
      return null;
  }
};

const getValueEditorType = (field, operator) => {
  switch (field) {
    case 'gender':
      return 'radio';

    case 'instrument':
      return 'select';

    case 'isMusician':
      return 'checkbox';

    default:
      return 'text';
  }
};

const getInputType = (field, operator) => {
  switch (field) {
    case 'age':
      return 'number';

    default:
      return 'text';
  }
};

const getValues = (field, operator) => {
  switch (field) {
    case 'instrument':
      return [
        { name: 'Guitar', label: 'Guitar' },
        { name: 'Piano', label: 'Piano' },
        { name: 'Vocals', label: 'Vocals' },
        { name: 'Drums', label: 'Drums' }
      ];

    case 'gender':
      return [
        { name: 'M', label: 'Male' },
        { name: 'F', label: 'Female' },
        { name: 'O', label: 'Other' }
      ];

    default:
      return [];
  }
};

const RootView = () => {
  const [query, setQuery] = useState(preparedQueries.primary);
  const [fields, setFields] = useState(preparedFields.primary);
  const [format, setFormat] = useState('json');
  const [showCombinatorsBetweenRules, setShowCombinatorsBetweenRules] = useState(false);
  const [showNotToggle, setShowNotToggle] = useState(false);
  const [resetOnFieldChange, setResetOnFieldChange] = useState(true);

  /**
   * Reloads a prepared query, a PoC for query updates by props change.
   * If no target is supplied, clear query (generic query).
   * @param {"primary"|"secondary"} target The target query
   */
  const loadQuery = (target) => {
    if (target) {
      setQuery(preparedQueries[target]);
      setFields(preparedFields[target]);
    } else {
      setQuery(preparedQueries.generic);
      setFields(preparedFields.generic);
    }
  };

  const handleQueryChange = (query) => {
    setQuery(query);
  };

  return (
    <div className="flex-box-outer">
      <div className="control-panel">
        <button onClick={() => loadQuery('primary')}>Load primary query</button>
        <button onClick={() => loadQuery('secondary')}>Load secondary query</button>
        <button onClick={() => loadQuery()}>Clear query</button>
      </div>
      <hr />
      <div className="flex-box">
        <div className="scroll">
          <QueryBuilder
            query={query}
            fields={fields}
            controlClassnames={{ fields: 'form-control' }}
            onQueryChange={handleQueryChange}
            getOperators={getOperators}
            getValueEditorType={getValueEditorType}
            getInputType={getInputType}
            getValues={getValues}
            showCombinatorsBetweenRules={showCombinatorsBetweenRules}
            showNotToggle={showNotToggle}
            resetOnFieldChange={resetOnFieldChange}
          />
        </div>
        <div className="shrink query-log scroll">
          <h4>Options</h4>
          <div>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={showCombinatorsBetweenRules}
                  onChange={(e) => setShowCombinatorsBetweenRules(e.target.checked)}
                />
                Show combinators between rules
              </label>
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={showNotToggle}
                  onChange={(e) => setShowNotToggle(e.target.checked)}
                />
                Show "not" toggle
              </label>
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={resetOnFieldChange}
                  onChange={(e) => setResetOnFieldChange(e.target.checked)}
                />
                Reset rule on field change
              </label>
            </div>
          </div>
          <h4>Query</h4>
          <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
            <label>
              <input type="radio" checked={format === 'json'} onChange={() => setFormat('json')} />
              JSON
            </label>
            <label>
              <input type="radio" checked={format === 'sql'} onChange={() => setFormat('sql')} />
              SQL
            </label>
          </div>
          <pre>{formatQuery(query, format)}</pre>
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<RootView />, document.querySelector('.container'));
