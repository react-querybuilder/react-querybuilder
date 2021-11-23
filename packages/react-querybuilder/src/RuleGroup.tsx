import { Fragment, MouseEvent as ReactMouseEvent, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { dndTypes, standardClassnames } from './defaults';
import type { CombinatorSelectorProps, DraggedItem, RuleGroupProps, Schema } from './types';
import { c, getParentPath, getValidationClassNames, isAncestor, pathsAreEqual } from './utils';

interface InlineCombinatorProps extends CombinatorSelectorProps {
  component: Schema['controls']['combinatorSelector'];
  path: number[];
  moveRule: Schema['moveRule'];
  independentCombinators: boolean;
}

const InlineCombinator = ({
  component: CombinatorSelectorComponent,
  path,
  moveRule,
  independentCombinators,
  ...props
}: InlineCombinatorProps) => {
  const [{ isOver, dropMonitorId }, drop] = useDrop(
    () => ({
      accept: [dndTypes.rule, dndTypes.ruleGroup],
      canDrop: (item: DraggedItem) => {
        const parentHoverPath = getParentPath(path);
        const parentItemPath = getParentPath(item.path);
        const hoverIndex = path[path.length - 1];
        const itemIndex = item.path[item.path.length - 1];

        // Don't allow drop if 1) item is ancestor of drop target,
        // 2) item is hovered over itself (this should never happen since
        // combinators don't have drag handles), or 3) combinators are
        // independent and the drop target is just above the hovering item.
        return !(
          isAncestor(item.path, path) ||
          pathsAreEqual(item.path, path) ||
          (pathsAreEqual(parentHoverPath, parentItemPath) && hoverIndex - 1 === itemIndex) ||
          (independentCombinators &&
            pathsAreEqual(parentHoverPath, parentItemPath) &&
            hoverIndex === itemIndex - 1)
        );
      },
      collect: (monitor) => ({
        isOver: monitor.canDrop() && monitor.isOver(),
        dropMonitorId: monitor.getHandlerId()
      }),
      drop: (item: DraggedItem, _monitor) => {
        const parentPath = getParentPath(path);
        const index = path[path.length - 1];
        const toIndex = independentCombinators ? index + 1 : index;
        moveRule(item.path, [...parentPath, toIndex]);
      }
    }),
    [moveRule, path, independentCombinators]
  );

  const dndOver = isOver ? standardClassnames.dndOver : '';
  const wrapperClassName = c(dndOver, standardClassnames.betweenRules);

  return (
    <div
      ref={drop}
      className={wrapperClassName}
      data-dropmonitorid={dropMonitorId}
      data-testid="inline-combinator">
      <CombinatorSelectorComponent {...props} />
    </div>
  );
};

export const RuleGroup = ({
  id,
  path,
  combinator = 'and',
  rules,
  translations,
  schema,
  not,
  context
}: RuleGroupProps) => {
  const {
    classNames,
    combinators,
    controls,
    createRule,
    createRuleGroup,
    independentCombinators,
    onGroupAdd,
    onGroupRemove,
    onPropChange,
    onRuleAdd,
    moveRule,
    showCombinatorsBetweenRules,
    showNotToggle,
    showCloneButtons,
    updateIndependentCombinator,
    validationMap
  } = schema;

  const previewRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLSpanElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [{ isDragging, dragMonitorId }, drag, preview] = useDrag(
    () => ({
      type: dndTypes.ruleGroup,
      item: (): DraggedItem => ({ path }),
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
        dragMonitorId: monitor.getHandlerId()
      })
    }),
    [path]
  );
  const [{ isOver, dropMonitorId }, drop] = useDrop(
    () => ({
      accept: [dndTypes.rule, dndTypes.ruleGroup],
      canDrop: (item: DraggedItem) => {
        const parentItemPath = getParentPath(item.path);
        const itemIndex = item.path[item.path.length - 1];
        // Don't allow drop if 1) item is ancestor of drop target,
        // 2) item is first child and is dropped on its own group header,
        // or 3) the group is dropped on itself
        return !(
          isAncestor(item.path, path) ||
          (pathsAreEqual(path, parentItemPath) && itemIndex === 0) ||
          pathsAreEqual(path, item.path)
        );
      },
      collect: (monitor) => ({
        isOver: monitor.canDrop() && monitor.isOver(),
        dropMonitorId: monitor.getHandlerId()
      }),
      drop: (item: DraggedItem, _monitor) => moveRule(item.path, [...path, 0])
    }),
    [moveRule, path]
  );
  if (path.length > 0) {
    drag(dragRef);
    preview(previewRef);
  }
  drop(dropRef);

  const onCombinatorChange = (value: any) => {
    onPropChange('combinator', value, path);
  };

  const onIndependentCombinatorChange = (value: any, index: number) => {
    updateIndependentCombinator(value, path.concat([index]));
  };

  const onNotToggleChange = (checked: boolean) => {
    onPropChange('not', checked, path);
  };

  const addRule = (event: ReactMouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const newRule = createRule();
    onRuleAdd(newRule, path);
  };

  const addGroup = (event: ReactMouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const newGroup = createRuleGroup();
    onGroupAdd(newGroup, path);
  };

  const cloneGroup = (event: ReactMouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const newPath = [...getParentPath(path), path[path.length - 1] + 1];
    moveRule(path, newPath, true);
  };

  const removeGroup = (event: ReactMouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    onGroupRemove(path);
  };

  const level = path.length;

  const validationResult = validationMap[id ?? /* istanbul ignore next */ ''];
  const validationClassName = getValidationClassNames(validationResult);
  const dndDragging = isDragging ? standardClassnames.dndDragging : '';
  const dndOver = isOver ? standardClassnames.dndOver : '';
  const outerClassName = c(
    standardClassnames.ruleGroup,
    classNames.ruleGroup,
    validationClassName,
    dndDragging
  );

  return (
    <div
      ref={previewRef}
      className={outerClassName}
      data-testid="rule-group"
      data-dragmonitorid={dragMonitorId}
      data-dropmonitorid={dropMonitorId}
      data-rule-group-id={id}
      data-level={level}
      data-path={JSON.stringify(path)}>
      <div ref={dropRef} className={c(standardClassnames.header, classNames.header, dndOver)}>
        {level > 0 && (
          <controls.dragHandle
            ref={dragRef}
            level={level}
            title={translations.dragHandle.title}
            label={translations.dragHandle.label}
            className={c(standardClassnames.dragHandle, classNames.dragHandle)}
            context={context}
            validation={validationResult}
          />
        )}
        {!showCombinatorsBetweenRules && !independentCombinators && (
          <controls.combinatorSelector
            options={combinators}
            value={combinator}
            title={translations.combinators.title}
            className={c(standardClassnames.combinators, classNames.combinators)}
            handleOnChange={onCombinatorChange}
            rules={rules}
            level={level}
            context={context}
            validation={validationResult}
          />
        )}
        {showNotToggle && (
          <controls.notToggle
            className={c(standardClassnames.notToggle, classNames.notToggle)}
            title={translations.notToggle.title}
            label={translations.notToggle.label}
            checked={not}
            handleOnChange={onNotToggleChange}
            level={level}
            context={context}
            validation={validationResult}
          />
        )}
        <controls.addRuleAction
          label={translations.addRule.label}
          title={translations.addRule.title}
          className={c(standardClassnames.addRule, classNames.addRule)}
          handleOnClick={addRule}
          rules={rules}
          level={level}
          context={context}
          validation={validationResult}
        />
        <controls.addGroupAction
          label={translations.addGroup.label}
          title={translations.addGroup.title}
          className={c(standardClassnames.addGroup, classNames.addGroup)}
          handleOnClick={addGroup}
          rules={rules}
          level={level}
          context={context}
          validation={validationResult}
        />
        {showCloneButtons && path.length >= 1 && (
          <controls.cloneGroupAction
            label={translations.cloneRuleGroup.label}
            title={translations.cloneRuleGroup.title}
            className={c(standardClassnames.cloneGroup, classNames.cloneGroup)}
            handleOnClick={cloneGroup}
            rules={rules}
            level={level}
            context={context}
            validation={validationResult}
          />
        )}
        {path.length >= 1 && (
          <controls.removeGroupAction
            label={translations.removeGroup.label}
            title={translations.removeGroup.title}
            className={c(standardClassnames.removeGroup, classNames.removeGroup)}
            handleOnClick={removeGroup}
            rules={rules}
            level={level}
            context={context}
            validation={validationResult}
          />
        )}
      </div>
      <div className={c(standardClassnames.body, classNames.body)}>
        {rules.map((r, idx) => {
          const thisPath = path.concat([idx]);
          return (
            <Fragment key={thisPath.join('-')}>
              {idx > 0 && !independentCombinators && showCombinatorsBetweenRules && (
                <InlineCombinator
                  options={combinators}
                  value={combinator}
                  title={translations.combinators.title}
                  className={c(standardClassnames.combinators, classNames.combinators)}
                  handleOnChange={onCombinatorChange}
                  rules={rules}
                  level={level}
                  context={context}
                  validation={validationResult}
                  component={controls.combinatorSelector}
                  moveRule={moveRule}
                  path={thisPath}
                  independentCombinators={independentCombinators}
                />
              )}
              {typeof r === 'string' ? (
                <InlineCombinator
                  options={combinators}
                  value={r}
                  title={translations.combinators.title}
                  className={c(standardClassnames.combinators, classNames.combinators)}
                  handleOnChange={(val) => onIndependentCombinatorChange(val, idx)}
                  rules={rules}
                  level={level}
                  context={context}
                  validation={validationResult}
                  component={controls.combinatorSelector}
                  moveRule={moveRule}
                  path={thisPath}
                  independentCombinators={independentCombinators}
                />
              ) : 'rules' in r ? (
                <controls.ruleGroup
                  id={r.id}
                  schema={schema}
                  path={thisPath}
                  combinator={'combinator' in r ? r.combinator : undefined}
                  translations={translations}
                  rules={r.rules}
                  not={!!r.not}
                  context={context}
                />
              ) : (
                <controls.rule
                  id={r.id!}
                  field={r.field}
                  value={r.value}
                  operator={r.operator}
                  schema={schema}
                  path={thisPath}
                  translations={translations}
                  context={context}
                />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};

RuleGroup.displayName = 'RuleGroup';
