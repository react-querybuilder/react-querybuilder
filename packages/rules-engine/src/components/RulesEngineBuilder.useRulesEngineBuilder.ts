import type {
  BaseOption,
  FullOptionList,
  Path,
  RuleGroupType,
  RuleGroupTypeAny,
} from '@react-querybuilder/core';
import {
  clsx,
  generateID,
  mergeAnyTranslations,
  prepareOptionList,
} from '@react-querybuilder/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  defaultPlaceholderLabel,
  defaultPlaceholderName,
  isRuleGroupTypeIC,
  queryBuilderStore,
} from 'react-querybuilder';
import {
  defaultClassnamesRE,
  defaultRulesEngine,
  defaultTranslationsRE,
  standardClassnamesRE,
} from '../defaults';
import { useMergeComponents } from '../hooks';
import { getRulesEngineSelectorById, useRulesEngineBuilderSelector } from '../redux';
import {
  _RQB_INTERNAL_dispatchThunk,
  useRQB_INTERNAL_QueryBuilderDispatch,
  useRQB_INTERNAL_QueryBuilderStore,
} from '../redux/_internal';
import { rulesEngineSlice } from '../redux/rulesEngineSlice';
import type {
  ClassnamesRE,
  ComponentsRE,
  Consequent,
  RECondition,
  REConditionAny,
  REConditionCascade,
  REConditionIC,
  RulesEngine,
  RulesEngineAny,
  RulesEngineProps,
  SchemaRE,
  TranslationsFullRE,
} from '../types';
import {
  addRE,
  findConditionPath,
  mergeClassnamesRE,
  prepareRulesEngine,
  removeRE,
  updateRE,
} from '../utils';

const defaultConditionIC: REConditionIC = { antecedent: { rules: [] } };
const defaultCondition: RECondition = { antecedent: { combinator: 'and', rules: [] } };
const returnTrue = () => true;

queryBuilderStore.addSlice(rulesEngineSlice);

/**
 * Prepares and manages state for {@link RulesEngineBuilder}.
 *
 * @group Hooks
 */
