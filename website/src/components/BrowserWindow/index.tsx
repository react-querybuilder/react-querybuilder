import { clsx } from 'clsx';
import { type ReactNode } from 'react';

import styles from './styles.module.css';

interface BrowserWindowProps {
  children: ReactNode;
  minHeight: number;
  url: string;
}

export const BrowserWindow = ({
  children,
  minHeight,
  url = 'https://example.com',
}: BrowserWindowProps) => {
  return (
    <div className={styles.browserWindow} style={{ minHeight }}>
      <div className={styles.browserWindowHeader}>
        <div className={styles.buttons}>
          <span className={styles.dot} style={{ background: '#f25f58' }} />
          <span className={styles.dot} style={{ background: '#fbbe3c' }} />
          <span className={styles.dot} style={{ background: '#58cb42' }} />
        </div>
        <div className={clsx(styles.browserWindowAddressBar, 'text--truncate')}>{url}</div>
        <div className={styles.browserWindowMenuIcon}>
          <div>
            <span className={styles.bar} />
            <span className={styles.bar} />
            <span className={styles.bar} />
          </div>
        </div>
      </div>

      <div className={styles.browserWindowBody}>{children}</div>
    </div>
  );
};
