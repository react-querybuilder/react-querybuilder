import type { Field, RuleGroupType } from 'react-querybuilder';
import { rqbDateTimeLibraryAPI as rqbDateTimeLibraryAPIDateFns } from './rqbDateTimeLibraryAPI.date-fns';
import { rqbDateTimeLibraryAPI as rqbDateTimeLibraryAPIDayjs } from './rqbDateTimeLibraryAPI.dayjs';
import { rqbDateTimeLibraryAPI as rqbDateTimeLibraryAPIJS } from './rqbDateTimeLibraryAPI.jsdate';
import { rqbDateTimeLibraryAPI as rqbDateTimeLibraryAPILuxon } from './rqbDateTimeLibraryAPI.luxon';
import type { RQBDateTimeLibraryAPI } from './types';

export const dateLibraryFunctions: [string, RQBDateTimeLibraryAPI][] = [
  ['Day.js', rqbDateTimeLibraryAPIDayjs],
  ['date-fns', rqbDateTimeLibraryAPIDateFns],
  ['Luxon', rqbDateTimeLibraryAPILuxon],
  ['JS Date', rqbDateTimeLibraryAPIJS],
];

export const comparisonDate = '1957-01-01';
export const comparisonDate2 = '1969-01-01';
export const sqlBase = `SELECT * FROM musicians WHERE`;

export const fields: Field[] = [
  { name: 'firstName', label: 'First Name' },
  { name: 'middleName', label: 'Middle Name' },
  { name: 'lastName', label: 'Last Name' },
  { name: 'birthdate', label: 'Birthdate', inputType: 'date', datatype: 'date' },
  {
    name: 'created_at',
    label: 'Created At',
    inputType: 'datetime-local',
    datatype: 'timestamp with time zone',
  },
  {
    name: 'updated_at',
    label: 'Updated At',
    inputType: 'datetime-local',
    datatype: 'timestamp with time zone',
  },
];

export interface Musician {
  first_name: string;
  middle_name: string | null | undefined;
  last_name: string;
  birthdate: string;
}

export interface MusicianRecord extends Musician {
  created_at: string;
  updated_at: string;
}

export const musicians: Musician[] = [
  {
    first_name: 'Steve',
    middle_name: undefined,
    last_name: 'Vai',
    birthdate: '1960-06-06',
  },
  {
    first_name: 'Stevie',
    middle_name: 'Ray',
    last_name: 'Vaughan',
    birthdate: '1954-10-03',
  },
];

export const FIND_MUSICIANS_TABLE = (platform: string): string =>
  ({
    sqlite: `SELECT * FROM sqlite_master WHERE type = 'table' AND name = 'musicians'`,
    postgresql: `SELECT * FROM pg_tables WHERE tablename = 'musicians'`,
  })[platform]!;

export function CREATE_MUSICIANS_TABLE(platform: 'jsonlogic' | 'cel' | 'jsonata'): MusicianRecord[];
export function CREATE_MUSICIANS_TABLE(platform: 'sqlite' | 'postgresql'): string;
export function CREATE_MUSICIANS_TABLE(
  platform: 'sqlite' | 'postgresql' | 'jsonlogic' | 'cel' | 'jsonata'
): string | MusicianRecord[] {
  if (platform === 'jsonlogic' || platform === 'cel' || platform === 'jsonata') {
    const now = new Date().toISOString();
    return musicians.map<MusicianRecord>(musician => ({
      ...musician,
      created_at: now,
      updated_at: now,
    }));
  }

  const dateType = { sqlite: 'text', postgresql: 'date' }[platform];
  const timestampType = { sqlite: 'text', postgresql: 'timestamp with time zone' }[platform];
  return `CREATE TABLE musicians (
    first_name text NOT NULL,
    middle_name text,
    last_name text NOT NULL,
    birthdate ${dateType} NOT NULL,
    created_at ${timestampType} NOT NULL,
    updated_at ${timestampType} NOT NULL,
    PRIMARY KEY (first_name, last_name))`;
}

export const INSERT_MUSICIANS = (platform: string): string => {
  const now = {
    sqlite: `replace(datetime('now'), ' ', 'T') || 'Z'`,
    postgresql: 'current_timestamp',
  }[platform];
  return musicians
    .map(
      musician =>
        `INSERT INTO musicians (first_name, middle_name, last_name, birthdate, created_at, updated_at)
VALUES ('${musician.first_name}', '${musician.middle_name}', '${musician.last_name}', '${musician.birthdate}', ${now}, ${now})`
    )
    .join(';\n');
};

export const testCases: Record<string, [RuleGroupType, string]> = {
  basic: [
    {
      combinator: 'and',
      rules: [
        { field: 'birthdate', operator: '>', value: comparisonDate },
        { field: 'birthdate', operator: 'between', value: [comparisonDate, comparisonDate2] },
      ],
    },
    'Vai',
  ],
  timestamp: [
    {
      combinator: 'and',
      rules: [{ field: 'created_at', operator: '>', value: comparisonDate }],
    },
    'all',
  ],
};
