import type { SQLPreset } from 'react-querybuilder';
import type {
  RelativeDateTimeTruncationUnit,
  RelativeDateTimeUnit,
  RelativeDateTimeValue,
} from './types';

/**
 * Parsed form of a {@link RelativeDateTimeValue} anchor: either the current
 * date/time (`now`) or a truncation to the start/end of a calendar period.
 */
interface ParsedAnchor {
  bound: 'now' | 'start' | 'end';
  unit?: RelativeDateTimeTruncationUnit;
}

const parseAnchor = (anchor: RelativeDateTimeValue['anchor']): ParsedAnchor => {
  if (anchor === 'now') return { bound: 'now' };
  const match = /^(start|end)Of(Day|Week|Month|Year)$/.exec(anchor)!;
  return {
    bound: match[1] as 'start' | 'end',
    unit: match[2].toLowerCase() as ParsedAnchor['unit'],
  };
};

/**
 * A relative-date/time SQL expression builder for a single dialect. Produces a
 * symbolic expression (e.g. `current_date - interval '3 months'`) so the value
 * stays relative to query-execution time rather than being materialized.
 */
type RelativeSQLBuilder = (value: RelativeDateTimeValue, asDate: boolean) => string;

const pluralUnit = (unit: RelativeDateTimeUnit): string => `${unit}s`;

// --- PostgreSQL / ANSI ------------------------------------------------------

const pgBuild: RelativeSQLBuilder = (value, asDate) => {
  const now = asDate ? 'current_date' : 'current_timestamp';
  const { bound, unit } = parseAnchor(value.anchor);

  let expr = now;
  let modified = false;

  if (bound === 'start' && unit) {
    expr = `date_trunc('${unit}', ${now})`;
    modified = true;
  } else if (bound === 'end' && unit) {
    const tail = asDate ? `interval '1 day'` : `interval '1 microsecond'`;
    expr = `date_trunc('${unit}', ${now}) + interval '1 ${unit}' - ${tail}`;
    modified = true;
  }

  if (value.offset) {
    const op = value.offset < 0 ? '-' : '+';
    expr = `${expr} ${op} interval '${Math.abs(value.offset)} ${pluralUnit(value.unit)}'`;
    modified = true;
  }

  return asDate && modified ? `cast(${expr} as date)` : expr;
};

// --- MySQL ------------------------------------------------------------------

const mysqlTrunc = (now: string, bound: 'start' | 'end', unit: RelativeDateTimeTruncationUnit) => {
  if (bound === 'start') {
    switch (unit) {
      case 'day':
        return `date(${now})`;
      case 'week':
        return `date_sub(date(${now}), interval dayofweek(${now}) - 1 day)`;
      case 'month':
        return `date_format(${now}, '%Y-%m-01')`;
      case 'year':
        return `date_format(${now}, '%Y-01-01')`;
    }
  }
  switch (unit) {
    case 'day':
      return `date(${now})`;
    case 'week':
      return `date_add(date(${now}), interval 7 - dayofweek(${now}) day)`;
    case 'month':
      return `last_day(${now})`;
  }
  // year
  return `date_format(${now}, '%Y-12-31')`;
};

const mysqlBuild: RelativeSQLBuilder = (value, asDate) => {
  const now = asDate ? 'curdate()' : 'now()';
  const { bound, unit } = parseAnchor(value.anchor);

  let expr = now;
  if (bound !== 'now' && unit) {
    expr = mysqlTrunc(now, bound, unit);
  }

  if (value.offset) {
    const fn = value.offset < 0 ? 'date_sub' : 'date_add';
    expr = `${fn}(${expr}, interval ${Math.abs(value.offset)} ${value.unit})`;
  }

  return expr;
};

// --- MSSQL ------------------------------------------------------------------

const mssqlTrunc = (now: string, bound: 'start' | 'end', unit: RelativeDateTimeTruncationUnit) => {
  // datediff/dateadd truncation: number of <unit> since epoch 0, re-added to 0.
  const start = `dateadd(${unit}, datediff(${unit}, 0, ${now}), 0)`;
  if (bound === 'start') return start;
  // End = start of next period minus 1 day (date) — callers cast as needed.
  return `dateadd(day, -1, dateadd(${unit}, datediff(${unit}, 0, ${now}) + 1, 0))`;
};

const mssqlBuild: RelativeSQLBuilder = (value, asDate) => {
  const now = asDate ? 'cast(getdate() as date)' : 'getdate()';
  const { bound, unit } = parseAnchor(value.anchor);

  let expr = now;
  if (bound !== 'now' && unit) {
    expr = mssqlTrunc(now, bound, unit);
  }

  if (value.offset) {
    expr = `dateadd(${value.unit}, ${value.offset}, ${expr})`;
  }

  return expr;
};

// --- Oracle -----------------------------------------------------------------

const oracleTruncFormat: Record<RelativeDateTimeTruncationUnit, string> = {
  day: 'DDD',
  week: 'IW',
  month: 'MM',
  year: 'YYYY',
};

