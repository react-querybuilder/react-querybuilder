import React, { useState } from 'react';
import ReactDOM from 'react-dom';
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
    id: 'g-8953ed65-f5ff-4b77-8d03-8d8788beb50b',
    rules: [
      {
        id: 'r-32ef0844-07e3-4f3b-aeca-3873da3e208b',
        field: 'firstName',
        value: 'Steve',
        operator: '='
      },
      {
        id: 'r-3db9ba21-080d-4a5e-b4da-d949b4ad055b',
        field: 'lastName',
        value: 'Vai',
        operator: '='
      }
    ],
    combinator: 'and'
  },
  secondary: {
    id: 'g-15e72d98-557f-4a09-af90-6d7afc05b0f7',
    rules: [
      {
        field: 'age',
        id: 'r-45b166dd-d69a-4008-9587-fe796aeda496',
        operator: '>',
        value: '28'
      },
      {
        field: 'isMusician',
        id: 'r-db6fded6-bd8c-4b4f-9a33-a00f7417a9a9',
        operator: '=',
        value: true
      },
      {
        field: 'instrument',
        id: 'r-df23ba2b-e600-491d-967c-116ade6fe45e',
        operator: '=',
        value: 'Guitar'
      }
    ],
    combinator: 'or'
  },
  generic: {
    combinator: 'and',
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
        <label>
          <input
            type="checkbox"
            checked={showCombinatorsBetweenRules}
            onChange={(e) => setShowCombinatorsBetweenRules(e.target.checked)}
          />
          Show combinators between rules
        </label>
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
          />
        </div>
        <div className="shrink query-log scroll">
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
