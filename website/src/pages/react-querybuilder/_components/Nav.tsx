import React from 'react';
import type { StyleName } from '../_constants/types';
import CodeSandBoxLogo from './Logo-CodeSandbox';
import StackBlitzLogo from './Logo-StackBlitz';
import StyleLinks from './StyleLinks';

interface NavProps {
  variant: StyleName;
  compressedState?: string;
}

export default function Nav({ variant, compressedState }: NavProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', gap: 'var(--ifm-global-spacing)' }}>
        {variant !== 'default' && (
          <a
            href={`https://www.npmjs.com/package/@react-querybuilder/${variant}`}
            target="_blank"
            rel="noreferrer">
            @react-querybuilder/{variant}
          </a>
        )}
        <a
          href={`https://codesandbox.io/s/github/react-querybuilder/react-querybuilder/tree/main/examples/${
            variant === 'default' ? 'basic-ts' : variant
          }?file=/src/App.tsx`}
          className="svg-font-color"
          target="_blank"
          rel="noreferrer"
          style={{ minWidth: '1rem' }}>
          <CodeSandBoxLogo />
        </a>
        <a
          href={`https://stackblitz.com/github/react-querybuilder/react-querybuilder/tree/main/examples/${
            variant === 'default' ? 'basic-ts' : variant
          }?file=src/App.tsx`}
          className="svg-font-color"
          target="_blank"
          rel="noreferrer"
          style={{ minWidth: '1rem' }}>
          <StackBlitzLogo />
        </a>
      </div>
      <StyleLinks variant={variant} compressedState={compressedState} />
    </div>
  );
}
