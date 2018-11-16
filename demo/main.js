import '../src/query-builder.scss';
import QueryBuilder from '../src/index';
import ReactDOM from "react-dom";
import React from 'react';

const fields1 = [
    {name: 'firstName', label: 'First Name'},
    {name: 'lastName', label: 'Last Name'},
    {name: 'age', label: 'Age'},
    {name: 'address', label: 'Address'},
    {name: 'phone', label: 'Phone'},
    {name: 'email', label: 'Email'},
    {name: 'twitter', label: 'Twitter'},
    {name: 'isDev', label: 'Is a Developer?', value: false},
];

const fields2 = [
    {name: 'contactFirstName', label: 'Contact First Name'},
    {name: 'contactLastName', label: 'Contact Last Name'},
    {name: 'contactEmail', label: 'Contact Email'},
];

const fieldQuerySets = {
    set1: {
        fields: fields1,
        query: {
            "id": "g-fe7a7130-9d9f-4ec8-b5d3-79b5f0aff350",
            "rules": [
                {
                    "id": "r-2c153586-5044-4ceb-9f36-cee6b06b035f",
                    "field": "firstName",
                    "value": "Steve",
                    "operator": "="
                }
            ],
            "combinator": "and"
        }
    },

     set2: {
        fields: fields2,
        query: {
            "id": "g-fe7a7130-9d9f-4ec8-b5d3-79b5f0aff350",
            "rules": [
                {
                    "id": "r-2c153586-5044-4ceb-9f36-cee6b06b035f",
                    "field": "contactFirstName",
                    "value": "Sally",
                    "operator": "="
                }
            ],
            "combinator": "and"
        }
    }
};

class RootView extends React.Component {
    constructor() {
        super();
        this.state = {
            query: {
                set1: fieldQuerySets.set1.query,
                set2: fieldQuerySets.set2.query
            },
            fields: {
                set1:fieldQuerySets.set1.fields,
                set2:fieldQuerySets.set2.fields
            },
            currentSet: "set1"
        };
    }

    handleChange = (e) =>{
        e.persist();
        this.setState((prevState) => ({ currentSet: e.target.value }));
    }

    render() {
        let controlElements = {
            valueEditor: this.customValueEditor()
        }
        const { currentSet } = this.state;

        return (
            <div className="flex-box">
                <div>
                    <select name="fieldToggle" value={this.state.currentSet} onChange={this.handleChange}>
                        <option value="set1">Set 1</option>
                        <option value="set2">Set 2</option>
                    </select>
                </div>
                <div className="scroll">
                    <QueryBuilder
                        query={ this.state.query[currentSet]}
                        fields={this.state.fields[currentSet]}
                        controlElements={controlElements}
                        controlClassnames={{fields: 'form-control'}}
                        onQueryChange={this.logQuery.bind(this)}/>
                </div>
                <div className="shrink query-log scroll">
                    <h4>Query</h4>
                    <pre>{JSON.stringify(this.state.query[this.state.currentSet], null, 2)}</pre>
                </div>
            </div>
        );
    }

    customValueEditor() {
        let checkbox = class MyCheckbox extends React.Component {
            render() {
                if (this.props.field !== 'isDev' || this.props.operator !== '=') {
                    return <input type="text"
                                  value={this.props.value}
                                  onChange={e => this.props.handleOnChange(e.target.value)} />
                }

                return (
                    <span>
                        <input type="checkbox"
                               value={!!this.props.value}
                               onChange={e => this.props.handleOnChange(e.target.checked)} />
                    </span>
                );
            }
        };
        return checkbox;
    }

    logQuery(query) {
        const currentQuery = {...this.state.query[this.state.currentSet]}
        currentQuery.query = query;
        this.setState({ currentQuery  });
    }

}

ReactDOM.render(<RootView />, document.querySelector('.container'));
