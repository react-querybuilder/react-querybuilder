/**
 * Import from `"@react-querybuilder/datetime/jsdate"` for enhanced date/time support using a custom JavaScript `Date`-based library.
 *
 * @module jsdate
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
import { rqbDateTimeLibraryAPI } from './rqbDateTimeLibraryAPI.jsdate';
import type { RQBJsonLogicDateTimeOperations } from './types';

/**
 * Custom JsonLogic date/time operations using JavaScript `Date`.
 */
export const jsonLogicDateTimeOperations: RQBJsonLogicDateTimeOperations =
  getDatetimeJsonLogicOperations(rqbDateTimeLibraryAPI);

/**
 * {@link react-querybuilder!index.formatQuery formatQuery} rule processor for "sql" format using JavaScript `Date`
 */
export const datetimeRuleProcessorSQL: RuleProcessor =
  getDatetimeRuleProcessorSQL(rqbDateTimeLibraryAPI);
/**
 * {@link react-querybuilder!index.formatQuery formatQuery} value processor for "sql" format ("ansi" preset) using JavaScript `Date`
 */
export const datetimeValueProcessorANSI: ValueProcessorByRule =
  getDatetimeValueProcessorANSI(rqbDateTimeLibraryAPI);
/**
 * {@link react-querybuilder!index.formatQuery formatQuery} value processor for "sql" format ("mssql" preset) using JavaScript `Date`
 */
export const datetimeValueProcessorMSSQL: ValueProcessorByRule =
  getDatetimeValueProcessorMSSQL(rqbDateTimeLibraryAPI);
/**
 * {@link react-querybuilder!index.formatQuery formatQuery} value processor for "sql" format ("mysql" preset) using JavaScript `Date`
 */
export const datetimeValueProcessorMySQL: ValueProcessorByRule =
  getDatetimeValueProcessorMySQL(rqbDateTimeLibraryAPI);
/**
 * {@link react-querybuilder!index.formatQuery formatQuery} value processor for "sql" format ("oracle" preset) using JavaScript `Date`
 */
export const datetimeValueProcessorOracle: ValueProcessorByRule =
  getDatetimeValueProcessorOracle(rqbDateTimeLibraryAPI);
/**
 * {@link react-querybuilder!index.formatQuery formatQuery} value processor for "sql" format ("postgresql" preset) using JavaScript `Date`
 */
export const datetimeValueProcessorPostgreSQL: ValueProcessorByRule =
  getDatetimeValueProcessorPostgreSQL(rqbDateTimeLibraryAPI);

/**
 * {@link react-querybuilder!index.formatQuery formatQuery} rule processor for "cel" format using JavaScript `Date`
 */
export const datetimeRuleProcessorCEL: RuleProcessor =
  getDatetimeRuleProcessorCEL(rqbDateTimeLibraryAPI);

/**
 * {@link react-querybuilder!index.formatQuery formatQuery} rule processor for "mongodb_query" format using JavaScript `Date`
 */
export const datetimeRuleProcessorMongoDBQuery: RuleProcessor =
  getDatetimeRuleProcessorMongoDBQuery(rqbDateTimeLibraryAPI);

/**
 * {@link react-querybuilder!index.formatQuery formatQuery} rule processor for "natural_language" format using JavaScript `Date`
 */
export const datetimeRuleProcessorNL: ValueProcessorByRule =
  getDatetimeRuleProcessorNL(rqbDateTimeLibraryAPI);

export * from './rqbDateTimeLibraryAPI.jsdate';
