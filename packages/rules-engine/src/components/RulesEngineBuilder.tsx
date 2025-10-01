import type {
  BaseOption,
  FullField,
  FullOptionList,
  Path,
  RuleGroupType,
  RuleGroupTypeAny,
} from '@react-querybuilder/core';
import { clsx, prepareOptionList } from '@react-querybuilder/core';
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { defaultClassnamesRE, defaultRulesEngine, standardClassnamesRE } from '../defaults';
import type {
  ClassnamesRE,
  ComponentsRE,
  RulesEngine,
  RulesEngineAction,
  RulesEngineAny,
  RulesEngineBuilderHeaderProps,
  RulesEngineConditions,
  RulesEngineProps,
  SchemaRE,
} from '../types';
import { mergeClassnamesRE, prepareRulesEngine } from '../utils';
import { defaultComponentsRE } from './defaultComponents';
import { RulesEngineConditionCascade } from './RulesEngineConditionCascade';

const rootPath: Path = [];

export const RulesEngineBuilderHeader = (
  props: RulesEngineBuilderHeaderProps
): React.JSX.Element => (
  <div className={standardClassnamesRE.conditionBuilderHeader}>
    <button>+ Condition</button>
    <button disabled={!!props.defaultAction}>+ Action</button>
  </div>
);

export const RulesEngineBuilder = <RG extends RuleGroupTypeAny = RuleGroupType>(
  props: RulesEngineProps = {}
): React.JSX.Element => {
  const re = useRulesEngineBuilder<RG>(props);

  return (
    <div className={re.wrapperClassName}>
      <RulesEngineBuilderHeader
        conditionPath={rootPath}
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
} => {
  const {
    rulesEngine: rulesEngineProp = defaultRulesEngine,
    actionTypes: actionTypesProp,
    autoSelectActionType = false,
    onRulesEngineChange,
    classnames: classnamesProp = defaultClassnamesRE,
    components: componentsProp = defaultComponentsRE,
  } = props;

  const classnamesMerged = useMemo(
    () => mergeClassnamesRE(defaultClassnamesRE, classnamesProp),
    [classnamesProp]
  );
  const classnames = useMemo(
    () => ({
      rulesEngineBuilder: classnamesMerged.rulesEngineBuilder,
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
      classnamesMerged.blockLabel,
      classnamesMerged.actionBuilder,
      classnamesMerged.actionBuilderHeader,
      classnamesMerged.actionBuilderBody,
      classnamesMerged.actionBuilderStandalone,
      classnamesMerged.conditionBuilder,
      classnamesMerged.conditionBuilderHeader,
    ]
  );
  const wrapperClassName = useMemo(
    () =>
      clsx(
        // suppressStandardClassnames || standardClassnamesRE.rulesEngineBuilder,
        standardClassnamesRE.rulesEngineBuilder,
        clsx(classnames.rulesEngineBuilder)
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
    [classnames.rulesEngineBuilder]
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

  const schema = useMemo(
    (): SchemaRE => ({
      fields,
      components,
      classnames,
      actionTypes,
      autoSelectActionType,
    }),
    [actionTypes, autoSelectActionType, classnames, components, fields]
  );

  const rulesEngine = useMemo(() => (re.id ? re : prepareRulesEngine(re)), [re]);

  return {
    classnames,
    wrapperClassName,
    components,
    onChange,
    onDefaultActionChange,
    actionTypes,
    fields,
    schema,
    rulesEngine,
  };
};
