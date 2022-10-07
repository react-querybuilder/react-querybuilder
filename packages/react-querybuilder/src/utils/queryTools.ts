import type {
  NameLabelPair,
  OptionGroup,
  RuleGroupTypeAny,
  RuleType,
  UpdateableProperties,
  ValueSources,
} from '@react-querybuilder/ts/src/index.noReact';
import { produce } from 'immer';
import { defaultCombinators } from '../defaults';
import { regenerateID, regenerateIDs } from '../internal/regenerateIDs';
import { getFirstOption } from './optGroupUtils';
import { findPath, getCommonAncestorPath, getParentPath, pathsAreEqual } from './pathUtils';
import { prepareRuleOrGroup } from './prepareQueryObjects';

interface AddOptions {
  combinators: NameLabelPair[] | OptionGroup[];
}
export const add = <RG extends RuleGroupTypeAny>(
  query: RG,
  ruleOrGroup: RG | RuleType,
  parentPath: number[],
  { combinators = defaultCombinators }: Partial<AddOptions> = {}
) =>
  produce(query, draft => {
    const parent = findPath(parentPath, draft) as RG;
    if (!('combinator' in parent) && parent.rules.length > 0) {
      const prevCombinator = parent.rules[parent.rules.length - 2];
      // TODO: Instead of just getting the first custom/default combinator,
      // we could search the query for the first combinator we find and
      // use that in case custom combinator names are being used. Would
      // still need to fall back to custom/default combinators in case there
      // are no combinators defined in the query yet.
      parent.rules.push(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore This is technically a type violation until the next push, but
        // that happens immediately and unconditionally so there's no actual risk
        typeof prevCombinator === 'string' ? prevCombinator : getFirstOption(combinators)
      );
    }
    parent.rules.push(prepareRuleOrGroup(ruleOrGroup) as RuleType);
  });

interface UpdateOptions {
  resetOnFieldChange: boolean;
  resetOnOperatorChange: boolean;
  getRuleDefaultOperator: (field: string) => string;
  getValueSources: (field: string, operator: string) => ValueSources;
  getRuleDefaultValue: (rule: RuleType) => any;
}
export const update = <RG extends RuleGroupTypeAny>(
  query: RG,
  prop: UpdateableProperties,
  value: any,
  path: number[],
  {
    resetOnFieldChange = true,
    resetOnOperatorChange = false,
    getRuleDefaultOperator = () => '=',
    getValueSources = () => ['value'],
    getRuleDefaultValue = () => '',
  }: Partial<UpdateOptions> = {}
) =>
  produce(query, draft => {
    if (prop === 'combinator' && !('combinator' in draft)) {
      // Independent combinators
      const parentRules = (findPath(getParentPath(path), draft) as RG).rules;
      // Only update an independent combinator if it occupies an odd index
      if (path[path.length - 1] % 2 === 1) {
        parentRules[path[path.length - 1]] = value;
      }
      return;
    } else {
      const ruleOrGroup = findPath(path, draft)!;
      const isGroup = 'rules' in ruleOrGroup;
      // Only update if there is actually a change
      // @ts-expect-error prop can refer to rule or group properties
      if (ruleOrGroup[prop] !== value) {
        // Handle valueSource updates later
        if (prop !== 'valueSource') {
          // @ts-expect-error prop can refer to rule or group properties
          ruleOrGroup[prop] = value;
        }
        if (!isGroup) {
          let resetValueSource = false;
          let resetValue = false;

          // Set default operator, valueSource, and value for field change
          if (resetOnFieldChange && prop === 'field') {
            ruleOrGroup.operator = getRuleDefaultOperator(value);
            resetValueSource = true;
            resetValue = true;
          }

          // Set default valueSource and value for operator change
          if (resetOnOperatorChange && prop === 'operator') {
            resetValueSource = true;
            resetValue = true;
          }

          const defaultValueSource = getValueSources(ruleOrGroup.field, ruleOrGroup.operator)[0];
          if (
            (resetValueSource &&
              ruleOrGroup.valueSource &&
              defaultValueSource !== ruleOrGroup.valueSource) ||
            (prop === 'valueSource' && value !== ruleOrGroup.valueSource)
          ) {
            // Only reset the value if we're changing the valueSource either
            // 1) from `undefined` to something that is _not_ the default, or
            // 2) from the current (defined) value to something else
            resetValue =
              !!ruleOrGroup.valueSource ||
              (!ruleOrGroup.valueSource && value !== defaultValueSource);
            ruleOrGroup.valueSource = resetValueSource ? defaultValueSource : value;
          }

          if (resetValue) {
            // The default value should be a valid field name if defaultValueSource is 'field'
            ruleOrGroup.value = getRuleDefaultValue(ruleOrGroup);
          }
        }
      }
    }
  });

