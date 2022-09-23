import { useLocation } from '@docusaurus/router';
import React from 'react';
import { styleNameArray, styleNameMap } from './_constants';

interface StyleLinksProps {
  variant: string;
  compressedState?: string;
}

export default function StyleLinks({ variant, compressedState }: StyleLinksProps) {
  const siteLocation = useLocation();

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        columnGap: 'var(--ifm-global-spacing)',
      }}>
      <strong>Compatibility:</strong>
      {styleNameArray.map(s => {
        if (variant === s) return <span key={s}>{styleNameMap[s]}</span>;

        const link = `${siteLocation.pathname.replace(RegExp(`\\/${variant}$`), '')}${
          s === 'default' ? '' : `/${s}`
        }${compressedState ? `#s=${compressedState}` : ''}`;

        return (
          <a key={s} href={link}>
            {styleNameMap[s]}
          </a>
        );
      })}
    </div>
  );
}
