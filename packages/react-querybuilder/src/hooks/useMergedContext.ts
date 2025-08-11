import type { ComponentType, ForwardRefExoticComponent, RefAttributes } from 'react';
import { forwardRef, useCallback, useContext, useMemo } from 'react';
import { QueryBuilderContext } from '../context';
import { defaultControlElements, defaultTranslations } from '../defaultControlElements';
import { defaultControlClassnames } from '../defaults';
import type {
  Classnames,
  ControlElementsProp,
  Controls,
  DragHandleProps,
  FullField,
  QueryBuilderContextProps,
  RuleGroupTypeAny,
  Translations,
  TranslationsFull,
  ValueEditorProps,
} from '../types';
import { mergeClassnames, mergeTranslation } from '../utils';
import { usePreferProp } from './usePreferProp';

export type UseMergedContextParams<
  F extends FullField = FullField,
  O extends string = string,
  Finalize extends boolean | undefined = undefined,
> = QueryBuilderContextProps<F, O> & {
  initialQuery?: RuleGroupTypeAny;
  qbId?: string;
  /**
   * When true, props and context are merged with defaults to ensure all properties
   * are defined. Action elements and value selectors are merged with their respective
   * bulk override components. Only needs to be true when run from `QueryBuilder`.
   */
  finalize?: Finalize;
};

export type UseMergedContextReturn<
  F extends FullField = FullField,
  O extends string = string,
  Finalize extends boolean | undefined = undefined,
> = QueryBuilderContextProps<F, O> & {
  initialQuery?: RuleGroupTypeAny;
  qbId?: string;
} & {
  controlElements: Finalize extends true ? Controls<F, O> : Partial<Controls<F, O>>;
  controlClassnames: Classnames;
  translations: Finalize extends true ? TranslationsFull : Partial<Translations>;
} & Required<
    Pick<
      QueryBuilderContextProps<F, O>,
      'debugMode' | 'enableDragAndDrop' | 'enableMountQueryChange'
    >
  >;

const nullComp = () => null;
const nullFwdComp: ForwardRefExoticComponent<DragHandleProps & RefAttributes<HTMLElement>> =
  forwardRef(nullComp);
const emptyObject = {} as const;

/**
 * Merges inherited context values with props, giving precedence to props.
 *
 * @group Hooks
 */
export const useMergedContext = <
  F extends FullField = FullField,
  O extends string = string,
  Finalize extends boolean | undefined = undefined,
