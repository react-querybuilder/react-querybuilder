/**
 * Import from `"@react-querybuilder/datetime/date-fns"` for enhanced date/time support using [date-fns](https://date-fns.org/).
 *
 * @module date-fns
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
import { rqbDateTimeLibraryAPI } from './rqbDateTimeLibraryAPI.date-fns';
import type { RQBJsonLogicDateTimeOperations } from './types';

/**
 * Custom JsonLogic date/time operations using date-fns
 */
export const jsonLogicDateTimeOperations: RQBJsonLogicDateTimeOperations =
  getDatetimeJsonLogicOperations(rqbDateTimeLibraryAPI);

/**
 * {@link react-querybuilder!index.formatQuery formatQuery} rule processor for "sql" format using date-fns
 */
export const datetimeRuleProcessorSQL: RuleProcessor =
  getDatetimeRuleProcessorSQL(rqbDateTimeLibraryAPI);
/**
 * {@link react-querybuilder!index.formatQuery formatQuery} value processor for "sql" format ("ansi" preset) using date-fns
 */
export const datetimeValueProcessorANSI: ValueProcessorByRule =
  getDatetimeValueProcessorANSI(rqbDateTimeLibraryAPI);
/**
 * {@link react-querybuilder!index.formatQuery formatQuery} value processor for "sql" format ("mssql" preset) using date-fns
 */
export const datetimeValueProcessorMSSQL: ValueProcessorByRule =
  getDatetimeValueProcessorMSSQL(rqbDateTimeLibraryAPI);
/**
 * {@link react-querybuilder!index.formatQuery formatQuery} value processor for "sql" format ("mysql" preset) using date-fns
 */
export const datetimeValueProcessorMySQL: ValueProcessorByRule =
  getDatetimeValueProcessorMySQL(rqbDateTimeLibraryAPI);
/**
 * {@link react-querybuilder!index.formatQuery formatQuery} value processor for "sql" format ("oracle" preset) using date-fns
 */
export const datetimeValueProcessorOracle: ValueProcessorByRule =
  getDatetimeValueProcessorOracle(rqbDateTimeLibraryAPI);
/**
 * {@link react-querybuilder!index.formatQuery formatQuery} value processor for "sql" format ("postgresql" preset) using date-fns
 */
export const datetimeValueProcessorPostgreSQL: ValueProcessorByRule =
  getDatetimeValueProcessorPostgreSQL(rqbDateTimeLibraryAPI);

/**
 * {@link react-querybuilder!index.formatQuery formatQuery} rule processor for "cel" format using date-fns
 */
export const datetimeRuleProcessorCEL: ValueProcessorByRule =
  getDatetimeRuleProcessorCEL(rqbDateTimeLibraryAPI);

/**
 * {@link react-querybuilder!index.formatQuery formatQuery} rule processor for "mongodb_query" format using date-fns
 */
export const datetimeRuleProcessorMongoDBQuery: ValueProcessorByRule =
  getDatetimeRuleProcessorMongoDBQuery(rqbDateTimeLibraryAPI);

/**
 * {@link react-querybuilder!index.formatQuery formatQuery} rule processor for "natural_language" format using date-fns
 */
export const datetimeRuleProcessorNL: ValueProcessorByRule =
  getDatetimeRuleProcessorNL(rqbDateTimeLibraryAPI);

export * from './rqbDateTimeLibraryAPI.date-fns';