export const useRulesEngineBuilder = <RG extends RuleGroupTypeAny = RuleGroupType>(
  props: RulesEngineProps = {}
): {
  consequentTypes: FullOptionList<BaseOption>;
  classnames: ClassnamesRE;
  components: ComponentsRE;
  onChange: (conditions: REConditionCascade<RG>) => void;
  onDefaultConsequentChange: (defaultConsequent?: Consequent) => void;
  rulesEngine: RulesEngineAny;
  schema: SchemaRE;
  wrapperClassName: string;
  headerClassName: string;
} => {
  const [reId] = useState(generateID);
  const isFirstRender = useRef(true);

  const {
    rulesEngine: rulesEngineProp = defaultRulesEngine,
    defaultRulesEngine: defaultRulesEngineProp,
    consequentTypes: consequentTypesProp,
    getConsequentTypes,
    enableMountRulesEngineChange = true,
    allowDefaultConsequents = true,
    allowNestedConditions = true,
    autoSelectConsequentType = true,
    suppressStandardClassnames = false,
    onRulesEngineChange,
    onAddCondition = returnTrue,
    onRemoveCondition = returnTrue,
    classnames: classnamesProp = defaultClassnamesRE,
    components: componentsProp,
    translations: translationsProp = {},
    queryBuilderProps,
    idGenerator = generateID,
  } = props;

  // #region Classnames
  const classnamesMerged = useMemo(
    () => mergeClassnamesRE(defaultClassnamesRE, classnamesProp),
    [classnamesProp]
  );
  const classnames = useMemo(
    (): ClassnamesRE => ({
      blockLabel: classnamesMerged.blockLabel,
      blockLabelElse: classnamesMerged.blockLabelElse,
      blockLabelIf: classnamesMerged.blockLabelIf,
      blockLabelIfElse: classnamesMerged.blockLabelIfElse,
      blockLabelThen: classnamesMerged.blockLabelThen,
      conditionBuilder: classnamesMerged.conditionBuilder,
      conditionBuilderHeader: classnamesMerged.conditionBuilderHeader,
      consequentBuilder: classnamesMerged.consequentBuilder,
      consequentBuilderBody: classnamesMerged.consequentBuilderBody,
      consequentBuilderHeader: classnamesMerged.consequentBuilderHeader,
      consequentBuilderStandalone: classnamesMerged.consequentBuilderStandalone,
      rulesEngineBuilder: classnamesMerged.rulesEngineBuilder,
      rulesEngineHeader: classnamesMerged.rulesEngineHeader,
    }),
    [
      classnamesMerged.blockLabel,
      classnamesMerged.blockLabelElse,
      classnamesMerged.blockLabelIf,
      classnamesMerged.blockLabelIfElse,
      classnamesMerged.blockLabelThen,
      classnamesMerged.conditionBuilder,
      classnamesMerged.conditionBuilderHeader,
      classnamesMerged.consequentBuilder,
      classnamesMerged.consequentBuilderBody,
      classnamesMerged.consequentBuilderHeader,
      classnamesMerged.consequentBuilderStandalone,
      classnamesMerged.rulesEngineBuilder,
      classnamesMerged.rulesEngineHeader,
    ]
  );
  const headerClassName = useMemo(
    () =>
      clsx(
        suppressStandardClassnames || standardClassnamesRE.rulesEngineHeader,
        classnames.rulesEngineHeader
      ),
    [classnames.rulesEngineHeader, suppressStandardClassnames]
  );
  const wrapperClassName = useMemo(
    () =>
      clsx(
        suppressStandardClassnames || standardClassnamesRE.rulesEngineBuilder,
        classnames.rulesEngineBuilder
        // TODO: implement locking and validation
        // // custom conditional classes
        // rulesEngineDisabled && classnames.disabled,
        // typeof validationResult === 'boolean' && validationResult && classnames.valid,
        // typeof validationResult === 'boolean' && !validationResult && classnames.invalid,
        // // standard conditional classes
        // suppressStandardClassnames || {
        //   [standardClassnames.disabled]: rulesEngineDisabled,
        //   [standardClassnames.valid]: typeof validationResult === 'boolean' && validationResult,
        //   [standardClassnames.invalid]: typeof validationResult === 'boolean' && !validationResult,
        // }
      ),
    [classnames.rulesEngineBuilder, suppressStandardClassnames]
  );
  // #endregion

  // #region Prop prep
  const components = useMergeComponents(componentsProp);

  const translations = useMemo(
    () =>
      mergeAnyTranslations(
        defaultTranslationsRE,
        translationsProp as Partial<TranslationsFullRE>
      ) as TranslationsFullRE,
    [translationsProp]
  );
  // #endregion

  // #region `consequentTypes`
  const { optionList: consequentTypes, defaultOption: defaultConsequentType } = useMemo(
    () =>
      prepareOptionList({
        optionList: consequentTypesProp ?? [],
        placeholder: {
          placeholderName: defaultPlaceholderName,
          placeholderLabel: defaultPlaceholderLabel,
          placeholderGroupLabel: defaultPlaceholderLabel,
        },
        labelMap: {},
        baseOption: {},
        autoSelectOption: autoSelectConsequentType,
      }),
    [autoSelectConsequentType, consequentTypesProp]
  );

  const getConsequentTypesMain = useCallback(
    (conditionPath: Path, antecedent: RuleGroupTypeAny, context?: unknown) =>
      prepareOptionList({
        optionList:
          consequentTypes ??
          getConsequentTypes?.(conditionPath, antecedent, context) ??
          consequentTypesProp ??
          [],
        placeholder: {
          placeholderName: defaultPlaceholderName,
          placeholderLabel: defaultPlaceholderLabel,
          placeholderGroupLabel: defaultPlaceholderLabel,
        },
        autoSelectOption: autoSelectConsequentType,
      }).optionList,
    [consequentTypesProp, getConsequentTypes, consequentTypes, autoSelectConsequentType]
  );
  // #endregion

  // #region Controlled vs uncontrolled mode

  // TODO: set up c/uc for RE
  // useControlledOrUncontrolled({
  //   defaultQuery: defaultQueryProp,
  //   queryProp,
  // });

  const queryBuilderStore = useRQB_INTERNAL_QueryBuilderStore();
  const queryBuilderDispatch = useRQB_INTERNAL_QueryBuilderDispatch();

  const rulesEngineSelector = useMemo(() => getRulesEngineSelectorById(reId), [reId]);
  const storeRulesEngine = useRulesEngineBuilderSelector(rulesEngineSelector);
  const getRulesEngine = useCallback(
    () => rulesEngineSelector(queryBuilderStore.getState()),
    [queryBuilderStore, rulesEngineSelector]
  );

  // const fallbackRulesEngine = useMemo(() => createRulesEngine(), [createRulesEngine]);
  const fallbackRulesEngine = useMemo<RulesEngine>(
    () => ({ conditions: [{ antecedent: { combinator: 'and', rules: [] } }] }),
    []
  );

  // We assume here that if the rulesEngine has an `id` property, the rulesEngine has already
  // been prepared. If `candidateRulesEngine === rulesEngine`, the user is probably just
  // passing back the parameter from the `onRulesEngineChange` callback.
  const candidateRulesEngine =
    rulesEngineProp ?? storeRulesEngine ?? defaultRulesEngineProp ?? fallbackRulesEngine;
  const rootRE: RulesEngineAny =
    !candidateRulesEngine.id || isFirstRender.current
      ? prepareRulesEngine(candidateRulesEngine, { idGenerator })
      : candidateRulesEngine;

  // const [initialRulesEngine] = useState(rootRE);
  // const rqbContext = useMemo(
  //   () => ({ ...incomingRqbContext, initialRulesEngine }),
  //   [incomingRqbContext, initialRulesEngine]
  // );

  // If a new `rulesEngine` prop is passed in that doesn't match the rulesEngine in the store,
  // update the store to match the prop _without_ calling `onRulesEngineChange`.
  useEffect(() => {
    if (!!rulesEngineProp && !Object.is(rulesEngineProp, storeRulesEngine)) {
      queryBuilderDispatch(
        _RQB_INTERNAL_dispatchThunk({
          payload: { reId, rulesEngine: rulesEngineProp },
          onRulesEngineChange: undefined,
        })
      );
    }
  }, [rulesEngineProp, reId, storeRulesEngine, queryBuilderDispatch]);

  const independentCombinators = useMemo(
    () => isRuleGroupTypeIC(rootRE.conditions[0]?.antecedent),
    // oxlint-disable-next-line exhaustive-deps
    [rootRE.conditions[0]?.antecedent]
  );

  const hasRunMountRulesEngineChange = useRef(false);
  useEffect(() => {
    if (hasRunMountRulesEngineChange.current) return;
    hasRunMountRulesEngineChange.current = true;
    queryBuilderDispatch(
      _RQB_INTERNAL_dispatchThunk({
        payload: { reId, rulesEngine: rootRE },
        onRulesEngineChange:
          // Leave `onRulesEngineChange` undefined if `enableMountRulesEngineChange` is disabled
          enableMountRulesEngineChange && typeof onRulesEngineChange === 'function'
            ? onRulesEngineChange
            : undefined,
      })
    );
  }, [enableMountRulesEngineChange, onRulesEngineChange, reId, queryBuilderDispatch, rootRE]);

  /**
   * Updates the redux-based rulesEngine, then calls `onRulesEngineChange` with the updated
   * rulesEngine object. NOTE: `useCallback` is only effective here when the user's
   * `onRulesEngineChange` handler is undefined or has a stable reference, which usually
   * means that it's wrapped in its own `useCallback`.
   */
  const dispatchRulesEngine = useCallback(
    (newRulesEngine: RulesEngineAny) => {
      queryBuilderDispatch(
        _RQB_INTERNAL_dispatchThunk({
          payload: { reId, rulesEngine: newRulesEngine },
          onRulesEngineChange,
        })
      );
    },
    [onRulesEngineChange, reId, queryBuilderDispatch]
  );

  const rulesEngine = useMemo(() => (rootRE.id ? rootRE : prepareRulesEngine(rootRE)), [rootRE]);
  // #endregion

  // #region Actions
  const onChange = useCallback(
    (conditions: REConditionCascade<RG>) => {
      const newRE = { ...rootRE, conditions } as RulesEngine;
      dispatchRulesEngine(newRE);
    },
    [dispatchRulesEngine, rootRE]
  );

  const onDefaultConsequentChange = useCallback(
    (defaultConsequent?: Consequent) => {
      const newRE = { ...rootRE, defaultConsequent };
      dispatchRulesEngine(newRE);
    },
    [dispatchRulesEngine, rootRE]
  );

  const addCondition = useCallback(
    (
      parentConditionPath: Path,
      condition: REConditionAny = independentCombinators ? defaultConditionIC : defaultCondition
    ) => {
      const reLocal = getRulesEngineSelectorById(reId)(queryBuilderStore.getState());
      // istanbul ignore if
      if (!reLocal) return;
      // if (pathIsDisabled(parentConditionPath, reLocal) || rulesEngineDisabled) {
      //   log({ reId, type: LogType.parentPathDisabled, condition, parentConditionPath, rulesEngine: reLocal });
      //   return;
      // }
      const nextCondition = onAddCondition(condition, parentConditionPath, reLocal);
      if (!nextCondition) {
        // log({ reId, type: LogType.onAddConditionFalse, condition, parentConditionPath, rulesEngine: reLocal });
        return;
      }
      const newCondition = nextCondition === true ? condition : nextCondition;
      const newRulesEngine = addRE(reLocal, newCondition, parentConditionPath, {
        idGenerator,
      });
      // log({ reId, type: LogType.add, rulesEngine: reLocal, newRulesEngine, newCondition, parentConditionPath });
      dispatchRulesEngine(newRulesEngine);
    },
    [
      dispatchRulesEngine,
      idGenerator,
      independentCombinators,
      onAddCondition,
      queryBuilderStore,
      reId,
    ]
  );

  const removeCondition = useCallback(
    (conditionPath: Path) => {
      const reLocal = getRulesEngineSelectorById(reId)(queryBuilderStore.getState());
      // istanbul ignore if
      if (!reLocal) return;
      // if (pathIsDisabled(path, reLocal) || rulesEngineDisabled) {
      //   log({ reId, type: LogType.pathDisabled, path, rulesEngine: reLocal });
      //   return;
      // }
      const condition = findConditionPath(conditionPath, reLocal);
      // istanbul ignore else
      if (condition) {
        if (onRemoveCondition(condition as REConditionAny, conditionPath, reLocal)) {
          const newRE = removeRE(reLocal, conditionPath);
          // log({ reId, type: LogType.remove, rulesEngine: reLocal, newRE, path: conditionPath, condition });
          dispatchRulesEngine(newRE);
        } //else {
        //   log({ reId, type: LogType.onRemoveFalse, condition, path: conditionPath, rulesEngine: reLocal });
        // }
      }
    },
    [dispatchRulesEngine, onRemoveCondition, reId, queryBuilderStore]
  );

  const updateCondition = useCallback(
    (conditionPath: Path, property: string, value: unknown) => {
      const newRE = updateRE(rulesEngine, property, value, conditionPath);
      dispatchRulesEngine(newRE);
    },
    [dispatchRulesEngine, rulesEngine]
  );
  // #endregion

  // #region Schema
  const schema = useMemo(
    (): SchemaRE => ({
      addCondition,
      allowDefaultConsequents,
      allowNestedConditions,
      autoSelectConsequentType,
      classnames,
      components,
      consequentTypes,
      dispatchRulesEngine,
      getRulesEngine,
      defaultConsequentType,
      getConsequentTypes: getConsequentTypesMain,
      queryBuilderProps,
      reId,
      removeCondition,
      suppressStandardClassnames,
      translations,
      updateCondition,
    }),
    [
      addCondition,
      allowDefaultConsequents,
      allowNestedConditions,
      autoSelectConsequentType,
      classnames,
      components,
      consequentTypes,
      defaultConsequentType,
      dispatchRulesEngine,
      getConsequentTypesMain,
      getRulesEngine,
      queryBuilderProps,
      reId,
      removeCondition,
      suppressStandardClassnames,
      translations,
      updateCondition,
    ]
  );
  // #endregion

  isFirstRender.current = false;

  return {
    classnames,
    components,
    consequentTypes,
    headerClassName,
    onChange,
    onDefaultConsequentChange,
    rulesEngine,
    schema,
    wrapperClassName,
  };
};