>({
  finalize,
  ...props
}: UseMergedContextParams<F, O, Finalize>): UseMergedContextReturn<F, O, Finalize> => {
  const rqbContext: QueryBuilderContextProps<F, O> = useContext(QueryBuilderContext);

  const debugModePreferred = usePreferProp(false, props.debugMode, rqbContext.debugMode);
  const debugMode = finalize
    ? debugModePreferred
    : (props.debugMode ?? (rqbContext.debugMode as boolean));
  const enableMountQueryChangePreferred = usePreferProp(
    true,
    props.enableMountQueryChange,
    rqbContext.enableMountQueryChange
  );
  const enableMountQueryChange = finalize
    ? enableMountQueryChangePreferred
    : (props.enableMountQueryChange ?? (rqbContext.enableMountQueryChange as boolean));

  // Drag-and-drop should be disabled if context sets it to false because
  // QueryBuilderDnD might not have loaded react-dnd yet. Therefore we prefer
  // the prop here only if context is true or undefined.
  const enableDragAndDropPreferred =
    usePreferProp(false, props.enableDragAndDrop, rqbContext.enableDragAndDrop) &&
    rqbContext.enableDragAndDrop !== false;
  const enableDragAndDrop = finalize
    ? enableDragAndDropPreferred
    : (props.enableDragAndDrop ?? (rqbContext.enableDragAndDrop as boolean));

  const cc = useMemo(
    () =>
      mergeClassnames(
        finalize ? Object.assign({}, defaultControlClassnames) : emptyObject,
        rqbContext.controlClassnames,
        props.controlClassnames
      ),
    [rqbContext.controlClassnames, props.controlClassnames, finalize]
  );

  const controlClassnames = useMemo(
    () => ({
      actionElement: cc.actionElement,
      addGroup: cc.addGroup,
      addRule: cc.addRule,
      body: cc.body,
      cloneGroup: cc.cloneGroup,
      cloneRule: cc.cloneRule,
      combinators: cc.combinators,
      dragHandle: cc.dragHandle,
      fields: cc.fields,
      header: cc.header,
      lockGroup: cc.lockGroup,
      lockRule: cc.lockRule,
      notToggle: cc.notToggle,
      operators: cc.operators,
      queryBuilder: cc.queryBuilder,
      removeGroup: cc.removeGroup,
      removeRule: cc.removeRule,
      rule: cc.rule,
      ruleGroup: cc.ruleGroup,
      shiftActions: cc.shiftActions,
      value: cc.value,
      valueSelector: cc.valueSelector,
      valueSource: cc.valueSource,
      betweenRules: cc.betweenRules,
      valid: cc.valid,
      invalid: cc.invalid,
      dndDragging: cc.dndDragging,
      dndOver: cc.dndOver,
      dndCopy: cc.dndCopy,
      dndGroup: cc.dndGroup,
      disabled: cc.disabled,
      valueListItem: cc.valueListItem,
      matchMode: cc.matchMode,
      matchThreshold: cc.matchThreshold,
      branches: cc.branches,
      hasSubQuery: cc.hasSubQuery,
    }),
    [
      cc.actionElement,
      cc.addGroup,
      cc.addRule,
      cc.betweenRules,
      cc.body,
      cc.branches,
      cc.cloneGroup,
      cc.cloneRule,
      cc.combinators,
      cc.disabled,
      cc.dndCopy,
      cc.dndGroup,
      cc.dndDragging,
      cc.dndOver,
      cc.dragHandle,
      cc.fields,
      cc.hasSubQuery,
      cc.header,
      cc.invalid,
      cc.lockGroup,
      cc.lockRule,
      cc.matchMode,
      cc.matchThreshold,
      cc.notToggle,
      cc.operators,
      cc.queryBuilder,
      cc.removeGroup,
      cc.removeRule,
      cc.rule,
      cc.ruleGroup,
      cc.shiftActions,
      cc.valid,
      cc.value,
      cc.valueListItem,
      cc.valueSelector,
      cc.valueSource,
    ]
  );

  const contextCE: ControlElementsProp<F, O> = rqbContext.controlElements ?? emptyObject;
  const propsCE: ControlElementsProp<F, O> = props.controlElements ?? emptyObject;
  const mergeControlElement = useCallback(
    (
      name: keyof Controls<F, O>,
      // oxlint-disable-next-line typescript/no-explicit-any
      propComp: ComponentType<any> | null | undefined,
      // oxlint-disable-next-line typescript/no-explicit-any
      contextComp: ComponentType<any> | null | undefined
    ) => {
      const nc = name === 'dragHandle' ? nullFwdComp : nullComp;
      const propBulkOverride =
        (name.endsWith('Action') && propsCE.actionElement ? propsCE.actionElement : undefined) ??
        (name.endsWith('Selector') && propsCE.valueSelector ? propsCE.valueSelector : undefined);
      const contextBulkOverride =
        (name.endsWith('Action') && contextCE.actionElement
          ? contextCE.actionElement
          : undefined) ??
        (name.endsWith('Selector') && contextCE.valueSelector
          ? contextCE.valueSelector
          : undefined);
      const comp =
        propComp === null
          ? nc
          : (propComp ??
            (finalize ? propBulkOverride : undefined) ??
            (contextComp === null
              ? nc
              : (contextComp ?? (finalize ? contextBulkOverride : undefined))));
      return comp
        ? { [name]: comp }
        : finalize
          ? { [name]: defaultControlElements[name] }
          : emptyObject;
    },
    [
      contextCE.actionElement,
      contextCE.valueSelector,
      finalize,
      propsCE.actionElement,
      propsCE.valueSelector,
    ]
  );
  const controlElements = useMemo(
    () =>
      // For some reason TypeScript doesn't like the object spread syntax here.
      // Something about a union type being too complex to represent.
      Object.assign(
        {},
        mergeControlElement('addGroupAction', propsCE.addGroupAction, contextCE.addGroupAction),
        mergeControlElement('addRuleAction', propsCE.addRuleAction, contextCE.addRuleAction),
        mergeControlElement(
          'cloneGroupAction',
          propsCE.cloneGroupAction,
          contextCE.cloneGroupAction
        ),
        mergeControlElement('cloneRuleAction', propsCE.cloneRuleAction, contextCE.cloneRuleAction),
        mergeControlElement(
          'combinatorSelector',
          propsCE.combinatorSelector,
          contextCE.combinatorSelector
        ),
        mergeControlElement('dragHandle', propsCE.dragHandle, contextCE.dragHandle),
        mergeControlElement('fieldSelector', propsCE.fieldSelector, contextCE.fieldSelector),
        mergeControlElement(
          'inlineCombinator',
          propsCE.inlineCombinator,
          contextCE.inlineCombinator
        ),
        mergeControlElement('lockGroupAction', propsCE.lockGroupAction, contextCE.lockGroupAction),
        mergeControlElement('lockRuleAction', propsCE.lockRuleAction, contextCE.lockRuleAction),
        mergeControlElement('notToggle', propsCE.notToggle, contextCE.notToggle),
        mergeControlElement(
          'operatorSelector',
          propsCE.operatorSelector,
          contextCE.operatorSelector
        ),
        mergeControlElement(
          'removeGroupAction',
          propsCE.removeGroupAction,
          contextCE.removeGroupAction
        ),
        mergeControlElement(
          'removeRuleAction',
          propsCE.removeRuleAction,
          contextCE.removeRuleAction
        ),
        mergeControlElement('shiftActions', propsCE.shiftActions, contextCE.shiftActions),
        {
          valueEditor:
            propsCE.valueEditor === null
              ? nullComp
              : (propsCE.valueEditor ??
                (contextCE.valueEditor === null ? nullComp : contextCE.valueEditor) ??
                (defaultControlElements.valueEditor as unknown as ComponentType<
                  ValueEditorProps<F, O>
                >)),
        },
        mergeControlElement(
          'valueSourceSelector',
          propsCE.valueSourceSelector,
          contextCE.valueSourceSelector
        ),
        mergeControlElement('matchModeEditor', propsCE.matchModeEditor, contextCE.matchModeEditor),
        mergeControlElement('rule', propsCE.rule, contextCE.rule),
        mergeControlElement('ruleGroup', propsCE.ruleGroup, contextCE.ruleGroup),
        mergeControlElement(
          'ruleGroupBodyElements',
          propsCE.ruleGroupBodyElements,
          contextCE.ruleGroupBodyElements
        ),
        mergeControlElement(
          'ruleGroupHeaderElements',
          propsCE.ruleGroupHeaderElements,
          contextCE.ruleGroupHeaderElements
        ),
        {
          actionElement:
            propsCE.actionElement ??
            contextCE.actionElement ??
            (finalize ? defaultControlElements.actionElement : undefined),
        },
        {
          valueSelector:
            propsCE.valueSelector ??
            contextCE.valueSelector ??
            (finalize ? defaultControlElements.valueSelector : undefined),
        }
      ) as Finalize extends true ? ControlElementsProp<F, O> : Partial<ControlElementsProp<F, O>>,
    [
      contextCE.actionElement,
      contextCE.addGroupAction,
      contextCE.addRuleAction,
      contextCE.cloneGroupAction,
      contextCE.cloneRuleAction,
      contextCE.combinatorSelector,
      contextCE.dragHandle,
      contextCE.fieldSelector,
      contextCE.inlineCombinator,
      contextCE.lockGroupAction,
      contextCE.lockRuleAction,
      contextCE.matchModeEditor,
      contextCE.notToggle,
      contextCE.operatorSelector,
      contextCE.removeGroupAction,
      contextCE.removeRuleAction,
      contextCE.rule,
      contextCE.ruleGroup,
      contextCE.ruleGroupBodyElements,
      contextCE.ruleGroupHeaderElements,
      contextCE.shiftActions,
      contextCE.valueEditor,
      contextCE.valueSelector,
      contextCE.valueSourceSelector,
      mergeControlElement,
      finalize,
      propsCE.actionElement,
      propsCE.addGroupAction,
      propsCE.addRuleAction,
      propsCE.cloneGroupAction,
      propsCE.cloneRuleAction,
      propsCE.combinatorSelector,
      propsCE.dragHandle,
      propsCE.fieldSelector,
      propsCE.inlineCombinator,
      propsCE.lockGroupAction,
      propsCE.lockRuleAction,
      propsCE.matchModeEditor,
      propsCE.notToggle,
      propsCE.operatorSelector,
      propsCE.removeGroupAction,
      propsCE.removeRuleAction,
      propsCE.rule,
      propsCE.ruleGroup,
      propsCE.ruleGroupBodyElements,
      propsCE.ruleGroupHeaderElements,
      propsCE.shiftActions,
      propsCE.valueEditor,
      propsCE.valueSelector,
      propsCE.valueSourceSelector,
    ]
  ) as Finalize extends true ? Controls<F, O> : Partial<Controls<F, O>>;

  const propsT: Partial<Translations> = props.translations ?? emptyObject;
  const contextT: Partial<Translations> = rqbContext.translations ?? emptyObject;
  const translations = useMemo(
    () =>
      Object.assign(
        finalize ? Object.assign({}, defaultTranslations) : {},
        mergeTranslation(
          'addGroup',
          {
            label: [propsT.addGroup?.label, contextT.addGroup?.label],
            title: [propsT.addGroup?.title, contextT.addGroup?.title],
          },
          finalize
        ),
        mergeTranslation(
          'addRule',
          {
            label: [propsT.addRule?.label, contextT.addRule?.label],
            title: [propsT.addRule?.title, contextT.addRule?.title],
          },
          finalize
        ),
        mergeTranslation(
          'cloneRule',
          {
            label: [propsT.cloneRule?.label, contextT.cloneRule?.label],
            title: [propsT.cloneRule?.title, contextT.cloneRule?.title],
          },
          finalize
        ),
        mergeTranslation(
          'cloneRuleGroup',
          {
            label: [propsT.cloneRuleGroup?.label, contextT.cloneRuleGroup?.label],
            title: [propsT.cloneRuleGroup?.title, contextT.cloneRuleGroup?.title],
          },
          finalize
        ),
        mergeTranslation(
          'combinators',
          { title: [propsT.combinators?.title, contextT.combinators?.title] },
          finalize
        ),
        mergeTranslation(
          'dragHandle',
          {
            label: [propsT.dragHandle?.label, contextT.dragHandle?.label],
            title: [propsT.dragHandle?.title, contextT.dragHandle?.title],
          },
          finalize
        ),
        mergeTranslation(
          'fields',
          {
            placeholderGroupLabel: [
              propsT.fields?.placeholderGroupLabel,
              contextT.fields?.placeholderGroupLabel,
            ],
            placeholderLabel: [propsT.fields?.placeholderLabel, contextT.fields?.placeholderLabel],
            placeholderName: [propsT.fields?.placeholderName, contextT.fields?.placeholderName],
            title: [propsT.fields?.title, contextT.fields?.title],
          },
          finalize
        ),
        mergeTranslation(
          'lockGroup',
          {
            label: [propsT.lockGroup?.label, contextT.lockGroup?.label],
            title: [propsT.lockGroup?.title, contextT.lockGroup?.title],
          },
          finalize
        ),
        mergeTranslation(
          'lockGroupDisabled',
          {
            label: [propsT.lockGroupDisabled?.label, contextT.lockGroupDisabled?.label],
            title: [propsT.lockGroupDisabled?.title, contextT.lockGroupDisabled?.title],
          },
          finalize
        ),
        mergeTranslation(
          'lockRule',
          {
            label: [propsT.lockRule?.label, contextT.lockRule?.label],
            title: [propsT.lockRule?.title, contextT.lockRule?.title],
          },
          finalize
        ),
        mergeTranslation(
          'lockRuleDisabled',
          {
            label: [propsT.lockRuleDisabled?.label, contextT.lockRuleDisabled?.label],
            title: [propsT.lockRuleDisabled?.title, contextT.lockRuleDisabled?.title],
          },
          finalize
        ),
        mergeTranslation(
          'notToggle',
          {
            label: [propsT.notToggle?.label, contextT.notToggle?.label],
            title: [propsT.notToggle?.title, contextT.notToggle?.title],
          },
          finalize
        ),
        mergeTranslation(
          'operators',
          {
            placeholderGroupLabel: [
              propsT.operators?.placeholderGroupLabel,
              contextT.operators?.placeholderGroupLabel,
            ],
            placeholderLabel: [
              propsT.operators?.placeholderLabel,
              contextT.operators?.placeholderLabel,
            ],
            placeholderName: [
              propsT.operators?.placeholderName,
              contextT.operators?.placeholderName,
            ],
            title: [propsT.operators?.title, contextT.operators?.title],
          },
          finalize
        ),
        mergeTranslation(
          'values',
          {
            placeholderGroupLabel: [
              propsT.values?.placeholderGroupLabel,
              contextT.values?.placeholderGroupLabel,
            ],
            placeholderLabel: [propsT.values?.placeholderLabel, contextT.values?.placeholderLabel],
            placeholderName: [propsT.values?.placeholderName, contextT.values?.placeholderName],
            title: [propsT.values?.title, contextT.values?.title],
          },
          finalize
        ),
        mergeTranslation(
          'removeGroup',
          {
            label: [propsT.removeGroup?.label, contextT.removeGroup?.label],
            title: [propsT.removeGroup?.title, contextT.removeGroup?.title],
          },
          finalize
        ),
        mergeTranslation(
          'removeRule',
          {
            label: [propsT.removeRule?.label, contextT.removeRule?.label],
            title: [propsT.removeRule?.title, contextT.removeRule?.title],
          },
          finalize
        ),
        mergeTranslation(
          'shiftActionDown',
          {
            label: [propsT.shiftActionDown?.label, contextT.shiftActionDown?.label],
            title: [propsT.shiftActionDown?.title, contextT.shiftActionDown?.title],
          },
          finalize
        ),
        mergeTranslation(
          'shiftActionUp',
          {
            label: [propsT.shiftActionUp?.label, contextT.shiftActionUp?.label],
            title: [propsT.shiftActionUp?.title, contextT.shiftActionUp?.title],
          },
          finalize
        ),
        mergeTranslation(
          'value',
          { title: [propsT.value?.title, contextT.value?.title] },
          finalize
        ),
        mergeTranslation(
          'valueSourceSelector',
          { title: [propsT.valueSourceSelector?.title, contextT.valueSourceSelector?.title] },
          finalize
        )
      ),
    [
      contextT.addGroup?.label,
      contextT.addGroup?.title,
      contextT.addRule?.label,
      contextT.addRule?.title,
      contextT.cloneRule?.label,
      contextT.cloneRule?.title,
      contextT.cloneRuleGroup?.label,
      contextT.cloneRuleGroup?.title,
      contextT.combinators?.title,
      contextT.dragHandle?.label,
      contextT.dragHandle?.title,
      contextT.fields?.placeholderGroupLabel,
      contextT.fields?.placeholderLabel,
      contextT.fields?.placeholderName,
      contextT.fields?.title,
      contextT.lockGroup?.label,
      contextT.lockGroup?.title,
      contextT.lockGroupDisabled?.label,
      contextT.lockGroupDisabled?.title,
      contextT.lockRule?.label,
      contextT.lockRule?.title,
      contextT.lockRuleDisabled?.label,
      contextT.lockRuleDisabled?.title,
      contextT.notToggle?.label,
      contextT.notToggle?.title,
      contextT.operators?.placeholderGroupLabel,
      contextT.operators?.placeholderLabel,
      contextT.operators?.placeholderName,
      contextT.operators?.title,
      contextT.removeGroup?.label,
      contextT.removeGroup?.title,
      contextT.removeRule?.label,
      contextT.removeRule?.title,
      contextT.shiftActionDown?.label,
      contextT.shiftActionDown?.title,
      contextT.shiftActionUp?.label,
      contextT.shiftActionUp?.title,
      contextT.value?.title,
      contextT.values?.placeholderGroupLabel,
      contextT.values?.placeholderLabel,
      contextT.values?.placeholderName,
      contextT.values?.title,
      contextT.valueSourceSelector?.title,
      finalize,
      propsT.addGroup?.label,
      propsT.addGroup?.title,
      propsT.addRule?.label,
      propsT.addRule?.title,
      propsT.cloneRule?.label,
      propsT.cloneRule?.title,
      propsT.cloneRuleGroup?.label,
      propsT.cloneRuleGroup?.title,
      propsT.combinators?.title,
      propsT.dragHandle?.label,
      propsT.dragHandle?.title,
      propsT.fields?.placeholderGroupLabel,
      propsT.fields?.placeholderLabel,
      propsT.fields?.placeholderName,
      propsT.fields?.title,
      propsT.lockGroup?.label,
      propsT.lockGroup?.title,
      propsT.lockGroupDisabled?.label,
      propsT.lockGroupDisabled?.title,
      propsT.lockRule?.label,
      propsT.lockRule?.title,
      propsT.lockRuleDisabled?.label,
      propsT.lockRuleDisabled?.title,
      propsT.notToggle?.label,
      propsT.notToggle?.title,
      propsT.operators?.placeholderGroupLabel,
      propsT.operators?.placeholderLabel,
      propsT.operators?.placeholderName,
      propsT.operators?.title,
      propsT.removeGroup?.label,
      propsT.removeGroup?.title,
      propsT.removeRule?.label,
      propsT.removeRule?.title,
      propsT.shiftActionDown?.label,
      propsT.shiftActionDown?.title,
      propsT.shiftActionUp?.label,
      propsT.shiftActionUp?.title,
      propsT.value?.title,
      propsT.values?.placeholderGroupLabel,
      propsT.values?.placeholderLabel,
      propsT.values?.placeholderName,
      propsT.values?.title,
      propsT.valueSourceSelector?.title,
    ]
  ) as Finalize extends true ? TranslationsFull : Partial<Translations>;

  return {
    controlClassnames,
    controlElements,
    debugMode,
    enableDragAndDrop,
    enableMountQueryChange,
    translations,
    initialQuery: props.initialQuery,
    qbId: props.qbId,
  };
};