export const remove = <RG extends RuleGroupTypeAny>(query: RG, path: number[]) => {
  if (path.length === 0 || (!('combinator' in query) && !findPath(path, query))) {
    return query;
  }
  return produce(query, draft => {
    const index = path[path.length - 1];
    const parent = findPath(getParentPath(path), draft) as RG;
    if (!('combinator' in parent) && parent.rules.length > 1) {
      const idxStartDelete = index === 0 ? 0 : index - 1;
      parent.rules.splice(idxStartDelete, 2);
    } else {
      parent.rules.splice(index, 1);
    }
  });
};

interface MoveOptions {
  clone: boolean;
  combinators: NameLabelPair[] | OptionGroup[];
}
export const move = <RG extends RuleGroupTypeAny>(
  query: RG,
  oldPath: number[],
  newPath: number[],
  { clone = false, combinators = defaultCombinators }: Partial<MoveOptions> = {}
) => {
  if (pathsAreEqual(oldPath, newPath)) {
    return query;
  }
  const ruleOrGroupOriginal = findPath(oldPath, query);
  if (!ruleOrGroupOriginal) {
    return query;
  }
  const ruleOrGroup = clone
    ? 'rules' in ruleOrGroupOriginal
      ? regenerateIDs(ruleOrGroupOriginal)
      : regenerateID(ruleOrGroupOriginal)
    : ruleOrGroupOriginal;

  return produce(query, draft => {
    const independentCombinators = !('combinator' in draft);
    const parentOfRuleToRemove = findPath(getParentPath(oldPath), draft) as RG;
    const ruleToRemoveIndex = oldPath[oldPath.length - 1];
    const oldPrevCombinator =
      independentCombinators && ruleToRemoveIndex > 0
        ? (parentOfRuleToRemove.rules[ruleToRemoveIndex - 1] as string)
        : null;
    const oldNextCombinator =
      independentCombinators && ruleToRemoveIndex < parentOfRuleToRemove.rules.length - 1
        ? (parentOfRuleToRemove.rules[ruleToRemoveIndex + 1] as string)
        : null;

    // Remove the source item if not cloning
    if (!clone) {
      const idxStartDelete = independentCombinators
        ? Math.max(0, ruleToRemoveIndex - 1)
        : ruleToRemoveIndex;
      const deleteLength = independentCombinators ? 2 : 1;
      parentOfRuleToRemove.rules.splice(idxStartDelete, deleteLength);
    }

    const newNewPath = [...newPath];
    const commonAncestorPath = getCommonAncestorPath(oldPath, newPath);
    if (
      !clone &&
      oldPath.length === commonAncestorPath.length + 1 &&
      newPath[commonAncestorPath.length] > oldPath[commonAncestorPath.length]
    ) {
      // Getting here means there will be a shift of paths upward at the common
      // ancestor level because the object at `oldPath` will be spliced out. The
      // real new path should therefore be one or two higher than `newPath`.
      newNewPath[commonAncestorPath.length] -= independentCombinators ? 2 : 1;
    }
    const newNewParentPath = getParentPath(newNewPath);
    const parentToInsertInto = findPath(newNewParentPath, draft) as RG;
    const newIndex = newNewPath[newNewPath.length - 1];

    /**
     * This function 1) glosses over the need for type assertions to splice directly
     * into `parentToInsertInto.rules`, and 2) shortens the actual insertion code.
     */
    const insertRuleOrGroup = (...args: any[]) =>
      parentToInsertInto.rules.splice(newIndex, 0, ...args);

    // Insert the source item at the target path
    if (parentToInsertInto.rules.length === 0 || !independentCombinators) {
      insertRuleOrGroup(ruleOrGroup);
    } else {
      if (newIndex === 0) {
        if (ruleToRemoveIndex === 0 && oldNextCombinator) {
          insertRuleOrGroup(ruleOrGroup, oldNextCombinator);
        } else {
          const newNextCombinator =
            parentToInsertInto.rules[1] || oldPrevCombinator || getFirstOption(combinators);
          insertRuleOrGroup(ruleOrGroup, newNextCombinator);
        }
      } else {
        if (oldPrevCombinator) {
          insertRuleOrGroup(oldPrevCombinator, ruleOrGroup);
        } else {
          const newPrevCombinator =
            parentToInsertInto.rules[newIndex - 2] ||
            oldNextCombinator ||
            getFirstOption(combinators);
          insertRuleOrGroup(newPrevCombinator, ruleOrGroup);
        }
      }
    }
  });
};
