import '../lib/query-builder.scss';
import {QueryBuilder} from '../lib/index';
import {render} from "react-dom";
import React from 'react';

const fields = [
    {name: 'firstName', label: 'First Name'},
    {name: 'lastName', label: 'Last Name'},
    {name: 'age', label: 'Age'},
    {name: 'address', label: 'Address'},
    {name: 'phone', label: 'Phone'},
    {name: 'email', label: 'Email'},
    {name: 'twitter', label: 'Twitter'},
    {name: 'isDev', label: 'Is a Developer?', value: false},
];

class RootView extends React.Component {
    constructor() {
        super();
        this.state = {
            query: {}
        };
    }

    render() {
        let controls = {
            valueEditor: this.customValueEditor()
        }
        return (
            <div className="flex-box">
                <div className="scroll">
                    <QueryBuilder fields={this.props.fields}
                                  controls={controls}
                                  controlClassnames={{fields: 'form-control'}}
                                  onQueryChange={this.logQuery.bind(this)}/>
                </div>
                <div className="shrink query-log scroll">
                    <h4>Query</h4>
                    <pre>{JSON.stringify(this.state.query, null, 2)}</pre>
                </div>
            </div>
        );
    }

    customValueEditor() {
        class MyCheckbox extends React.Component {
            constructor(props) {
                super(props);
                this.state = {
                    value: ''
                }
            }

            render() {
                const hasValue = !!this.state.value;
                if (this.props.field !== 'isDev' || this.props.operator !== '=') {
                    return <input type="text"
                                  value={this.state.value}
                                  onChange={e=>this._handleOnChange(e.target.value)} />
                }

                return (
                    <span>
                        <input type="checkbox"
                               value={hasValue}
                               onChange={e=>this._handleOnChange(e.target.checked)}/>
                    </span>
                );
            }

            _handleOnChange(value) {
                this.setState({value: value});
                this.props.handleOnChange(value);
            }
        };
        return (<MyCheckbox />);
    }

    logQuery(query) {
        this.setState({query});
    }

}

render(<RootView fields={fields} />, document.querySelector('.container'));

