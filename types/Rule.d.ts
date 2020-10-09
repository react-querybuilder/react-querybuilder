/// <reference types="react" />
import { RuleProps } from './types';
export declare const Rule: {
    ({ id, parentId, field, operator, value, translations, schema: { classNames, controls, fields, getInputType, getLevel, getOperators, getValueEditorType, getValues, onPropChange, onRuleRemove } }: RuleProps): JSX.Element;
    displayName: string;
};
