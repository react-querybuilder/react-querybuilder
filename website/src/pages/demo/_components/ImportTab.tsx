import Details from '@theme/Details';
import type { ReactNode } from 'react';
import { Fragment } from 'react';
import { fields } from '../_constants/fields';

interface ImportModalProps {
  heading: string;
  code: string;
  setCode: (code: string) => void;
  error: string;
  loadQueryFromCode: () => void;
  notes: ReactNode;
}

const fieldList = (
  <div>
    {fields.map((f, i) => (
      <Fragment key={f.name}>
        {i > 0 ? ', ' : ''}
        <code key={f.name}>{f.name}</code>
      </Fragment>
    ))}
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
        style={{ height: 160, minWidth: 690, width: '100%' }}
        spellCheck={false}
        value={code}
        onChange={e => setCode(e.target.value)}></textarea>
      {notes && <p style={{ fontSize: 'smaller', margin: 'unset' }}>{notes}</p>}
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
