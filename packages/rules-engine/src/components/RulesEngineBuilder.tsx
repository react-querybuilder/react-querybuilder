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
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import {
  defaultClassnamesRE,
  defaultRulesEngine,
  defaultTranslationsRE,
  standardClassnamesRE,
} from '../defaults';
import { useMergeComponents } from '../hooks';
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
import { RulesEngineConditionCascade } from './RulesEngineConditionCascade';

const rootPath: Path = [];

export const RulesEngineBuilder = <RG extends RuleGroupTypeAny = RuleGroupType>(
  props: RulesEngineProps = {}
): React.JSX.Element => {
  const re = useRulesEngineBuilder<RG>(props);

  const { rulesEngineBuilderHeader: RulesEngineBuilderHeader } = re.components;

  return (
    <div className={re.wrapperClassName}>
      <RulesEngineBuilderHeader
        conditionPath={rootPath}
        classnames={re.headerClassName}
        schema={re.schema}
        defaultConsequent={re.rulesEngine.defaultConsequent}
      />
      <RulesEngineConditionCascade
        conditionPath={rootPath}
        onConditionsChange={re.onChange}
        onDefaultConsequentChange={re.onDefaultConsequentChange}
        // @ts-expect-error TODO
        conditions={re.rulesEngine.conditions}
        defaultConsequent={re.rulesEngine.defaultConsequent}
        schema={re.schema}
      />
    </div>
  );
};

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
  const {
    rulesEngine: rulesEngineProp = defaultRulesEngine,
    consequentTypes: consequentTypesProp,
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

  const components = useMergeComponents(componentsProp);

  const [re, setRE] = useState<RulesEngine>(rulesEngineProp);

  const onChange = useCallback(
    (conditions: REConditionCascade<RG>) => {
      const newRE = { ...re, conditions } as RulesEngine;
      setRE(newRE);
      onRulesEngineChange?.(newRE);
    },
    [onRulesEngineChange, re]
  );

  const onDefaultConsequentChange = useCallback(
    (defaultConsequent?: Consequent) => {
      const newRE = { ...re, defaultConsequent };
      setRE(newRE);
      onRulesEngineChange?.(newRE);
    },
    [onRulesEngineChange, re]
  );

  const { optionList: consequentTypes } = useMemo(
    () => prepareOptionList({ optionList: consequentTypesProp }),
    [consequentTypesProp]
  );

  const translations = useMemo(
    () =>
      mergeAnyTranslations(
        defaultTranslationsRE,
        translationsProp as Partial<TranslationsFullRE>
      ) as TranslationsFullRE,
    [translationsProp]
  );

  const rulesEngine = useMemo(() => (re.id ? re : prepareRulesEngine(re)), [re]);

  // #region Actions
  const addCondition = useCallback(
    (parentConditionPath: Path) => {
      const newRE = addRE(
        rulesEngine,
        { antecedent: { combinator: 'and', rules: [] } },
        parentConditionPath,
        { idGenerator }
      );
      setRE(newRE);
      onRulesEngineChange?.(newRE);
    },
    [idGenerator, onRulesEngineChange, rulesEngine]
  );

  const removeCondition = useCallback(
    (conditionPath: Path) => {
      const newRE = removeRE(rulesEngine, conditionPath);
      setRE(newRE);
      onRulesEngineChange?.(newRE);
    },
    [onRulesEngineChange, rulesEngine]
  );

  const updateCondition = useCallback(
    (parentConditionPath: Path, property: string, value: unknown) => {
      const newRE = updateRE(rulesEngine, property, value, parentConditionPath);
      setRE(newRE);
      onRulesEngineChange?.(newRE);
    },
    [onRulesEngineChange, rulesEngine]
  );
  // #endregion

  const schema = useMemo(
    (): SchemaRE => ({
      addCondition,
      allowNestedConditions,
      autoSelectConsequentType,
      classnames,
      components,
      consequentTypes,
      queryBuilderProps,
      removeCondition,
      suppressStandardClassnames,
      translations,
      updateCondition,
    }),
    [
      addCondition,
      allowNestedConditions,
      autoSelectConsequentType,
      classnames,
      components,
      consequentTypes,
      queryBuilderProps,
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
