import Details from '@theme/Details';
import type { ReactNode } from 'react';
import { fields } from '../_constants/fields';

interface ImportModalProps {
  heading: string;
  code: string;
  setCode: (code: string) => void;
  error: string;
  loadQueryFromCode: () => void;
  notes: ReactNode;
}

const DefaultValue = ({ value }: { value: string }) => (
  <i style={{ color: 'gray', fontSize: 'smaller' }}>({value})</i>
);

const fieldList = (
  <div className="markdown">
    <p>
      Default input types and value editor types — used when not explicitly specified — are listed
      in parentheses.
    </p>
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
            <td>{f.inputType ?? <DefaultValue value="text" />}</td>
            <td>{(f.valueEditorType as string) ?? <DefaultValue value="text" />}</td>
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
          padding: 'calc(var(--ifm-global-spacing) / 4)',
        }}
        spellCheck={false}
        value={code}
        onChange={e => setCode(e.target.value)}></textarea>
      {notes && <div style={{ fontSize: 'smaller', margin: 'unset' }}>{notes}</div>}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          gap: 'var(--ifm-global-spacing)',
          margin: 'var(--ifm-global-spacing) 0',
        }}>
        <button
          type="button"
          className="button"
          style={{ backgroundColor: 'var(--ifm-color-primary-dark)' }}
          onClick={() => loadQueryFromCode()}>
          {heading}
        </button>
      </div>
      {!!error && <pre>{error}</pre>}
      <Details summary="Available fields">{fieldList}</Details>
    </>
  );
}
