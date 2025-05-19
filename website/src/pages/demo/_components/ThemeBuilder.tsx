import CodeBlock from '@theme/CodeBlock';
import TabItem from '@theme/TabItem';
import Tabs from '@theme/Tabs';
import * as React from 'react';

const VAR_DEFAULTS = {
  rqb_spacing: '0.5rem',
  rqb_border_width: '1px',
  rqb_base_color: '#004bb8',
  rqb_background_color: 'color-mix(in srgb, transparent, var(--rqb-base-color) 20%)',
  rqb_border_color: '#8081a2',
  rqb_border_style: 'solid',
  rqb_border_radius: '0.25rem',
  rqb_dnd_drop_indicator_color: 'rebeccapurple',
  rqb_dnd_drop_indicator_copy_color: '#669933',
  rqb_dnd_drop_indicator_style: 'dashed',
  rqb_dnd_drop_indicator_width: '2px',
  rqb_branch_indent: 'var(--rqb-spacing)',
  rqb_branch_width: 'var(--rqb-border-width)',
  rqb_branch_color: 'var(--rqb-border-color)',
  rqb_branch_radius: 'var(--rqb-border-radius)',
  rqb_branch_style: 'var(--rqb-border-style)',
};

const varOrder = [
  'rqb_spacing',
  'rqb_border_width',
  'rqb_base_color',
  'rqb_background_color',
  'rqb_border_color',
  'rqb_border_style',
  'rqb_border_radius',
  'rqb_dnd_drop_indicator_color',
  'rqb_dnd_drop_indicator_copy_color',
  'rqb_dnd_drop_indicator_style',
  'rqb_dnd_drop_indicator_width',
  'rqb_branch_indent',
  'rqb_branch_width',
  'rqb_branch_color',
  'rqb_branch_radius',
  'rqb_branch_style',
] satisfies (keyof typeof VAR_DEFAULTS)[];

const name2cssvar = (n: string, prefix = '--') => `${prefix}${n.replaceAll('_', '-')}`;

const VarInput = ({
  varName,
  defaultValue,
  value,
  setter,
}: {
  varName: string;
  defaultValue: string;
  value: string;
  setter: (s: string) => void;
}) => (
  <>
    <label style={{ whiteSpace: 'nowrap' }} htmlFor={varName}>
      <code>{varName}</code>
    </label>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <input
        id={varName}
        type="text"
        value={value}
        onChange={e => {
          document.documentElement.style.setProperty(varName, e.target.value);
          setter(e.target.value);
        }}
      />
      <button
        type="button"
        title={`Reset ${varName} to default value "${value}"`}
        onClick={() => {
          (document.querySelector(`#${varName}`) as HTMLInputElement).value = defaultValue;
          document.documentElement.style.setProperty(varName, defaultValue);
          setter(defaultValue);
        }}>
        ↺
      </button>
    </div>
  </>
);
type State = typeof VAR_DEFAULTS;
type Action = { type: keyof State | 'reset'; value?: string };

const reducer = (state: State, action: Action): State =>
  action.type === 'reset'
    ? { ...VAR_DEFAULTS }
    : {
        ...state,
        [action.type]: action.value,
      };
export const ThemeBuilder = () => {
  const [state, dispatch] = React.useReducer(reducer, VAR_DEFAULTS);
  const [layoutOnly, setLayoutOnly] = React.useState(false);

  const resetAll = () => {
    for (const [key, value] of Object.entries(VAR_DEFAULTS)) {
      document.documentElement.style.setProperty(name2cssvar(key), value);
    }
    dispatch({ type: 'reset' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', columnGap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '0.5fr 1fr', columnGap: '1rem' }}>
        {varOrder.map(v => (
          <VarInput
            key={v}
            varName={name2cssvar(v)}
            defaultValue={VAR_DEFAULTS[v]}
            value={state[v]}
            setter={(value: string) => dispatch({ type: v, value })}
          />
        ))}
      </div>
      <div style={{ flexGrow: 1 }}>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end',
            marginBottom: '0.5rem',
          }}>
          <label>
            <input
              type="checkbox"
              name="layout-only"
              id="layout-only"
              checked={layoutOnly}
              onChange={() => setLayoutOnly(!layoutOnly)}
            />
            Layout only
          </label>
          <button type="button" onClick={resetAll}>
            Reset all
          </button>
        </div>
        <Tabs>
          <TabItem value="css" label="CSS">
            <CodeBlock language="css">
              {`@import "react-querybuilder/dist/query-builder${layoutOnly ? '-layout' : ''}.css";\n\n:root {\n`}
              {varOrder
                .map(v => ({
                  varName: name2cssvar(v),
                  value: state[v],
                  defaultValue: VAR_DEFAULTS[v],
                }))
                .filter(
                  v =>
                    v.defaultValue !== v.value &&
                    (!layoutOnly ||
                      [
                        '--rqb-spacing',
                        '--rqb-border-width',
                        '--rqb-branch-indent',
                        '--rqb-branch-width',
                      ].includes(v.varName))
                )
                .map(v => `  ${v.varName}: ${v.value};`)
                .join('\n')}
              {'\n}'}
            </CodeBlock>
          </TabItem>
          <TabItem value="scss" label="SCSS">
            <CodeBlock language="scss">
              {`@use "react-querybuilder/dist/query-builder${layoutOnly ? '-layout' : ''}.scss" with {\n`}
              {varOrder
                .map(v => ({
                  varName: name2cssvar(v, '$'),
                  value: state[v],
                  defaultValue: VAR_DEFAULTS[v],
                }))
                .filter(
                  v =>
                    v.defaultValue !== v.value &&
                    (!layoutOnly ||
                      [
                        '$rqb-spacing',
                        '$rqb-border-width',
                        '$rqb-branch-indent',
                        '$rqb-branch-width',
                      ].includes(v.varName))
                )
                .map(v => `  ${v.varName}: ${v.value}`)
                .join(',\n')}
              {'\n};'}
            </CodeBlock>
          </TabItem>
        </Tabs>
      </div>
    </div>
  );
};
