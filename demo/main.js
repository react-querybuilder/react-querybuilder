import '../src/query-builder.scss';
import QueryBuilder from '../src/index';
import ReactDOM from 'react-dom';
import React from 'react';

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
        value: 'true'
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

class RootView extends React.Component {
  constructor(props) {
    super(props);
    this.handleQueryChange = this.handleQueryChange.bind(this);
    this.state = {
      query: preparedQueries.primary,
      fields: preparedFields.primary
    };
  }

  // Reloads a prepared query, a PoC for query updates by props change.
  // If no target is supplied, clear query (generic query).
  loadQuery(target) {
    if (target) {
      this.setState({
        query: preparedQueries[target],
        fields: preparedFields[target]
      });
    } else {
      this.setState({
        query: preparedQueries.generic,
        fields: preparedFields.generic
      });
    }
  }

  handleQueryChange(query) {
    this.setState({ query });
  }

  render() {
    return (
      <div className="flex-box-outer">
        <div className="control-panel">
          <button onClick={() => this.loadQuery('primary')}>Load primary query</button>
          <button onClick={() => this.loadQuery('secondary')}>Load secondary query</button>
          <button onClick={() => this.loadQuery()}>Clear query</button>
        </div>
        <hr />
        <div className="flex-box">
          <div className="scroll">
            <QueryBuilder
              query={this.state.query}
              fields={this.state.fields}
              controlClassnames={{ fields: 'form-control' }}
              onQueryChange={this.handleQueryChange}
            />
          </div>
          <div className="shrink query-log scroll">
            <h4>Query</h4>
            <pre>{JSON.stringify(this.state.query, null, 2)}</pre>
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<RootView />, document.querySelector('.container'));
