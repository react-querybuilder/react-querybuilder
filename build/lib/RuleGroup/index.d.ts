import * as React from 'react';
import { Rule, RuleGroup, Schema, Translations } from '../types';
interface RuleGroupProps {
    id: string | null;
    parentId: string | null;
    rules: (Rule | RuleGroup)[];
    combinator: string;
    schema: Schema;
    translations?: Translations;
}
declare class RuleGroupComponent extends React.Component<RuleGroupProps, {}> {
    static readonly defaultProps: RuleGroupProps;
    render(): JSX.Element;
    hasParentGroup(): boolean;
    onCombinatorChange: (value: any) => void;
    addRule: (event: Event) => void;
    addGroup: (event: Event) => void;
    removeGroup: (event: Event) => void;
}
export default RuleGroupComponent;
