/// <reference types="react" />
import { NameLabelPair, QueryBuilderProps, Translations } from './types';
import './query-builder.scss';
export declare const defaultTranslations: Translations;
export declare const defaultOperators: NameLabelPair[];
export declare const defaultCombinators: NameLabelPair[];
export declare const QueryBuilder: {
    ({ query, fields, operators, combinators, translations, enableMountQueryChange, controlElements, getDefaultField, getDefaultValue, getOperators, getValueEditorType, getInputType, getValues, onQueryChange, controlClassnames, showCombinatorsBetweenRules, showNotToggle, resetOnFieldChange, resetOnOperatorChange, context }: QueryBuilderProps): JSX.Element;
    displayName: string;
};
