import { Callout } from '@rspress/core/theme';
import { fields } from '@site/src/demo/constants/fields';
import type { ReactNode } from 'react';

interface ImportModalProps {
  heading: string;
  code: string;
  setCode: (code: string) => void;
  error: string;
  loadQueryFromCode: () => void;
  notes: ReactNode;
}

const fieldList = (
  <div className="rp-doc">
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Label</th>
          <th>Input Type</th>
          <th>Value Editor Type</th>
        </tr>
      </thead>
      <tbody>
        {fields.map(f => (
          <tr key={f.name}>
            <td>
              <code>{f.name}</code>
            </td>
            <td>{f.label}</td>
            <td>{f.inputType}</td>
            <td>{f.valueEditorType as string}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function ImportTab({
  heading,
  code,
  setCode,
  error,
  loadQueryFromCode,
  notes,
}: ImportModalProps) {
  return (
    <>
      <textarea
        style={{
          height: 160,
          minWidth: 690,
          width: '100%',
          borderRadius: 'var(--rp-radius)',
          border: '1px solid gray',
          padding: 'var(--site-spacing)',
          marginTop: 'var(--site-spacing)',
        }}
        spellCheck={false}
        value={code}
        onChange={e => setCode(e.target.value)}></textarea>
      {notes && <div style={{ fontSize: 'smaller', margin: 'unset' }}>{notes}</div>}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          gap: 'var(--site-spacing)',
          margin: 'var(--site-spacing) 0',
        }}>
        <button
          type="button"
          className="button"
          style={{
            backgroundColor: 'var(--rp-c-brand-dark)',
            color: 'var(--rp-c-text-0)',
            border: 'none',
            borderRadius: 'var(--rp-radius)',
            padding: 'calc(var(--site-spacing) / 2) var(--site-spacing)',
            cursor: 'pointer',
          }}
          onClick={() => loadQueryFromCode()}>
          {heading}
        </button>
      </div>
      {!!error && <pre>{error}</pre>}
      <Callout type="details" title="Available fields">
        {fieldList}
      </Callout>
    </>
  );
}
