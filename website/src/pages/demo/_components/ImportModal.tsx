import { useColorMode } from '@docusaurus/theme-common';
import type { ReactNode } from 'react';
import { Fragment } from 'react';
import Modal from 'react-modal';
import { fields } from '../_constants/fields';
import { getReactModalStyles } from '../_styles/getReactModalStyles';

const bodyElement = document.body;

interface ImportModalProps {
  heading: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  code: string;
  setCode: (code: string) => void;
  error: string;
  loadQueryFromCode: () => void;
  notes: ReactNode;
}

const fieldList = (
  <div>
    {fields.map((f, i) => (
      <Fragment key={i}>
        {i > 0 ? ', ' : ''}
        <code key={f.name}>{f.name}</code>
      </Fragment>
    ))}
  </div>
);

export default function ImportModal({
  heading,
  isOpen,
  setIsOpen,
  code,
  setCode,
  error,
  loadQueryFromCode,
  notes,
}: ImportModalProps) {
  const { colorMode } = useColorMode();
  return (
    <Modal
      appElement={bodyElement}
      contentLabel={heading}
      isOpen={isOpen}
      onRequestClose={() => setIsOpen(false)}
      style={getReactModalStyles(colorMode === 'dark')}>
      <h3 style={{ margin: 'unset' }}>
        {heading}
        <span style={{ cursor: 'pointer', float: 'right' }} onClick={() => setIsOpen(false)}>
          ✕
        </span>
      </h3>
      <textarea
        style={{ height: 160, minWidth: 690, width: '100%' }}
        spellCheck={false}
        value={code}
        onChange={e => setCode(e.target.value)}></textarea>
      {notes && <p style={{ fontSize: 'smaller', margin: 'unset' }}>{notes}</p>}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 'var(--ifm-global-spacing)',
        }}>
        <button type="button" onClick={() => loadQueryFromCode()}>
          {heading}
        </button>
        <button type="button" onClick={() => setIsOpen(false)}>
          Cancel
        </button>
      </div>
      {!!error && <pre>{error}</pre>}
      <details>
        <summary style={{ cursor: 'pointer' }}>Available fields</summary>
        {fieldList}
      </details>
    </Modal>
  );
}
