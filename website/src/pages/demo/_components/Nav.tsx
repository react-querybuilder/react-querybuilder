import { useLocation } from '@docusaurus/router';
import React, { Fragment, useMemo } from 'react';
import { styleNameArray, styleNameMap } from '../_constants';
import type { StyleName } from '../_constants/types';
import CodeSandBoxLogo from './Logo-CodeSandbox';
import StackBlitzLogo from './Logo-StackBlitz';
import styles from './Nav.module.css';

interface NavProps {
  variant: StyleName;
  compressedState?: string;
  dnd?: boolean;
}

export default function Nav({ variant, compressedState, dnd }: NavProps) {
  const siteLocation = useLocation();

  const packageNames = useMemo(
    () => [
      'react-querybuilder',
      ...(variant === 'default' ? [] : [`@react-querybuilder/${variant}`]),
      ...(dnd ? ['@react-querybuilder/dnd'] : []),
    ],
    [dnd, variant]
  );

  return (
    <div className={styles.demoNav}>
      <div className={styles.demoNavPackageLinks}>
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
        <span>
          {packageNames.map((packageName, idx) => (
            <Fragment key={packageName}>
              {idx > 0 ? ', ' : null}
              <a
                href={`https://www.npmjs.com/package/${packageName}`}
                target="_blank"
                rel="noreferrer"
                className={styles.demoNavPackageLink}>
                {packageName}
              </a>
            </Fragment>
          ))}
        </span>
      </div>
      <div className={styles.demoNavStyleLinks}>
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
    </div>
  );
}
