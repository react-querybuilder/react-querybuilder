import uniqueId from 'lodash/uniqueId';

import RuleGroup from './RuleGroup';


export default class QueryBuilder extends React.Component {
    static get defaultProps() {
        return {
            rules: [],
            fields: [],
            operators: QueryBuilder.defaultOperators,
            combinators: QueryBuilder.defaultCombinators,
            getEditor: null,
            getOperators: null,
            onQueryChange: null,
        };
    }

    static get propTypes() {
        return {
            rules: React.PropTypes.array,
            fields: React.PropTypes.array,
            operators: React.PropTypes.array,
            combinators: React.PropTypes.array,
            getEditor: React.PropTypes.func,
            getOperators: React.PropTypes.func,
            onQueryChange: React.PropTypes.func
        };
    }


    constructor(...args) {
        super(...args);
        this.state = {
            root: {},
            schema: {},
        };
    }

    static get defaultOperators() {

        return [
            {name: 'null', label: 'Is Null'},
            {name: 'notNull', label: 'Is Not Null'},
            {name: 'in', label: 'In'},
            {name: 'notIn', label: 'Not In'},
            {name: '=', label: '='},
            {name: '!=', label: '!='},
            {name: '<', label: '<'},
            {name: '>', label: '>'},
            {name: '<=', label: '<='},
            {name: '>=', label: '>='},
        ];
    }

    static get defaultCombinators() {

        return [
            {name: 'and', label: 'AND'},
            {name: 'or', label: 'OR'},
        ];
    }

    componentWillMount() {
        const {fields, operators, combinators} = this.props;

        this.setState({
            root: this.createRuleGroup(),
            schema: {
                fields,
                operators,
                combinators,
                createRule: this.createRule.bind(this),
                createRuleGroup: this.createRuleGroup.bind(this),
                onRuleAdd: this._notifyQueryChange.bind(this, this.onRuleAdd),
                onGroupAdd: this._notifyQueryChange.bind(this, this.onGroupAdd),
                onRuleRemove: this._notifyQueryChange.bind(this, this.onRuleRemove),
                onGroupRemove: this._notifyQueryChange.bind(this, this.onGroupRemove),
                onPropChange: this._notifyQueryChange.bind(this, this.onPropChange),
                getEditor: (...args)=>this.prepareEditor(...args),
                getOperators: (...args)=>this.getOperators(...args),
            }
        });

    }

    componentDidMount() {
        this._notifyQueryChange(null);
    }

    render() {
        const {root: {id, rules, combinator}, schema} = this.state;

        return (
            <RuleGroup rules={rules}
                       combinator={combinator}
                       schema={schema}
                       id={id}
                       parentId={null}/>
        );
    }


    createRule() {
        const {fields, operators} = this.state.schema;

        return {
            id: uniqueId('r-'),
            type: 'rule',
            field: fields[0].name,
            value: null,
            operator: operators[0].name
        };
    }

    createRuleGroup() {
        return {
            id: uniqueId('g-'),
            type: 'ruleGroup',
            rules: [],
            combinator: this.props.combinators[0].name,
        };
    }


    prepareEditor(config) {
        const {value, operator, onChange} = config;

        const editor = this.props.getEditor && this.props.getEditor(config);
        if (editor) {
            return editor;
        }

        if (operator === 'null' || operator === 'notNull') {
            return null;
        }

        return (
            <input type="text"
                   value={value}
                   onChange={event=>onChange(event.target.value)}/>
        );
    }

    getOperators(field) {
        if (this.props.getOperators) {
            const ops = this.props.getOperators(field);
            if (ops) {
                return ops;
            }
        }


        return QueryBuilder.defaultOperators;
    }

    onRuleAdd(rule, parentId) {
        const parent = this._findRule(parentId, this.state.root);
        parent.rules.push(rule);

        this.setState({root: this.state.root});
    }

    onGroupAdd(group, parentId) {
        const parent = this._findRule(parentId, this.state.root);
        parent.rules.push(group);

        this.setState({root: this.state.root});
    }

    onPropChange(prop, value, ruleId) {
        const rule = this._findRule(ruleId, this.state.root);
        Object.assign(rule, {[prop]: value});

        this.setState({root: this.state.root});
    }

    onRuleRemove(ruleId, parentId) {
        const parent = this._findRule(parentId, this.state.root);
        const index = parent.rules.findIndex(x=>x.id === ruleId);

        parent.rules.splice(index, 1);
        this.setState({root: this.state.root});
    }

    onGroupRemove(groupId, parentId) {
        const parent = this._findRule(parentId, this.state.root);
        const index = parent.rules.findIndex(x=>x.id === groupId);

        parent.rules.splice(index, 1);
        this.setState({root: this.state.root});
    }

    _findRule(id, parent) {
        if (parent.id === id) {
            return parent;
        }

        for (const rule of parent.rules) {
            if (rule.id === id) {
                return rule;
            } else if (rule.type === 'ruleGroup') {
                const subRule = this._findRule(id, rule);
                if (subRule) {
                    return subRule;
                }
            }
        }

    }

    _notifyQueryChange(fn, ...args) {
        if (fn) {
            fn.call(this, ...args);
        }

        const {onQueryChange} = this.props;
        if (onQueryChange) {
            const query = this._constructQuery(this.state.root);
            onQueryChange(query);
        }
    }

    _constructQuery(node) {
        let query;

        if (node.type === 'rule') {
            const {field, operator, value} = node;
            query = {field, operator, value};
        }

        if (node.type === 'ruleGroup') {
            const {combinator, rules} = node;
            query = {
                combinator,
                rules: rules.map(r=> this._constructQuery(r, {}))
            };
        }

        return query;
    }
}

