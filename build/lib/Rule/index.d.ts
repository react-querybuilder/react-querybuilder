import * as React from 'react';
import { NameAndLabel, Schema, Translations } from '../types';
interface RuleProps {
    id: string | null;
    field?: string | NameAndLabel;
    value?: string;
    operator?: NameAndLabel;
    schema: Schema;
    parentId: string | null;
    translations?: Translations;
}
declare class RuleComponent extends React.Component<RuleProps, {}> {
    static readonly defaultProps: RuleProps;
    render(): JSX.Element;
    onFieldChanged: (value: string) => void;
    onOperatorChanged: (value: string) => void;
    onValueChanged: (value: any) => void;
    onElementChanged: (property: string, value: any) => void;
    removeRule: (event: any) => void;
}
export default RuleComponent;
