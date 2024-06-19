import type { ComponentType, ForwardRefExoticComponent, RefAttributes } from 'react';
import { forwardRef, useCallback, useContext, useMemo } from 'react';
import { QueryBuilderContext, defaultControlElements } from '../components';
import { defaultControlClassnames, defaultTranslations } from '../defaults';
import type {
  Classnames,
  ControlElementsProp,
  Controls,
  DragHandleProps,
  FullField,
  QueryBuilderContextProps,
  RuleGroupTypeAny,
  TranslationsFull,
  ValueEditorProps,
} from '../types';
import { mergeClassnames, mergeTranslations } from '../utils';
import { usePreferProp } from './usePreferProp';

export type UseMergedContextProps<
  F extends FullField = FullField,
  O extends string = string,
> = QueryBuilderContextProps<F, O> & {
  initialQuery?: RuleGroupTypeAny;
  qbId?: string;
  /**
   * When true, props and context are merged with defaults to ensure all properties
   * are defined. Action elements and value selectors are merged with their respective
   * bulk override components. Only needs to be true when run from `QueryBuilder`.
   */
  finalize?: boolean;
};
export type UseMergedContextReturn<
  F extends FullField = FullField,
  O extends string = string,
> = QueryBuilderContextProps<F, O> & {
  initialQuery?: RuleGroupTypeAny;
  qbId?: string;
} & {
  controlElements: Controls<F, O>;
  controlClassnames: Classnames;
  translations: TranslationsFull;
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
 */
export function useMergedContext<F extends FullField = FullField, O extends string = string>(
  props: UseMergedContextProps<F, O> & { finalize?: false }
): UseMergedContextProps<F, O>;
export function useMergedContext<F extends FullField = FullField, O extends string = string>(
  props: UseMergedContextProps<F, O> & { finalize: true }
): UseMergedContextReturn<F, O>;
export function useMergedContext<F extends FullField = FullField, O extends string = string>({
  finalize,
  ...props
}: UseMergedContextProps<F, O>) {
  const rqbContext: QueryBuilderContextProps<F, O> = useContext(QueryBuilderContext);

  const enableMountQueryChange = usePreferProp(
    true,
    props.enableMountQueryChange,
    rqbContext.enableMountQueryChange
  );

  // Drag-and-drop should be disabled if context sets it to false because
  // QueryBuilderDnD might not have loaded react-dnd yet. Therefore we prefer
  // the prop here only if context is true or undefined.
  const enableDragAndDrop =
    usePreferProp(false, props.enableDragAndDrop, rqbContext.enableDragAndDrop) &&
    rqbContext.enableDragAndDrop !== false;

  const debugMode = usePreferProp(false, props.debugMode, rqbContext.debugMode);

  const cc = useMemo(
    () =>
      mergeClassnames(
        finalize ? defaultControlClassnames : emptyObject,
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
    }),
    [
      cc.actionElement,
      cc.addGroup,
      cc.addRule,
      cc.body,
      cc.cloneGroup,
      cc.cloneRule,
      cc.combinators,
      cc.dragHandle,
      cc.fields,
      cc.header,
      cc.lockGroup,
      cc.lockRule,
      cc.notToggle,
      cc.operators,
      cc.queryBuilder,
      cc.removeGroup,
      cc.removeRule,
      cc.rule,
      cc.ruleGroup,
      cc.shiftActions,
      cc.value,
      cc.valueSelector,
      cc.valueSource,
    ]
  );

  const contextCE: ControlElementsProp<F, O> = rqbContext.controlElements ?? emptyObject;
  const propsCE: ControlElementsProp<F, O> = props.controlElements ?? emptyObject;
  const mergeControlElement = useCallback(
    (
      name: keyof Controls<F, O>,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      propComp: ComponentType<any> | null | undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          : propComp ??
            (finalize ? propBulkOverride : undefined) ??
            (contextComp === null
              ? nc
              : contextComp ?? (finalize ? contextBulkOverride : undefined));
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
              : propsCE.valueEditor ??
                (contextCE.valueEditor === null ? nullComp : contextCE.valueEditor) ??
                (defaultControlElements.valueEditor as unknown as ComponentType<
                  ValueEditorProps<F, O>
                >),
        },
        mergeControlElement(
          'valueSourceSelector',
          propsCE.valueSourceSelector,
          contextCE.valueSourceSelector
        ),
        mergeControlElement('rule', propsCE.rule, contextCE.rule),
        mergeControlElement('ruleGroup', propsCE.ruleGroup, contextCE.ruleGroup),
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
        // TODO: this type should probably depend on `finalize`
      ) as ControlElementsProp<F, O>,
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
      contextCE.notToggle,
      contextCE.operatorSelector,
      contextCE.removeGroupAction,
      contextCE.removeRuleAction,
      contextCE.rule,
      contextCE.ruleGroup,
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
      propsCE.notToggle,
      propsCE.operatorSelector,
      propsCE.removeGroupAction,
      propsCE.removeRuleAction,
      propsCE.rule,
      propsCE.ruleGroup,
      propsCE.shiftActions,
      propsCE.valueEditor,
      propsCE.valueSelector,
      propsCE.valueSourceSelector,
    ]
    // TODO: this type should probably depend on `finalize`
  ) as Controls<F, O>;

  const tl = useMemo(
    () =>
      mergeTranslations(
        finalize ? defaultTranslations : emptyObject,
        rqbContext.translations,
        props.translations
      ),
    [finalize, props.translations, rqbContext.translations]
  );

  const translations = useMemo(
    () => ({
      addGroup: {
        label: tl.addGroup?.label,
        title: tl.addGroup?.title,
      },
      addRule: {
        label: tl.addRule?.label,
        title: tl.addRule?.title,
      },
      cloneRule: {
        label: tl.cloneRule?.label,
        title: tl.cloneRule?.title,
      },
      cloneRuleGroup: {
        label: tl.cloneRuleGroup?.label,
        title: tl.cloneRuleGroup?.title,
      },
      combinators: {
        title: tl.combinators?.title,
      },
      dragHandle: {
        label: tl.dragHandle?.label,
        title: tl.dragHandle?.title,
      },
      fields: {
        placeholderGroupLabel: tl.fields?.placeholderGroupLabel,
        placeholderLabel: tl.fields?.placeholderLabel,
        placeholderName: tl.fields?.placeholderName,
        title: tl.fields?.title,
      },
      lockGroup: {
        label: tl.lockGroup?.label,
        title: tl.lockGroup?.title,
      },
      lockGroupDisabled: {
        label: tl.lockGroupDisabled?.label,
        title: tl.lockGroupDisabled?.title,
      },
      lockRule: {
        label: tl.lockRule?.label,
        title: tl.lockRule?.title,
      },
      lockRuleDisabled: {
        label: tl.lockRuleDisabled?.label,
        title: tl.lockRuleDisabled?.title,
      },
      notToggle: {
        label: tl.notToggle?.label,
        title: tl.notToggle?.title,
      },
      operators: {
        placeholderGroupLabel: tl.operators?.placeholderGroupLabel,
        placeholderLabel: tl.operators?.placeholderLabel,
        placeholderName: tl.operators?.placeholderName,
        title: tl.operators?.title,
      },
      removeGroup: {
        label: tl.removeGroup?.label,
        title: tl.removeGroup?.title,
      },
      removeRule: {
        label: tl.removeRule?.label,
        title: tl.removeRule?.title,
      },
      shiftActionDown: {
        label: tl.shiftActionDown?.label,
        title: tl.shiftActionDown?.title,
      },
      shiftActionUp: {
        label: tl.shiftActionUp?.label,
        title: tl.shiftActionUp?.title,
      },
      value: {
        title: tl.value?.title,
      },
      valueSourceSelector: {
        title: tl.valueSourceSelector?.title,
      },
    }),
    [
      tl.addGroup?.label,
      tl.addGroup?.title,
      tl.addRule?.label,
      tl.addRule?.title,
      tl.cloneRule?.label,
      tl.cloneRule?.title,
      tl.cloneRuleGroup?.label,
      tl.cloneRuleGroup?.title,
      tl.combinators?.title,
      tl.dragHandle?.label,
      tl.dragHandle?.title,
      tl.fields?.placeholderGroupLabel,
      tl.fields?.placeholderLabel,
      tl.fields?.placeholderName,
      tl.fields?.title,
      tl.lockGroup?.label,
      tl.lockGroup?.title,
      tl.lockGroupDisabled?.label,
      tl.lockGroupDisabled?.title,
      tl.lockRule?.label,
      tl.lockRule?.title,
      tl.lockRuleDisabled?.label,
      tl.lockRuleDisabled?.title,
      tl.notToggle?.label,
      tl.notToggle?.title,
      tl.operators?.placeholderGroupLabel,
      tl.operators?.placeholderLabel,
      tl.operators?.placeholderName,
      tl.operators?.title,
      tl.removeGroup?.label,
      tl.removeGroup?.title,
      tl.removeRule?.label,
      tl.removeRule?.title,
      tl.shiftActionDown?.label,
      tl.shiftActionDown?.title,
      tl.shiftActionUp?.label,
      tl.shiftActionUp?.title,
      tl.value?.title,
      tl.valueSourceSelector?.title,
    ]
    // TODO: this type should probably depend on `finalize`
  ) as TranslationsFull;

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
}
