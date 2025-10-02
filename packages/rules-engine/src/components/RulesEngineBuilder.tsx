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
import type {
  ClassnamesRE,
  ComponentsRE,
  RulesEngine,
  RulesEngineAction,
  RulesEngineAny,
  RulesEngineConditions,
  RulesEngineProps,
  SchemaRE,
  TranslationsFullRE,
} from '../types';
import { mergeClassnamesRE, prepareRulesEngine } from '../utils';
import { defaultComponentsRE } from './defaultComponents';
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
        defaultAction={re.rulesEngine.defaultAction}
      />
      <RulesEngineConditionCascade
        conditionPath={rootPath}
        onConditionsChange={re.onChange}
        onDefaultActionChange={re.onDefaultActionChange}
        // @ts-expect-error TODO
        conditions={re.rulesEngine.conditions}
        defaultAction={re.rulesEngine.defaultAction}
        schema={re.schema}
      />
    </div>
  );
};

export const useRulesEngineBuilder = <RG extends RuleGroupTypeAny = RuleGroupType>(
  props: RulesEngineProps = {}
): {
  actionTypes: FullOptionList<BaseOption>;
  classnames: ClassnamesRE;
  components: ComponentsRE;
  fields: FullOptionList<FullField>;
  onChange: (conditions: RulesEngineConditions<RG>) => void;
  onDefaultActionChange: (defaultAction?: RulesEngineAction) => void;
  rulesEngine: RulesEngineAny;
  schema: SchemaRE;
  wrapperClassName: string;
  headerClassName: string;
} => {
  const {
    rulesEngine: rulesEngineProp = defaultRulesEngine,
    actionTypes: actionTypesProp,
    autoSelectActionType = false,
    suppressStandardClassnames = false,
    onRulesEngineChange,
    classnames: classnamesProp = defaultClassnamesRE,
    components: componentsProp = defaultComponentsRE,
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
      actionBuilder: classnamesMerged.actionBuilder,
      actionBuilderHeader: classnamesMerged.actionBuilderHeader,
      actionBuilderBody: classnamesMerged.actionBuilderBody,
      actionBuilderStandalone: classnamesMerged.actionBuilderStandalone,
      conditionBuilder: classnamesMerged.conditionBuilder,
      conditionBuilderHeader: classnamesMerged.conditionBuilderHeader,
    }),
    [
      classnamesMerged.rulesEngineBuilder,
      classnamesMerged.rulesEngineHeader,
      classnamesMerged.blockLabel,
      classnamesMerged.actionBuilder,
      classnamesMerged.actionBuilderHeader,
      classnamesMerged.actionBuilderBody,
      classnamesMerged.actionBuilderStandalone,
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

  // TODO: do a proper merge here
  const components = useMemo(
    () => ({ ...defaultComponentsRE, ...componentsProp }),
    [componentsProp]
  );
  const [re, setRE] = useState<RulesEngine>(rulesEngineProp);
  const onChange = useCallback(
    (conditions: RulesEngineConditions<RG>) => {
      const newRE = { ...re, conditions };
      // @ts-expect-error TODO
      setRE(newRE);
      // @ts-expect-error TODO
      onRulesEngineChange?.(newRE);
    },
    [onRulesEngineChange, re]
  );
  const onDefaultActionChange = useCallback(
    (defaultAction?: RulesEngineAction) => {
      const newRE = { ...re, defaultAction };
      setRE(newRE);
      onRulesEngineChange?.(newRE);
    },
    [onRulesEngineChange, re]
  );
  const { optionList: actionTypes } = useMemo(
    () => prepareOptionList({ optionList: actionTypesProp }),
    [actionTypesProp]
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
      actionTypes,
      autoSelectActionType,
      suppressStandardClassnames,
      translations,
    }),
    [
      actionTypes,
      autoSelectActionType,
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
    onDefaultActionChange,
    actionTypes,
    fields,
    schema,
    rulesEngine,
  };
};
