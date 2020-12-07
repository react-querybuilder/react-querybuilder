/// <reference types="react" />
import { QueryBuilderProps } from './types';
export declare const QueryBuilder: {
    ({ query, fields, operators, combinators, translations, controlElements, getDefaultField, getDefaultValue, getOperators, getValueEditorType, getInputType, getValues, onQueryChange, controlClassnames, showCombinatorsBetweenRules, showNotToggle, resetOnFieldChange, resetOnOperatorChange, context }: QueryBuilderProps): JSX.Element;
    displayName: string;
};
