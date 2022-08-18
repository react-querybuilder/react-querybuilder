import type { Controls, RuleGroupProps, RuleProps } from 'react-querybuilder';
import { defaultControlElements } from 'react-querybuilder';
import { RuleDnD } from '../RuleDnD';
import { RuleGroupDnD } from '../RuleGroupDnD';
import type { UseReactDnD } from '../types';

export const getRuleGroupWithDndWrapper =
  ({
    ruleGroup: RuleGroupComponent = defaultControlElements.ruleGroup,
    useDrag,
    useDrop,
  }: Pick<Partial<Controls>, 'ruleGroup'> & Pick<UseReactDnD, 'useDrag' | 'useDrop'>) =>
  (p: RuleGroupProps) => {
    const {
      path,
      disabled,
      parentDisabled,
      actions: { moveRule },
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
  ({
    rule: RuleComponent = defaultControlElements.rule,
    useDrag,
    useDrop,
  }: Pick<Partial<Controls>, 'rule'> & Pick<UseReactDnD, 'useDrag' | 'useDrop'>) =>
  (p: RuleProps) => {
    const {
      path,
      disabled,
      parentDisabled,
      actions: { moveRule },
      schema: { independentCombinators },
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
