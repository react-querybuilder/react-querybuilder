import type { ComponentType } from 'react';
import { useContext, useMemo } from 'react';
import { QueryBuilderContext, defaultControlElements } from '../components';
import { defaultControlClassnames, defaultTranslations } from '../defaults';
import type {
  Controls,
  Field,
  FieldSelectorProps,
  OperatorSelectorProps,
  QueryBuilderContextProps,
  TranslationsFull,
  ValueSourceSelectorProps,
} from '../types';
import { mergeClassnames, mergeTranslations } from '../utils';
import { usePreferProp } from './usePreferProp';

export type UseMergedContextProps<
  F extends Field = Field,
  O extends string = string,
> = QueryBuilderContextProps<F, O>;

/**
 * Merges inherited context values with props, giving precedence to props.
 */
export const useMergedContext = <F extends Field = Field, O extends string = string>(
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
    const contextControlElements: Partial<Controls<F, O>> = {
      ...rqbContext.controlElements,
      ...(rqbContext.controlElements?.actionElement
        ? {
            addGroupAction:
              rqbContext.controlElements?.addGroupAction ??
              rqbContext.controlElements.actionElement,
            addRuleAction:
              rqbContext.controlElements?.addRuleAction ?? rqbContext.controlElements.actionElement,
            cloneGroupAction:
              rqbContext.controlElements?.cloneGroupAction ??
              rqbContext.controlElements.actionElement,
            cloneRuleAction:
              rqbContext.controlElements?.cloneRuleAction ??
              rqbContext.controlElements.actionElement,
            lockGroupAction:
              rqbContext.controlElements?.lockGroupAction ??
              rqbContext.controlElements.actionElement,
            lockRuleAction:
              rqbContext.controlElements?.lockRuleAction ??
              rqbContext.controlElements.actionElement,
            removeGroupAction:
              rqbContext.controlElements?.removeGroupAction ??
              rqbContext.controlElements.actionElement,
            removeRuleAction:
              rqbContext.controlElements?.removeRuleAction ??
              rqbContext.controlElements.actionElement,
          }
        : {}),
      ...(rqbContext.controlElements?.valueSelector
        ? {
            combinatorSelector:
              rqbContext.controlElements?.combinatorSelector ??
              rqbContext.controlElements.valueSelector,
            fieldSelector:
              rqbContext.controlElements?.fieldSelector ??
              (rqbContext.controlElements.valueSelector as unknown as ComponentType<
                FieldSelectorProps<F>
              >),
            operatorSelector:
              rqbContext.controlElements?.operatorSelector ??
              (rqbContext.controlElements.valueSelector as ComponentType<OperatorSelectorProps>),
            valueSourceSelector:
              rqbContext.controlElements?.valueSourceSelector ??
              (rqbContext.controlElements.valueSelector as ComponentType<ValueSourceSelectorProps>),
          }
        : {}),
    };

    const propsControlElements: Partial<Controls<F, O>> = {
      ...props.controlElements,
      ...(props.controlElements?.actionElement
        ? {
            addGroupAction:
              props.controlElements?.addGroupAction ?? props.controlElements.actionElement,
            addRuleAction:
              props.controlElements?.addRuleAction ?? props.controlElements.actionElement,
            cloneGroupAction:
              props.controlElements?.cloneGroupAction ?? props.controlElements.actionElement,
            cloneRuleAction:
              props.controlElements?.cloneRuleAction ?? props.controlElements.actionElement,
            lockGroupAction:
              props.controlElements?.lockGroupAction ?? props.controlElements.actionElement,
            lockRuleAction:
              props.controlElements?.lockRuleAction ?? props.controlElements.actionElement,
            removeGroupAction:
              props.controlElements?.removeGroupAction ?? props.controlElements.actionElement,
            removeRuleAction:
              props.controlElements?.removeRuleAction ?? props.controlElements.actionElement,
          }
        : {}),
      ...(props.controlElements?.valueSelector
        ? {
            combinatorSelector:
              props.controlElements?.combinatorSelector ?? props.controlElements.valueSelector,
            fieldSelector:
              props.controlElements?.fieldSelector ??
              (props.controlElements.valueSelector as unknown as ComponentType<
                FieldSelectorProps<F>
              >),
            operatorSelector:
              props.controlElements?.operatorSelector ??
              (props.controlElements.valueSelector as ComponentType<OperatorSelectorProps>),
            valueSourceSelector:
              props.controlElements?.valueSourceSelector ??
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
