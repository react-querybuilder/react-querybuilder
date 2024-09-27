import type { useRuleGroup } from '../hooks';
import type {
  ActionProps,
  Controls,
  DragHandleProps,
  FullField,
  FullOption,
  InlineCombinatorProps,
  NotToggleProps,
  RuleGroupProps,
  RuleProps,
  ShiftActionsProps,
  ValueEditorProps,
  ValueSelectorProps,
} from '../types';
import { ActionElement } from './ActionElement';
import { DragHandle } from './DragHandle';
import { InlineCombinator } from './InlineCombinator';
import { NotToggle } from './NotToggle';
import { Rule } from './Rule';
import { RuleGroup, RuleGroupBodyComponents, RuleGroupHeaderComponents } from './RuleGroup';
import { ShiftActions } from './ShiftActions';
import { ValueEditor } from './ValueEditor';
import { ValueSelector } from './ValueSelector';

/**
 * Default components used by {@link QueryBuilder}.
 */
export const defaultControlElements: {
  actionElement: (props: ActionProps) => React.JSX.Element;
  addGroupAction: (props: ActionProps) => React.JSX.Element;
  addRuleAction: (props: ActionProps) => React.JSX.Element;
  cloneGroupAction: (props: ActionProps) => React.JSX.Element;
  cloneRuleAction: (props: ActionProps) => React.JSX.Element;
  combinatorSelector: <Opt extends FullOption = FullOption<string>>(
    props: ValueSelectorProps<Opt>
  ) => React.JSX.Element;
  dragHandle: React.ForwardRefExoticComponent<
    DragHandleProps & React.RefAttributes<HTMLSpanElement>
  >;
  fieldSelector: <Opt extends FullOption = FullOption<string>>(
    props: ValueSelectorProps<Opt>
  ) => React.JSX.Element;
  inlineCombinator: (allProps: InlineCombinatorProps) => React.JSX.Element;
  lockGroupAction: (props: ActionProps) => React.JSX.Element;
  lockRuleAction: (props: ActionProps) => React.JSX.Element;
  notToggle: (props: NotToggleProps) => React.JSX.Element;
  operatorSelector: <Opt extends FullOption = FullOption<string>>(
    props: ValueSelectorProps<Opt>
  ) => React.JSX.Element;
  removeGroupAction: (props: ActionProps) => React.JSX.Element;
  removeRuleAction: (props: ActionProps) => React.JSX.Element;
  rule: React.MemoExoticComponent<(props: RuleProps) => React.JSX.Element>;
  ruleGroup: React.MemoExoticComponent<(props: RuleGroupProps) => React.JSX.Element>;
  ruleGroupBodyElements: React.MemoExoticComponent<
    (rg: RuleGroupProps & ReturnType<typeof useRuleGroup>) => React.JSX.Element[]
  >;
  ruleGroupHeaderElements: React.MemoExoticComponent<
    (rg: RuleGroupProps & ReturnType<typeof useRuleGroup>) => React.JSX.Element
  >;
  shiftActions: (props: ShiftActionsProps) => React.JSX.Element;
  valueEditor: <F extends FullField>(allProps: ValueEditorProps<F>) => React.JSX.Element | null;
  valueSelector: <Opt extends FullOption = FullOption<string>>(
    props: ValueSelectorProps<Opt>
  ) => React.JSX.Element;
  valueSourceSelector: <Opt extends FullOption = FullOption<string>>(
    props: ValueSelectorProps<Opt>
  ) => React.JSX.Element;
} = {
  actionElement: ActionElement,
  addGroupAction: ActionElement,
  addRuleAction: ActionElement,
  cloneGroupAction: ActionElement,
  cloneRuleAction: ActionElement,
  combinatorSelector: ValueSelector,
  dragHandle: DragHandle,
  fieldSelector: ValueSelector,
  inlineCombinator: InlineCombinator,
  lockGroupAction: ActionElement,
  lockRuleAction: ActionElement,
  notToggle: NotToggle,
  operatorSelector: ValueSelector,
  removeGroupAction: ActionElement,
  removeRuleAction: ActionElement,
  rule: Rule,
  ruleGroup: RuleGroup,
  ruleGroupBodyElements: RuleGroupBodyComponents,
  ruleGroupHeaderElements: RuleGroupHeaderComponents,
  shiftActions: ShiftActions,
  valueEditor: ValueEditor,
  valueSelector: ValueSelector,
  valueSourceSelector: ValueSelector,
} satisfies Controls<FullField, string>;
