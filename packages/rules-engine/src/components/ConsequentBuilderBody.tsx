import { clsx, getOption } from '@react-querybuilder/core';
import * as React from 'react';
import { standardClassnamesRE } from '../defaults';
import type { ConsequentPropertyDef, ConsequentProps } from '../types';

type SetPropertyFn = (name: string, value: unknown) => void;

/**
 * Renders a single property input for the built-in {@link ConsequentBuilderBody}.
 */
const ConsequentPropertyInput = (props: {
  prop: ConsequentPropertyDef;
  value: unknown;
  setProperty: SetPropertyFn;
}): React.JSX.Element => {
  const { prop, value, setProperty } = props;
  const { name, label, inputType = 'text', values } = prop;
  const labelText = label ?? name;

  switch (inputType) {
    case 'textarea':
      return (
        <label>
          {labelText}
          <textarea
            value={(value ?? '') as string}
            // oxlint-disable-next-line react-perf/jsx-no-new-function-as-prop
            onChange={e => setProperty(name, e.target.value)}
          />
        </label>
      );
    case 'number':
      return (
        <label>
          {labelText}
          <input
            type="number"
            value={(value ?? '') as number | string}
            onChange={
              // oxlint-disable-next-line react-perf/jsx-no-new-function-as-prop
              e => setProperty(name, e.target.value === '' ? undefined : e.target.valueAsNumber)
            }
          />
        </label>
      );
    case 'checkbox':
      return (
        <label>
          {labelText}
          <input
            type="checkbox"
            checked={!!value}
            // oxlint-disable-next-line react-perf/jsx-no-new-function-as-prop
            onChange={e => setProperty(name, e.target.checked)}
          />
        </label>
      );
    case 'select':
      return (
        <label>
          {labelText}
          <select
            value={(value ?? '') as string}
            // oxlint-disable-next-line react-perf/jsx-no-new-function-as-prop
            onChange={e => setProperty(name, e.target.value)}>
            {(values ?? []).map(v => (
              <option key={v.value ?? v.name} value={v.value ?? v.name}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
      );
    default:
      return (
        <label>
          {labelText}
          <input
            type="text"
            value={(value ?? '') as string}
            // oxlint-disable-next-line react-perf/jsx-no-new-function-as-prop
            onChange={e => setProperty(name, e.target.value)}
          />
        </label>
      );
  }
};

/**
 * Default body component for {@link ConsequentBuilder}.
 *
 * Renders the consequent-type selector and, when the selected type carries `properties`
 * (see {@link ConsequentTypeOption}), an input for each property. Property values are stored
 * on the consequent under `params[name]`.
 *
 * @group Components
 */
export const ConsequentBuilderBody: React.MemoExoticComponent<
  (props: ConsequentProps) => React.JSX.Element
> = React.memo(function ConsequentBuilderBody(props: ConsequentProps): React.JSX.Element {
  const {
    consequent,
    consequentTypes = [],
    conditionPath,
    onConsequentChange,
    schema: {
      classnames: { consequentBuilderBody },
      components: { consequentSelector: ConsequentSelector },
      suppressStandardClassnames,
    },
  } = props;

  const className = React.useMemo(
    () =>
      clsx(
        suppressStandardClassnames || standardClassnamesRE.consequentBuilderBody,
        consequentBuilderBody
      ),
    [consequentBuilderBody, suppressStandardClassnames]
  );

  const properties = React.useMemo(
    () => getOption(consequentTypes, consequent.type)?.properties,
    [consequentTypes, consequent.type]
  );

  const handleOnChange = React.useCallback(
    (type: string) => {
      const newProperties = getOption(consequentTypes, type)?.properties;
      // Switching type resets params, seeding any property defaults from the new type.
      if (newProperties && newProperties.length > 0) {
        const params: Record<string, unknown> = {};
        for (const p of newProperties) {
          if (p.defaultValue !== undefined) params[p.name] = p.defaultValue;
        }
        onConsequentChange({ ...consequent, type, params });
      } else {
        const prevProperties = getOption(consequentTypes, consequent.type)?.properties;
        if (prevProperties && prevProperties.length > 0) {
          // Leaving a property-based type: drop now-meaningless managed params.
          const { params: _drop, ...rest } = consequent;
          onConsequentChange({ ...rest, type });
        } else {
          // Neither type is property-based: preserve the consequent (backward compatible).
          onConsequentChange({ ...consequent, type });
        }
      }
    },
    [consequentTypes, consequent, onConsequentChange]
  );

  const setProperty = React.useCallback<SetPropertyFn>(
    (name, value) => {
      const prevParams = (consequent.params ?? {}) as Record<string, unknown>;
      onConsequentChange({ ...consequent, params: { ...prevParams, [name]: value } });
    },
    [consequent, onConsequentChange]
  );

  const params = consequent.params as Record<string, unknown> | undefined;

  return (
    <div className={className}>
      {props.consequentTypes && (
        <ConsequentSelector
          schema={props.schema}
          path={conditionPath}
          level={conditionPath.length}
          value={consequent.type}
          handleOnChange={handleOnChange}
          options={consequentTypes}
        />
      )}
      {properties?.map(prop => (
        <ConsequentPropertyInput
          key={prop.name}
          prop={prop}
          value={params?.[prop.name]}
          setProperty={setProperty}
        />
      ))}
    </div>
  );
});
