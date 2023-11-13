import { NextQueryBuilder } from './NextQueryBuilder';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <NextQueryBuilder />
    </main>
  );
}
