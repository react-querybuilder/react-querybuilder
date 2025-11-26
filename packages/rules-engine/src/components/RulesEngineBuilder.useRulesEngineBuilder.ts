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
import { queryBuilderStore } from 'react-querybuilder';
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
  REConditionCascade,
  RulesEngine,
  RulesEngineAny,
  RulesEngineProps,
  SchemaRE,
  TranslationsFullRE,
} from '../types';
import { addRE, mergeClassnamesRE, prepareRulesEngine, removeRE, updateRE } from '../utils';

queryBuilderStore.addSlice(rulesEngineSlice);

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

  const {
    rulesEngine: rulesEngineProp = defaultRulesEngine,
    defaultRulesEngine: defaultRulesEngineProp,
    consequentTypes: consequentTypesProp,
    enableMountRulesEngineChange = true,
    allowDefaultConsequents = true,
    allowNestedConditions = true,
    autoSelectConsequentType = false,
    suppressStandardClassnames = false,
    onRulesEngineChange,
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

  const { optionList: consequentTypes } = useMemo(
    () => prepareOptionList({ optionList: consequentTypesProp }),
    [consequentTypesProp]
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
  const rootRE: RulesEngineAny = candidateRulesEngine.id
    ? candidateRulesEngine
    : prepareRulesEngine(candidateRulesEngine, { idGenerator });

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

  // const independentCombinators = useMemo(() => isRuleGroupTypeIC(rootRE), [rootRE]);
  // const invalidIC = !!props.independentCombinators && !independentCombinators;
  // useDeprecatedProps(
  //   'independentCombinators',
  //   invalidIC || (!invalidIC && (props.independentCombinators ?? 'not present') !== 'not present'),
  //   invalidIC ? 'invalid' : 'unnecessary'
  // );

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
    (parentConditionPath: Path) => {
      const newRE = addRE(
        rulesEngine,
        { antecedent: { combinator: 'and', rules: [] } },
        parentConditionPath,
        { idGenerator }
      );
      dispatchRulesEngine(newRE);
    },
    [idGenerator, dispatchRulesEngine, rulesEngine]
  );

  const removeCondition = useCallback(
    (conditionPath: Path) => {
      const newRE = removeRE(rulesEngine, conditionPath);
      dispatchRulesEngine(newRE);
    },
    [dispatchRulesEngine, rulesEngine]
  );

  const updateCondition = useCallback(
    (conditionPath: Path, property: string, value: unknown) => {
      const newRE = updateRE(rulesEngine, property, value, conditionPath);
      dispatchRulesEngine(newRE);
    },
    [dispatchRulesEngine, rulesEngine]
  );
  // #endregion

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
      dispatchRulesEngine,
      getRulesEngine,
      queryBuilderProps,
      reId,
      removeCondition,
      suppressStandardClassnames,
      translations,
      updateCondition,
    ]
  );

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
