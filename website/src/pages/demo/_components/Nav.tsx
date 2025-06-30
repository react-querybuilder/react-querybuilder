import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import type { Location } from 'history';
import { useCallback, useId, useState } from 'react';
import { styleNameArray, styleNameMap } from '../_constants';
import type { StyleName } from '../_constants/types';
import CodeSandboxLogo from './Logo-CodeSandbox';
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
  `${siteLocation.pathname.replace(new RegExp(`\\/(${styleNameArray.join('|')})$`), '')}${
    variant === 'default' ? '' : `/${variant}`
  }${siteLocation.search ?? ''}${compressedState ? `#s=${compressedState}` : ''}`;

const goToLink = (link: string) => {
  location.href = link;
};

export default function Nav({ variant, compressedState }: NavProps) {
  const slId = useId();
  const siteLocation = useLocation();
  const [copyPermalinkStatus, setCopyPermalinkStatus] = useState('');

  const goToStyle = useCallback(
    (variant: StyleName) => {
      goToLink(
        getLink({
          variant,
          compressedState,
          siteLocation,
        })
      );
    },
    [compressedState, siteLocation]
  );

  const onClickCopyPermalink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${location.origin}${siteLocation.pathname}${siteLocation.search}#s=${compressedState}`
      );
      setCopyPermalinkStatus('✓');
    } catch (e) {
      console.error('Clipboard error', e);
      setCopyPermalinkStatus('☹ Clipboard error!');
    }
    setTimeout(() => setCopyPermalinkStatus(''), 1214);
  };

  return (
    <div className={styles.demoNav}>
      <div className={styles.demoNavPackageLinks}>
        <Link
          href={`/sandbox?t=${variant === 'default' ? 'basic-ts' : variant}&p=codesandbox`}
          className="svg-font-color"
          target="_blank"
          rel="noreferrer"
          style={{ minWidth: '1rem' }}>
          <CodeSandboxLogo />
        </Link>
        <Link
          href={`/sandbox?t=${variant === 'default' ? 'basic-ts' : variant}&p=stackblitz`}
          className="svg-font-color"
          target="_blank"
          rel="noreferrer"
          style={{ minWidth: '1rem' }}>
          <StackBlitzLogo />
        </Link>
        <div className={styles.demoNavPermalink}>
          <a
            href={getLink({ variant, compressedState, siteLocation })}
            className={styles.smallerAnchor}
            target="_blank"
            rel="noreferrer">
            Permalink
          </a>
          <span
            className={styles.demoNavPermalinkCopy}
            onClick={onClickCopyPermalink}
            title="Copy permalink">
            ⧉
          </span>
          <span>{copyPermalinkStatus}</span>
        </div>
      </div>
      <div className={styles.demoNavStyleLinks}>
        <label htmlFor={slId}>Style library</label>
        <select
          name={slId}
          id={slId}
          value={variant}
          onChange={e => goToStyle(e.target.value as StyleName)}>
          {styleNameArray.map(s => (
            <option key={s} value={s}>
              {styleNameMap[s]}
            </option>
          ))}
        </select>
      </div>
      <nav className={styles.demoNavStyleTOC}>
        <ul className="table-of-contents">
          <li>
            Style library
            <ul>
              {styleNameArray.map(s => (
                <li key={s}>
                  <Link
                    href="#"
                    onClick={() => goToStyle(s)}
                    className={`table-of-contents__link toc-highlight ${s === variant ? 'table-of-contents__link--active' : ''}`}>
                    {styleNameMap[s]}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
}