const oracleBuild: RelativeSQLBuilder = (value, asDate) => {
  const now = asDate ? 'trunc(sysdate)' : 'systimestamp';
  const { bound, unit } = parseAnchor(value.anchor);

  let expr = now;
  // When true, the end boundary's sub-second step-back is deferred until after
  // any offset is applied (subtraction commutes with the additive offset), so
  // precision survives the intermediate DATE arithmetic.
  let endTimestampStepBack = false;
  if (bound !== 'now' && unit) {
    const start = `trunc(${now}, '${oracleTruncFormat[unit]}')`;
    if (bound === 'start') {
      expr = start;
    } else {
      // End = next period start, stepped back to the last instant. Oracle's DATE
      // always carries a time component (no time-less date type), so even
      // date-typed columns can hold intraday values; landing on the last instant
      // avoids excluding them, unlike stepping back a full day to midnight.
      const next =
        unit === 'month' || unit === 'year'
          ? `add_months(${start}, ${unit === 'month' ? 1 : 12})`
          : `${start} + interval '1' day${unit === 'week' ? ' * 7' : ''}`;
      if (asDate) {
        // DATE has only second precision; one second is the smallest step.
        expr = `${next} - interval '1' second`;
      } else {
        // TIMESTAMP: defer cast + 1ms step-back until after offset (see below).
        expr = next;
        endTimestampStepBack = true;
      }
    }
  }

  if (value.offset) {
    if (value.unit === 'month' || value.unit === 'year') {
      expr = `add_months(${expr}, ${value.offset * (value.unit === 'year' ? 12 : 1)})`;
    } else {
      const days = { day: 1, week: 7 }[value.unit as 'day' | 'week'];
      expr = days
        ? `${expr} ${value.offset < 0 ? '-' : '+'} ${Math.abs(value.offset) * days}`
        : `${expr} + numtodsinterval(${value.offset}, '${value.unit.toUpperCase()}')`;
    }
  }

  // TRUNC/DATE arithmetic above is second-granular, so cast to TIMESTAMP and
  // step back one millisecond to reach the period's true last instant (matches
  // the materialized JS value, e.g. 23:59:59.999).
  if (endTimestampStepBack) {
    expr = `cast(${expr} as timestamp) - numtodsinterval(0.001, 'second')`;
  }

  return expr;
};

// --- SQLite -----------------------------------------------------------------

const sqliteStartModifier: Record<RelativeDateTimeTruncationUnit, string> = {
  day: `'start of day'`,
  week: `'weekday 0', '-7 days'`,
  month: `'start of month'`,
  year: `'start of year'`,
};

const sqliteBuild: RelativeSQLBuilder = (value, asDate) => {
  const fn = asDate ? 'date' : 'datetime';
  const args: string[] = [`'now'`];
  const { bound, unit } = parseAnchor(value.anchor);

  if (bound !== 'now' && unit) {
    if (bound === 'start') {
      args.push(sqliteStartModifier[unit]);
    } else {
      // End = start of next period, minus the smallest representable amount.
      switch (unit) {
        case 'day':
          args.push(`'start of day'`, `'+1 day'`, asDate ? `'-1 day'` : `'-1 second'`);
          break;
        case 'week':
          args.push(`'weekday 0'`, asDate ? `'-1 day'` : `'-1 second'`);
          break;
        case 'month':
          args.push(`'start of month'`, `'+1 month'`, asDate ? `'-1 day'` : `'-1 second'`);
          break;
        case 'year':
          args.push(`'start of year'`, `'+1 year'`, asDate ? `'-1 day'` : `'-1 second'`);
          break;
      }
    }
  }

  if (value.offset) {
    const sign = value.offset < 0 ? '-' : '+';
    args.push(`'${sign}${Math.abs(value.offset)} ${pluralUnit(value.unit)}'`);
  }

  return `${fn}(${args.join(', ')})`;
};

const presetToRelativeBuilderMap = {
  ansi: pgBuild,
  mssql: mssqlBuild,
  mysql: mysqlBuild,
  oracle: oracleBuild,
  postgresql: pgBuild,
  sqlite: sqliteBuild,
} satisfies Record<SQLPreset, RelativeSQLBuilder>;

/**
 * Determines whether the SQL expression for a relative date/time should be a
 * date (vs. a timestamp/datetime) based on the field's declared `datatype` and
 * the SQL dialect. Mirrors the per-dialect logic used for literal date values.
 */
const isDateGranularity = (preset: SQLPreset, datatype: unknown): boolean => {
  const dt = datatype as string;
  switch (preset) {
    case 'mssql':
      return !/^(?:small)?datetime/i.test(dt);
    case 'mysql':
      return !/^(?:datetime|timestamp)/i.test(dt);
    case 'oracle':
    case 'postgresql':
      return !/^timestamp/i.test(dt);
    default:
      // ansi/sqlite: anything not explicitly a datetime/timestamp is date-only.
      return !/^(?:datetime|timestamp)/i.test(dt);
  }
};

/**
 * Builds a dialect-specific symbolic SQL expression for a {@link RelativeDateTimeValue}.
 */
export const getRelativeDateTimeSQL = (
  value: RelativeDateTimeValue,
  preset: SQLPreset,
  datatype: unknown
): string => presetToRelativeBuilderMap[preset](value, isDateGranularity(preset, datatype));
