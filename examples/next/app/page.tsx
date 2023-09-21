import styles from './page.module.css'
import { NextQueryBuilder } from './NextQueryBuilder'

export default function Home() {
  return (
    <main className={styles.main}>
      <NextQueryBuilder />
    </main>
  )
}
