// Type definitions for react-querybuilder 1.4.2
// Project: https://github.com/sapientglobalmarkets/react-querybuilder/
// Definitions by: Jake Boone <https://github.com/jakeboone02>

import * as React from 'react';

interface NameLabelPair {
    name: string;
    label: string;
}

type NameLabelList = NameLabelPair[];

interface Rule {
    id: string;
    field: string;
    operator: string;
    value: string|number;
}

interface RuleGroup {
    id: string;
    combinator: string;
    rules: (Rule | RuleGroup)[];
}

interface CommonCustomControlProps {
    /**
     * CSS classNames to be applied
     */
    className: string;
    /**
     * The level of the current group
     */
    level: number;
}

interface ActionCustomControlProps extends CommonCustomControlProps {
    label?: string;
    handleOnClick?(): void;
}

interface ActionWithRulesCustomControlProps extends ActionCustomControlProps {
    /**
     * Rules already present for this group
     */
    rules?: Rule[];
}

interface SelectorEditorCustomControlProps extends CommonCustomControlProps {
    value?: string;
    handleOnChange?(value: any): void;
}

interface CombinatorSelectorCustomControlProps extends SelectorEditorCustomControlProps {
    options: NameLabelList;
    rules?: Rule[];
}

interface FieldSelectorCustomControlProps extends SelectorEditorCustomControlProps {
    options: NameLabelList;
}

interface OperatorSelectorCustomControlProps extends SelectorEditorCustomControlProps {
    field?: string;
    options: NameLabelList;
}

interface ValueEditorCustomControlProps extends SelectorEditorCustomControlProps {
    field?: string;
    operator?: string;
}

interface Field extends NameLabelPair {
    id?: string;
}

interface QueryBuilderProps {
    query?: RuleGroup;
    /**
     * The array of fields that should be used. Each field should be an object
     * with {name: String, label: String}
     */
    fields: Field[];
    /**
     * The array of operators that should be used.
     * @default
     * [
     *     {name: 'null', label: 'Is Null'},
     *     {name: 'notNull', label: 'Is Not Null'},
     *     {name: 'in', label: 'In'},
     *     {name: 'notIn', label: 'Not In'},
     *     {name: '=', label: '='},
     *     {name: '!=', label: '!='},
     *     {name: '<', label: '<'},
     *     {name: '>', label: '>'},
     *     {name: '<=', label: '<='},
     *     {name: '>=', label: '>='},
     * ]
     */
    operators?: NameLabelList;
    /**
     * The array of combinators that should be used for RuleGroups.
     * @default
     * [
     *     {name: 'and', label: 'AND'},
     *     {name: 'or', label: 'OR'},
     * ]
     */
    combinators?: NameLabelList;
    controlElements?: {
        addGroupAction?: React.ComponentType<ActionWithRulesCustomControlProps>;
        removeGroupAction?: React.ComponentType<ActionWithRulesCustomControlProps>;
        addRuleAction?: React.ComponentType<ActionWithRulesCustomControlProps>;
        removeRuleAction?: React.ComponentType<ActionCustomControlProps>;
        combinatorSelector?: React.ComponentType<CombinatorSelectorCustomControlProps>;
        fieldSelector?: React.ComponentType<FieldSelectorCustomControlProps>;
        operatorSelector?: React.ComponentType<OperatorSelectorCustomControlProps>;
        valueEditor?: React.ComponentType<ValueEditorCustomControlProps>;
    };
    /**
     * This is a callback function invoked to get the list of allowed
     * operators for the given field
     * @param field
     */
    getOperators?(field: string): Field[];
    /**
     * This is a notification that is invoked anytime the query configuration changes.
     * @param query
     */
    onQueryChange(query: RuleGroup): void;
    /**
     * This can be used to assign specific CSS classes to various controls
     * that are created by the `<QueryBuilder />`.
     */
    controlClassnames?: {
        /**
         * Root `<div>` element
         */
        queryBuilder?: string;
        /**
         * `<div>` containing the RuleGroup
         */
        ruleGroup?: string;
        /**
         * `<select>` control for combinators
         */
        combinators?: string;
        /**
         * `<button>` to add a Rule
         */
        addRule?: string;
        /**
         * `<button>` to add a RuleGroup
         */
        addGroup?: string;
        /**
         * `<button>` to remove a RuleGroup
         */
        removeGroup?: string;
        /**
         * `<div>` containing the Rule
         */
        rule?: string;
        /**
         * `<select>` control for fields
         */
        fields?: string;
        /**
         * `<select>` control for operators
         */
        operators?: string;
        /**
         * `<input>` for the field value
         */
        value?: string;
        /**
         * `<button>` to remove a Rule
         */
        removeRule?: string;
    };
    /**
     * This can be used to override translatable texts applied to various
     * controls that are created by the `<QueryBuilder />`.
     */
    translations?: {
        fields?: {
            title: string;
        };
        operators?: {
            title: string;
        };
        value?: {
            title: string;
        };
        removeRule?: {
            label: string;
            title: string;
        };
        removeGroup?: {
            label: string;
            title: string;
        };
        addRule?: {
            label: string;
            title: string;
        };
        addGroup?: {
            label: string;
            title: string;
        };
        combinators?: {
            title: string;
        };
    }
}

export default class QueryBuilder extends React.Component<QueryBuilderProps> {}
