import { useLocation } from '@docusaurus/router';
import type { Location } from 'history';
import type { ChangeEvent } from 'react';
import { useCallback, useId } from 'react';
import { styleNameArray, styleNameMap } from '../_constants';
import type { StyleName } from '../_constants/types';
import CodeSandBoxLogo from './Logo-CodeSandbox';
import StackBlitzLogo from './Logo-StackBlitz';
import styles from './Nav.module.css';

interface NavProps {
  variant: StyleName;
  compressedState?: string;
}

const getLink = ({
  variant,
  compressedState,
  siteLocation,
}: NavProps & { siteLocation: Location }) =>
  `${siteLocation.pathname.replace(RegExp(`\\/(${styleNameArray.join('|')})$`), '')}${
    variant === 'default' ? '' : `/${variant}`
  }${compressedState ? `#s=${compressedState}` : ''}`;

export default function Nav({ variant, compressedState }: NavProps) {
  const slId = useId();
  const siteLocation = useLocation();

  const goToStyle = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) =>
      (location.href = getLink({
        variant: e.target.value as StyleName,
        compressedState,
        siteLocation,
      })),
    [compressedState, siteLocation]
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
        <a
          href={getLink({ variant, compressedState, siteLocation })}
          className={styles.smallerAnchor}
          target="_blank"
          rel="noreferrer">
          Permalink
        </a>
      </div>
      <div className={styles.demoNavStyleLinks}>
        <label htmlFor={slId}>Style library:</label>
        <select name={slId} id={slId} value={variant} onChange={goToStyle}>
          {styleNameArray.map(s => (
            <option key={s} value={s}>
              {styleNameMap[s]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
