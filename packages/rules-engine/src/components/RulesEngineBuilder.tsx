import type {
  BaseOption,
  FullField,
  FullOptionList,
  Path,
  RuleGroupType,
  RuleGroupTypeAny,
} from '@react-querybuilder/core';
import { clsx, mergeAnyTranslations, prepareOptionList } from '@react-querybuilder/core';
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
  AntecedentCascade,
  ClassnamesRE,
  ComponentsRE,
  Consequent,
  RulesEngine,
  RulesEngineAny,
  RulesEngineProps,
  SchemaRE,
  TranslationsFullRE,
} from '../types';
import { mergeClassnamesRE, prepareRulesEngine } from '../utils';
import { RulesEngineConditionCascade } from './RulesEngineConditionCascade';

const rootPath: Path = [];

export const RulesEngineBuilder = <RG extends RuleGroupTypeAny = RuleGroupType>(
  props: RulesEngineProps = {}
): React.JSX.Element => {
  const re = useRulesEngineBuilder<RG>(props);

  const { rulesEngineBuilderHeader: REBuilderHeader } = re.components;

  return (
    <div className={re.wrapperClassName}>
      <REBuilderHeader
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
  fields: FullOptionList<FullField>;
  onChange: (conditions: AntecedentCascade<RG>) => void;
  onDefaultConsequentChange: (defaultConsequent?: Consequent) => void;
  rulesEngine: RulesEngineAny;
  schema: SchemaRE;
  wrapperClassName: string;
  headerClassName: string;
} => {
  const {
    rulesEngine: rulesEngineProp = defaultRulesEngine,
    consequentTypes: consequentTypesProp,
    autoSelectConsequentType = false,
    suppressStandardClassnames = false,
    onRulesEngineChange,
    classnames: classnamesProp = defaultClassnamesRE,
    components: componentsProp,
    translations: translationsProp = {},
  } = props;

  const classnamesMerged = useMemo(
    () => mergeClassnamesRE(defaultClassnamesRE, classnamesProp),
    [classnamesProp]
  );
  const classnames = useMemo(
    (): ClassnamesRE => ({
      rulesEngineBuilder: classnamesMerged.rulesEngineBuilder,
      rulesEngineHeader: classnamesMerged.rulesEngineHeader,
      blockLabel: classnamesMerged.blockLabel,
      consequentBuilder: classnamesMerged.consequentBuilder,
      consequentBuilderHeader: classnamesMerged.consequentBuilderHeader,
      consequentBuilderBody: classnamesMerged.consequentBuilderBody,
      consequentBuilderStandalone: classnamesMerged.consequentBuilderStandalone,
      conditionBuilder: classnamesMerged.conditionBuilder,
      conditionBuilderHeader: classnamesMerged.conditionBuilderHeader,
    }),
    [
      classnamesMerged.rulesEngineBuilder,
      classnamesMerged.rulesEngineHeader,
      classnamesMerged.blockLabel,
      classnamesMerged.consequentBuilder,
      classnamesMerged.consequentBuilderHeader,
      classnamesMerged.consequentBuilderBody,
      classnamesMerged.consequentBuilderStandalone,
      classnamesMerged.conditionBuilder,
      classnamesMerged.conditionBuilderHeader,
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

  const components = useMergeComponents(componentsProp ?? {});

  const [re, setRE] = useState<RulesEngine>(rulesEngineProp);
  const onChange = useCallback(
    (conditions: AntecedentCascade<RG>) => {
      const newRE = { ...re, conditions };
      // @ts-expect-error TODO
      setRE(newRE);
      // @ts-expect-error TODO
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
  const { optionList: fields } = useMemo(
    () => prepareOptionList({ optionList: props.fields }),
    [props.fields]
  );

  const translations = useMemo(
    () =>
      mergeAnyTranslations(
        defaultTranslationsRE,
        translationsProp as Partial<TranslationsFullRE>
      ) as TranslationsFullRE,
    [translationsProp]
  );

  const schema = useMemo(
    (): SchemaRE => ({
      fields,
      components,
      classnames,
      consequentTypes,
      autoSelectConsequentType,
      suppressStandardClassnames,
      translations,
    }),
    [
      consequentTypes,
      autoSelectConsequentType,
      suppressStandardClassnames,
      classnames,
      components,
      fields,
      translations,
    ]
  );

  const rulesEngine = useMemo(() => (re.id ? re : prepareRulesEngine(re)), [re]);

  return {
    classnames,
    wrapperClassName,
    headerClassName,
    components,
    onChange,
    onDefaultConsequentChange,
    consequentTypes,
    fields,
    schema,
    rulesEngine,
  };
};
