import type { ComponentType, ForwardRefExoticComponent, RefAttributes } from 'react';
import { forwardRef, useContext, useMemo } from 'react';
import { QueryBuilderContext, defaultControlElements } from '../components';
import { defaultControlClassnames, defaultTranslations } from '../defaults';
import type {
  Controls,
  FullField,
  FieldSelectorProps,
  OperatorSelectorProps,
  QueryBuilderContextProps,
  TranslationsFull,
  ValueSourceSelectorProps,
  ControlElementsProp,
  DragHandleProps,
} from '../types';
import { mergeClassnames, mergeTranslations } from '../utils';
import { usePreferProp } from './usePreferProp';

export type UseMergedContextProps<
  F extends FullField = FullField,
  O extends string = string,
> = QueryBuilderContextProps<F, O>;

const nullComp = () => null;
const nullFwdComp: ForwardRefExoticComponent<DragHandleProps & RefAttributes<HTMLElement>> =
  forwardRef(nullComp);

/**
 * Merges inherited context values with props, giving precedence to props.
 */
export const useMergedContext = <F extends FullField = FullField, O extends string = string>(
  props: UseMergedContextProps<F, O>
) => {
  const rqbContext = useContext(QueryBuilderContext) as QueryBuilderContextProps<F, O>;
  // as ContextType<Context<QueryBuilderContextProps<any, any>>>;

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

  const controlClassnames = useMemo(
    () =>
      mergeClassnames(
        defaultControlClassnames,
        rqbContext.controlClassnames,
        props.controlClassnames
      ),
    [rqbContext.controlClassnames, props.controlClassnames]
  );

  const controlElements = useMemo(() => {
    const contextControlElements: ControlElementsProp<F, O> = {
      ...rqbContext.controlElements,
      ...(rqbContext.controlElements?.dragHandle === null ? { dragHandle: nullFwdComp } : {}),
      ...(rqbContext.controlElements?.inlineCombinator === null
        ? { inlineCombinator: nullComp }
        : {}),
      ...(rqbContext.controlElements?.notToggle === null ? { notToggle: nullComp } : {}),
      ...(rqbContext.controlElements?.shiftActions === null ? { shiftActions: nullComp } : {}),
      ...(rqbContext.controlElements?.valueEditor === null ? { valueEditor: nullComp } : {}),
      ...(rqbContext.controlElements?.valueSourceSelector === null
        ? { valueSourceSelector: nullComp }
        : {}),
      ...(rqbContext.controlElements?.addGroupAction === null ? { addGroupAction: nullComp } : {}),
      ...(rqbContext.controlElements?.addRuleAction === null ? { addRuleAction: nullComp } : {}),
      ...(rqbContext.controlElements?.cloneGroupAction === null
        ? { cloneGroupAction: nullComp }
        : {}),
      ...(rqbContext.controlElements?.cloneRuleAction === null
        ? { cloneRuleAction: nullComp }
        : {}),
      ...(rqbContext.controlElements?.lockGroupAction === null
        ? { lockGroupAction: nullComp }
        : {}),
      ...(rqbContext.controlElements?.lockRuleAction === null ? { lockRuleAction: nullComp } : {}),
      ...(rqbContext.controlElements?.removeGroupAction === null
        ? { removeGroupAction: nullComp }
        : {}),
      ...(rqbContext.controlElements?.removeRuleAction === null
        ? { removeRuleAction: nullComp }
        : {}),
      ...(rqbContext.controlElements?.combinatorSelector === null
        ? { combinatorSelector: nullComp }
        : {}),
      ...(rqbContext.controlElements?.fieldSelector === null ? { fieldSelector: nullComp } : {}),
      ...(rqbContext.controlElements?.operatorSelector === null
        ? { operatorSelector: nullComp }
        : {}),
      ...(rqbContext.controlElements?.valueSourceSelector === null
        ? { valueSourceSelector: nullComp }
        : {}),
      ...(rqbContext.controlElements?.actionElement
        ? {
            addGroupAction:
              rqbContext.controlElements?.addGroupAction === null
                ? nullComp
                : rqbContext.controlElements?.addGroupAction ??
                  rqbContext.controlElements.actionElement,
            addRuleAction:
              rqbContext.controlElements?.addRuleAction === null
                ? nullComp
                : rqbContext.controlElements?.addRuleAction ??
                  rqbContext.controlElements.actionElement,
            cloneGroupAction:
              rqbContext.controlElements?.cloneGroupAction === null
                ? nullComp
                : rqbContext.controlElements?.cloneGroupAction ??
                  rqbContext.controlElements.actionElement,
            cloneRuleAction:
              rqbContext.controlElements?.cloneRuleAction === null
                ? nullComp
                : rqbContext.controlElements?.cloneRuleAction ??
                  rqbContext.controlElements.actionElement,
            lockGroupAction:
              rqbContext.controlElements?.lockGroupAction === null
                ? nullComp
                : rqbContext.controlElements?.lockGroupAction ??
                  rqbContext.controlElements.actionElement,
            lockRuleAction:
              rqbContext.controlElements?.lockRuleAction === null
                ? nullComp
                : rqbContext.controlElements?.lockRuleAction ??
                  rqbContext.controlElements.actionElement,
            removeGroupAction:
              rqbContext.controlElements?.removeGroupAction === null
                ? nullComp
                : rqbContext.controlElements?.removeGroupAction ??
                  rqbContext.controlElements.actionElement,
            removeRuleAction:
              rqbContext.controlElements?.removeRuleAction === null
                ? nullComp
                : rqbContext.controlElements?.removeRuleAction ??
                  rqbContext.controlElements.actionElement,
          }
        : {}),
      ...(rqbContext.controlElements?.valueSelector
        ? {
            combinatorSelector:
              rqbContext.controlElements?.combinatorSelector === null
                ? nullComp
                : rqbContext.controlElements?.combinatorSelector ??
                  rqbContext.controlElements.valueSelector,
            fieldSelector:
              rqbContext.controlElements?.fieldSelector === null
                ? nullComp
                : rqbContext.controlElements?.fieldSelector ??
                  (rqbContext.controlElements.valueSelector as unknown as ComponentType<
                    FieldSelectorProps<F>
                  >),
            operatorSelector:
              rqbContext.controlElements?.operatorSelector === null
                ? nullComp
                : rqbContext.controlElements?.operatorSelector ??
                  (rqbContext.controlElements
                    .valueSelector as ComponentType<OperatorSelectorProps>),
            valueSourceSelector:
              rqbContext.controlElements?.valueSourceSelector === null
                ? nullComp
                : rqbContext.controlElements?.valueSourceSelector ??
                  (rqbContext.controlElements
                    .valueSelector as ComponentType<ValueSourceSelectorProps>),
          }
        : {}),
    };

    const propsControlElements: ControlElementsProp<F, O> = {
      ...props.controlElements,
      ...(props.controlElements?.dragHandle === null ? { dragHandle: nullFwdComp } : {}),
      ...(props.controlElements?.inlineCombinator === null ? { inlineCombinator: nullComp } : {}),
      ...(props.controlElements?.notToggle === null ? { notToggle: nullComp } : {}),
      ...(props.controlElements?.shiftActions === null ? { shiftActions: nullComp } : {}),
      ...(props.controlElements?.valueEditor === null ? { valueEditor: nullComp } : {}),
      ...(props.controlElements?.valueSourceSelector === null
        ? { valueSourceSelector: nullComp }
        : {}),
      ...(props.controlElements?.addGroupAction === null ? { addGroupAction: nullComp } : {}),
      ...(props.controlElements?.addRuleAction === null ? { addRuleAction: nullComp } : {}),
      ...(props.controlElements?.cloneGroupAction === null ? { cloneGroupAction: nullComp } : {}),
      ...(props.controlElements?.cloneRuleAction === null ? { cloneRuleAction: nullComp } : {}),
      ...(props.controlElements?.lockGroupAction === null ? { lockGroupAction: nullComp } : {}),
      ...(props.controlElements?.lockRuleAction === null ? { lockRuleAction: nullComp } : {}),
      ...(props.controlElements?.removeGroupAction === null ? { removeGroupAction: nullComp } : {}),
      ...(props.controlElements?.removeRuleAction === null ? { removeRuleAction: nullComp } : {}),
      ...(props.controlElements?.combinatorSelector === null
        ? { combinatorSelector: nullComp }
        : {}),
      ...(props.controlElements?.fieldSelector === null ? { fieldSelector: nullComp } : {}),
      ...(props.controlElements?.operatorSelector === null ? { operatorSelector: nullComp } : {}),
      ...(props.controlElements?.valueSourceSelector === null
        ? { valueSourceSelector: nullComp }
        : {}),
      ...(props.controlElements?.actionElement
        ? {
            addGroupAction:
              props.controlElements?.addGroupAction === null
                ? nullComp
                : props.controlElements?.addGroupAction ?? props.controlElements.actionElement,
            addRuleAction:
              props.controlElements?.addRuleAction === null
                ? nullComp
                : props.controlElements?.addRuleAction ?? props.controlElements.actionElement,
            cloneGroupAction:
              props.controlElements?.cloneGroupAction === null
                ? nullComp
                : props.controlElements?.cloneGroupAction ?? props.controlElements.actionElement,
            cloneRuleAction:
              props.controlElements?.cloneRuleAction === null
                ? nullComp
                : props.controlElements?.cloneRuleAction ?? props.controlElements.actionElement,
            lockGroupAction:
              props.controlElements?.lockGroupAction === null
                ? nullComp
                : props.controlElements?.lockGroupAction ?? props.controlElements.actionElement,
            lockRuleAction:
              props.controlElements?.lockRuleAction === null
                ? nullComp
                : props.controlElements?.lockRuleAction ?? props.controlElements.actionElement,
            removeGroupAction:
              props.controlElements?.removeGroupAction === null
                ? nullComp
                : props.controlElements?.removeGroupAction ?? props.controlElements.actionElement,
            removeRuleAction:
              props.controlElements?.removeRuleAction === null
                ? nullComp
                : props.controlElements?.removeRuleAction ?? props.controlElements.actionElement,
          }
        : {}),
      ...(props.controlElements?.valueSelector
        ? {
            combinatorSelector:
              props.controlElements?.combinatorSelector === null
                ? nullComp
                : props.controlElements?.combinatorSelector ?? props.controlElements.valueSelector,
            fieldSelector:
              props.controlElements?.fieldSelector === null
                ? nullComp
                : props.controlElements?.fieldSelector ??
                  (props.controlElements.valueSelector as unknown as ComponentType<
                    FieldSelectorProps<F>
                  >),
            operatorSelector:
              props.controlElements?.operatorSelector === null
                ? nullComp
                : props.controlElements?.operatorSelector ??
                  (props.controlElements.valueSelector as ComponentType<OperatorSelectorProps>),
            valueSourceSelector:
              props.controlElements?.valueSourceSelector === null
                ? nullComp
                : props.controlElements?.valueSourceSelector ??
                  (props.controlElements.valueSelector as ComponentType<ValueSourceSelectorProps>),
          }
        : {}),
    };

    return {
      ...defaultControlElements,
      ...contextControlElements,
      ...propsControlElements,
    } as Controls<F, O>;
  }, [props.controlElements, rqbContext.controlElements]);

  const translations = useMemo(
    () =>
      mergeTranslations(
        defaultTranslations,
        rqbContext.translations,
        props.translations
      ) as TranslationsFull,
    [props.translations, rqbContext.translations]
  );

  const {
    controlClassnames: _controlClassnames,
    controlElements: _controlElements,
    debugMode: _debugMode,
    enableDragAndDrop: _enableDragAndDrop,
    enableMountQueryChange: _enableMountQueryChange,
    translations: _translations,
    ...otherContext
  } = rqbContext;

  return {
    controlClassnames,
    controlElements,
    debugMode,
    enableDragAndDrop,
    enableMountQueryChange,
    translations,
    ...otherContext,
  };
};
