import { useColorMode } from '@docusaurus/theme-common';
import type { ReactNode } from 'react';
import React from 'react';
import Modal from 'react-modal';
import { getReactModalStyles } from '../_styles/getReactModalStyles';

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
        onChange={e => setCode(e.target.value)}>
        {code}
      </textarea>
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
    </Modal>
  );
}
