import type { ConsequentProps } from '@react-querybuilder/rules-engine';
import * as React from 'react';
import { paramSchemas } from './_constants/consequentTypes';
import styles from './RulesEngineDemo.module.css';

// Custom `components.consequentBuilderBody`. Renders the built-in type selector plus
// editable inputs for the selected consequent type's params (the built-in UI edits
// only `type`).
export const ConsequentParamsEditor = (props: ConsequentProps): React.JSX.Element => {
  const {
    consequent,
    consequentTypes = [],
    conditionPath,
    onConsequentChange,
    schema: { components },
  } = props;
  const ConsequentSelector = components.consequentSelector;

  const params = (consequent.params ?? {}) as Record<string, unknown>;
  const schema = paramSchemas[consequent.type] ?? [];

  const handleTypeChange = React.useCallback(
    (type: string) => onConsequentChange({ ...consequent, type, params: {} }),
    [onConsequentChange, consequent]
  );

  const handleParamChange = (name: string, value: unknown) =>
    onConsequentChange({ ...consequent, params: { ...params, [name]: value } });

  return (
    <div className={styles.consequentParams}>
      {props.consequentTypes && (
        <ConsequentSelector
          schema={props.schema}
          path={conditionPath}
          level={conditionPath.length}
          value={consequent.type}
          handleOnChange={handleTypeChange}
          options={consequentTypes}
        />
      )}
      {schema.map(({ name, label, inputType }) => {
        const value = params[name] ?? '';
        const id = `${consequent.id ?? conditionPath.join('-')}-${name}`;
        return (
          <label key={name} className={styles.paramField} htmlFor={id}>
            <span>{label}</span>
            {inputType === 'textarea' ? (
              <textarea
                id={id}
                value={String(value)}
                onChange={e => handleParamChange(name, e.target.value)}
              />
            ) : (
              <input
                id={id}
                type={inputType === 'number' ? 'number' : 'text'}
                value={String(value)}
                onChange={e =>
                  handleParamChange(
                    name,
                    inputType === 'number'
                      ? e.target.value === ''
                        ? ''
                        : Number(e.target.value)
                      : e.target.value
                  )
                }
              />
            )}
          </label>
        );
      })}
    </div>
  );
};
