export const errorInvalidIndependentCombinatorsProp =
  'QueryBuilder was rendered with a truthy independentCombinators prop. This prop is deprecated and unnecessary. Furthermore, the initial query/defaultQuery prop was of type RuleGroupType instead of type RuleGroupIC. More info: https://react-querybuilder.js.org/docs/components/querybuilder#independent-combinators' as const;

export const errorUnnecessaryIndependentCombinatorsProp =
  'QueryBuilder was rendered with the deprecated and unnecessary independentCombinators prop. To use independent combinators, make sure the query/defaultQuery prop is of type RuleGroupIC when the component mounts. More info: https://react-querybuilder.js.org/docs/components/querybuilder#independent-combinators' as const;

export const errorDeprecatedRuleGroupProps =
  'A custom RuleGroup component has rendered a standard RuleGroup component with deprecated props. The combinator, not, and rules props should not be used. Instead, the full group object should be passed as the ruleGroup prop.' as const;

export const errorDeprecatedRuleProps =
  'A custom RuleGroup component has rendered a standard Rule component with deprecated props. The field, operator, value, and valueSource props should not be used. Instead, the full rule object should be passed as the rule prop.' as const;

export const errorBothQueryDefaultQuery =
  'QueryBuilder was rendered with both query and defaultQuery props. QueryBuilder must be either controlled or uncontrolled (specify either the query prop, or the defaultQuery prop, but not both). Decide between using a controlled or uncontrolled query builder and remove one of these props. More info: https://reactjs.org/link/controlled-components' as const;

export const errorUncontrolledToControlled =
  'QueryBuilder is changing from an uncontrolled component to be controlled. This is likely caused by the query changing from undefined to a defined value, which should not happen. Decide between using a controlled or uncontrolled query builder for the lifetime of the component. More info: https://reactjs.org/link/controlled-components' as const;

export const errorControlledToUncontrolled =
  'QueryBuilder is changing from a controlled component to be uncontrolled. This is likely caused by the query changing from defined to undefined, which should not happen. Decide between using a controlled or uncontrolled query builder for the lifetime of the component. More info: https://reactjs.org/link/controlled-components' as const;

export const errorEnabledDndWithoutReactDnD =
  'QueryBuilder was rendered with the enableDragAndDrop prop set to true, but either react-dnd or react-dnd-html5-backend (or both) was not installed. To enable drag-and-drop functionality, install both packages and wrap QueryBuilder in QueryBuilderDnD from @react-querybuilder/dnd.' as const;
