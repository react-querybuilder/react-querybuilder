import type { Path, RuleGroupType, RuleGroupTypeAny } from '@react-querybuilder/core';
import { prepareOptionList } from '@react-querybuilder/core';
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { defaultClassnamesRE, defaultRulesEngine, standardClassnamesRE } from '../defaults';
import type {
  RulesEngine,
  RulesEngineAction,
  RulesEngineConditions,
  RulesEngineProps,
  SchemaRE,
} from '../types';
import { prepareRulesEngine } from '../utils';
import { defaultComponentsRE } from './defaultComponents';
import { RulesEngineConditionCascade } from './RulesEngineConditionCascade';

const rootPath: Path = [];

export const RulesEngineBuilder = <RG extends RuleGroupTypeAny = RuleGroupType>(
  props: RulesEngineProps = {}
): React.JSX.Element => {
  const {
    rulesEngine = defaultRulesEngine,
    actionTypes: actionTypesProp,
    autoSelectActionType = false,
    onRulesEngineChange,
    classnames: classnamesProp = defaultClassnamesRE,
    components: componentsProp = defaultComponentsRE,
  } = props;

  // TODO: do a proper merge here
  const classnames = useMemo(
    () => ({ ...defaultClassnamesRE, ...classnamesProp }),
    [classnamesProp]
  );
  // TODO: do a proper merge here
  const components = useMemo(
    () => ({ ...defaultComponentsRE, ...componentsProp }),
    [componentsProp]
  );
  const [re, setRE] = useState<RulesEngine>(rulesEngine);
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
    (defaultAction: RulesEngineAction) => {
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

  const rePrepped = useMemo(() => (re.id ? re : prepareRulesEngine(re)), [re]);

  return (
    <div className={standardClassnamesRE.rulesEngineBuilder}>
      <div className={standardClassnamesRE.conditionBuilderHeader}>
        <button>+ Condition</button>
        <button disabled={!!rePrepped.defaultAction}>+ Action</button>
      </div>
      <RulesEngineConditionCascade
        conditionPath={rootPath}
        onConditionsChange={onChange}
        onDefaultActionChange={onDefaultActionChange}
        // @ts-expect-error TODO
        conditions={rePrepped.conditions}
        defaultAction={rePrepped.defaultAction}
        schema={schema}
      />
    </div>
  );
};
