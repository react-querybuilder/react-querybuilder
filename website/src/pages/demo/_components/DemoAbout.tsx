import Link from '@docusaurus/Link';
import { optionsMetadata } from '../_constants';
import styles from './Nav.module.css';

export const demoAboutId = 'demo-about';

interface DemoAboutProps {
  open: boolean;
  onToggle: (open: boolean) => void;
}

export default function DemoAbout({ open, onToggle }: DemoAboutProps) {
  return (
    <details
      id={demoAboutId}
      className={styles.demoAbout}
      open={open}
      onToggle={e => onToggle(e.currentTarget.open)}>
      <summary>About this demo</summary>
      <p>
        A fully interactive <code>QueryBuilder</code>. Toggle options on the left to see their
        effect on the builder and the generated code. Export, import, and theme the query in the
        tabs below. Hover/click ⓘ icons for details and documentation. Use the permalink to share
        the current state.
      </p>
      <p>
        <strong>Defaults:</strong> Options match base <code>QueryBuilder</code> defaults except{' '}
        <Link href={optionsMetadata.inferOperators.link}>
          <em>{optionsMetadata.inferOperators.label}</em>
        </Link>{' '}
        (marked <strong>*</strong>), which is enabled here so each field shows operators suited to
        its datatype. "Reset to defaults" restores the demo defaults.
      </p>
      <p>
        <strong>Fields</strong>
      </p>
      <dl>
        <dt>First Name, Last Name, Age, Height, Job</dt>
        <dd>
          Text/number inputs with a <code>validator</code> (enable "Use validation"). Last Name sets{' '}
          <code>defaultOperator</code>; Height and Job use SQL-style datatypes.
        </dd>
        <dt>Is a musician, Gender, Description</dt>
        <dd>Checkbox, radio, and textarea value editors.</dd>
        <dt>Primary instrument, Also plays</dt>
        <dd>
          Select/multiselect editors with grouped options. Primary instrument has no{' '}
          <code>defaultValue</code> (uncheck "Auto-select value" to see the effect).
        </dd>
        <dt>Tour stops</dt>
        <dd>
          <Link href="/docs/tips/subqueries">Match modes</Link> with <code>subproperties</code> for
          filtering arrays of objects.
        </dd>
        <dt>Birth Date, Show Time, Daily Alarm</dt>
        <dd>Date, datetime, and time inputs (see also "Use date/time package").</dd>
        <dt>Big Int</dt>
        <dd>
          <code>bigint</code> values.
        </dd>
        <dt>Grouped Field 1–4</dt>
        <dd>
          Value source "field" with a <code>comparator</code>, limiting right-hand field options to
          the same group.
        </dd>
      </dl>
    </details>
  );
}
