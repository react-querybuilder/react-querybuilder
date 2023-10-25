import { useLocation } from '@docusaurus/router';
import { styleNameArray, styleNameMap } from '../_constants';
import type { StyleName } from '../_constants/types';
import CodeSandBoxLogo from './Logo-CodeSandbox';
import StackBlitzLogo from './Logo-StackBlitz';
import styles from './Nav.module.css';

interface NavProps {
  variant: StyleName;
  compressedState?: string;
}

export default function Nav({ variant, compressedState }: NavProps) {
  const siteLocation = useLocation();

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
