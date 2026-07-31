export const messages = {
  errorInvalidIndependentCombinatorsProp:
    'QueryBuilder was rendered with a truthy independentCombinators prop. This prop is deprecated and unnecessary. Furthermore, the initial query/defaultQuery prop was of type RuleGroupType instead of type RuleGroupIC. More info: https://react-querybuilder.js.org/docs/components/querybuilder#independent-combinators',

  errorUnnecessaryIndependentCombinatorsProp:
    'QueryBuilder was rendered with the deprecated and unnecessary independentCombinators prop. To use independent combinators, make sure the query/defaultQuery prop is of type RuleGroupIC when the component mounts. More info: https://react-querybuilder.js.org/docs/components/querybuilder#independent-combinators',

  errorDeprecatedRuleGroupProps:
    'A custom RuleGroup component has rendered a standard RuleGroup component with deprecated props. The combinator, not, and rules props should not be used. Instead, the full group object should be passed as the ruleGroup prop.',

  errorDeprecatedRuleProps:
    'A custom RuleGroup component has rendered a standard Rule component with deprecated props. The field, operator, value, and valueSource props should not be used. Instead, the full rule object should be passed as the rule prop.',

  errorBothQueryDefaultQuery:
    'QueryBuilder was rendered with both query and defaultQuery props. QueryBuilder must be either controlled or uncontrolled (specify either the query prop, or the defaultQuery prop, but not both). Decide between using a controlled or uncontrolled query builder and remove one of these props. More info: https://reactjs.org/link/controlled-components',

  errorUncontrolledToControlled:
    'QueryBuilder is changing from an uncontrolled component to be controlled. This is likely caused by the query changing from undefined to a defined value, which should not happen. Decide between using a controlled or uncontrolled query builder for the lifetime of the component. More info: https://reactjs.org/link/controlled-components',

  errorControlledToUncontrolled:
    'QueryBuilder is changing from a controlled component to be uncontrolled. This is likely caused by the query changing from defined to undefined, which should not happen. Decide between using a controlled or uncontrolled query builder for the lifetime of the component. More info: https://reactjs.org/link/controlled-components',

  errorEnabledDndWithoutReactDnD:
    'QueryBuilder was rendered with the enableDragAndDrop prop set to true, but either react-dnd was not detected or one of react-dnd-html5-backend or react-dnd-touch-backend was not detected. To enable drag-and-drop functionality, install react-dnd and one of the backend packages and wrap QueryBuilder in QueryBuilderDnD from @react-querybuilder/dnd.',

  errorDeprecatedDebugImport: `Importing from react-querybuilder/debug is deprecated. To enable Redux DevTools for React Query Builder's internal store, set globalThis.__RQB_DEVTOOLS__ = true.`,

  errorDuplicateQbId:
    'QueryBuilder was rendered with a qbId prop that is already in use by another mounted QueryBuilder. Each mounted query builder must have a unique qbId, so this query builder has fallen back to an automatically generated identifier. A qbId may be reused after the previous query builder has unmounted (see the preserveQueryStateOnUnmount prop), but not while it is still mounted.',

  errorShowUndoRedoWithoutProvider:
    'QueryBuilder was rendered with the showUndoRedo prop set to true, but no undo/redo controls were available. To enable undo/redo, wrap QueryBuilder in the QueryBuilderHistory component from react-querybuilder/history, or provide your own controlElements.undoRedoActions component.',

  errorChangedQbId:
    'QueryBuilder was rendered with a qbId prop that is different than the qbId it was mounted with. The qbId prop is only evaluated when the component mounts, so the new value has been ignored. To render a query builder with a different qbId, unmount the existing one first, e.g. by giving it a different React key.',
} as const;
