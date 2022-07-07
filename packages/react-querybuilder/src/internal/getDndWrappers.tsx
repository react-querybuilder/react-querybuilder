import { defaultControlElements } from '../controls';
import { RuleDnD } from '../RuleDnD';
import { RuleGroupDnD } from '../RuleGroupDnD';
import type { Controls, RuleGroupProps, RuleProps } from '../types';

export const getRuleGroupWithDndWrapper =
  (RuleGroupComponent: Controls['ruleGroup'] = defaultControlElements.ruleGroup) =>
  (p: RuleGroupProps) => {
    const {
      path,
      disabled,
      parentDisabled,
      actions: { moveRule },
      schema: {
        dnd: {
          hooks: { useDrag, useDrop },
        },
      },
    } = p;

    return (
      <RuleGroupDnD
        path={path}
        disabled={!!disabled}
        parentDisabled={!!parentDisabled}
        moveRule={moveRule}
        useDrag={useDrag}
        useDrop={useDrop}>
        <RuleGroupComponent {...p} />
      </RuleGroupDnD>
    );
  };

export const getRuleWithDndWrapper =
  (RuleComponent: Controls['rule'] = defaultControlElements.rule) =>
  (p: RuleProps) => {
    const {
      path,
      disabled,
      parentDisabled,
      actions: { moveRule },
      schema: {
        independentCombinators,
        dnd: {
          hooks: { useDrag, useDrop },
        },
      },
    } = p;

    return (
      <RuleDnD
        path={path}
        disabled={!!disabled}
        parentDisabled={!!parentDisabled}
        moveRule={moveRule}
        useDrag={useDrag}
        useDrop={useDrop}
        independentCombinators={independentCombinators}>
        <RuleComponent {...p} />
      </RuleDnD>
    );
  };
