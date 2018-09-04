import * as React from 'react';
import { ControlClassnames, QueryBuilderProps, NameAndLabel, Rule, RuleGroup, Translations } from '../types';
import 'QueryBuilder.css';
interface QueryBuilderState {
    root: any;
    schema: any;
}
declare class QueryBuilder extends React.Component<QueryBuilderProps, QueryBuilderState> {
    static readonly defaultProps: QueryBuilderProps;
    constructor(props: QueryBuilderProps);
    static readonly defaultTranslations: Translations;
    static readonly defaultOperators: NameAndLabel[];
    static readonly defaultCombinators: NameAndLabel[];
    static readonly defaultControlClassnames: ControlClassnames;
    static readonly defaultControlElements: any;
    componentWillMount(): void;
    getInitialQuery(): RuleGroup;
    componentDidMount(): void;
    render(): JSX.Element;
    isRuleGroup(rule: any): rule is RuleGroup;
    createRule(): Rule;
    createRuleGroup(): RuleGroup;
    getOperators(field: string): NameAndLabel[] | undefined;
    onRuleAdd(rule: Rule, parentId: string): void;
    onGroupAdd(group: RuleGroup, parentId: string): void;
    onPropChange(prop: string, value: any, ruleId: string): void;
    onRuleRemove(ruleId: string, parentId: string): void;
    onGroupRemove(groupId: string, parentId: string): void;
    getLevel(id: string | null): number;
    _getLevel(id: string | null, index: number, root: any): number;
    findRule(id: string, parent: any): any;
    notifyQueryChange(fn?: Function, ...args: any[]): void;
}
export default QueryBuilder;
