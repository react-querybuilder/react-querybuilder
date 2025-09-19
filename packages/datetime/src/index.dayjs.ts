/**
 * Import from `"@react-querybuilder/datetime/dayjs"` for enhanced date/time support using [Day.js](https://day.js.org/).
 *
 * @module dayjs
 */

import type { RuleProcessor, ValueProcessorByRule } from 'react-querybuilder';
import { getDatetimeJsonLogicOperations } from './getDatetimeJsonLogicOperations';
import { getDatetimeRuleProcessorCEL } from './getDatetimeRuleProcessorCEL';
import { getDatetimeRuleProcessorMongoDBQuery } from './getDatetimeRuleProcessorMongoDBQuery';
import { getDatetimeRuleProcessorNL } from './getDatetimeRuleProcessorNL';
import {
  getDatetimeRuleProcessorSQL,
  getDatetimeValueProcessorANSI,
  getDatetimeValueProcessorMSSQL,
  getDatetimeValueProcessorMySQL,
  getDatetimeValueProcessorOracle,
  getDatetimeValueProcessorPostgreSQL,
} from './getDatetimeRuleProcessorSQL';
import { rqbDateTimeLibraryAPI } from './rqbDateTimeLibraryAPI.dayjs';
import type { RQBJsonLogicDateTimeOperations } from './types';

/**
 * Custom JsonLogic date/time operations using Day.js
 */
export const jsonLogicDateTimeOperations: RQBJsonLogicDateTimeOperations =
  getDatetimeJsonLogicOperations(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "sql" format using Day.js
 */
export const datetimeRuleProcessorSQL: RuleProcessor =
  getDatetimeRuleProcessorSQL(rqbDateTimeLibraryAPI);
/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} value processor for "sql" format ("ansi" preset) using Day.js
 */
export const datetimeValueProcessorANSI: ValueProcessorByRule =
  getDatetimeValueProcessorANSI(rqbDateTimeLibraryAPI);
/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} value processor for "sql" format ("mssql" preset) using Day.js
 */
export const datetimeValueProcessorMSSQL: ValueProcessorByRule =
  getDatetimeValueProcessorMSSQL(rqbDateTimeLibraryAPI);
/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} value processor for "sql" format ("mysql" preset) using Day.js
 */
export const datetimeValueProcessorMySQL: ValueProcessorByRule =
  getDatetimeValueProcessorMySQL(rqbDateTimeLibraryAPI);
/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} value processor for "sql" format ("oracle" preset) using Day.js
 */
export const datetimeValueProcessorOracle: ValueProcessorByRule =
  getDatetimeValueProcessorOracle(rqbDateTimeLibraryAPI);
/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} value processor for "sql" format ("postgresql" preset) using Day.js
 */
export const datetimeValueProcessorPostgreSQL: ValueProcessorByRule =
  getDatetimeValueProcessorPostgreSQL(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "cel" format using Day.js
 */
export const datetimeRuleProcessorCEL: ValueProcessorByRule =
  getDatetimeRuleProcessorCEL(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "mongodb_query" format using Day.js
 */
export const datetimeRuleProcessorMongoDBQuery: ValueProcessorByRule =
  getDatetimeRuleProcessorMongoDBQuery(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "natural_language" format using Day.js
 */
export const datetimeRuleProcessorNL: ValueProcessorByRule =
  getDatetimeRuleProcessorNL(rqbDateTimeLibraryAPI);

export * from './rqbDateTimeLibraryAPI.dayjs';
