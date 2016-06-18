import "react-query-builder/query-builder.css";
import {QueryBuilder} from "react-query-builder";
import {render} from "react-dom";

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
        return (
            <div>
                <QueryBuilder fields={this.props.fields}
                              getEditor={this.getEditor}
                              onQueryChange={this.logQuery.bind(this)}/>
                <pre>{JSON.stringify(this.state.query, null, 2)}</pre>
            </div>
        );
    }

    getEditor({field, operator, value, onChange}) {
        if (field !== 'isDev' || operator !== '=') {
            return null;
        }

        const hasValue = !!value;
        return (
            <span>
            <input type="checkbox"
                   value={hasValue}
                   onChange={event=>onChange(event.target.checked)}/>
        </span>
        );
    }

    logQuery(query) {
        this.setState({query});
    }

}

render(<RootView fields={fields}/>, document.querySelector('.container'));

