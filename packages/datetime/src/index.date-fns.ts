/**
 * Import from `"@react-querybuilder/datetime/date-fns"` for enhanced date/time support using [date-fns](https://date-fns.org/).
 *
 * @module date-fns
 */

import type { RuleProcessor, ValueProcessorByRule } from 'react-querybuilder';
import { getDatetimeJsonLogicOperations } from './getDatetimeJsonLogicOperations';
import { getDatetimeRuleProcessorCEL } from './getDatetimeRuleProcessorCEL';
import { getDatetimeRuleProcessorCypher } from './getDatetimeRuleProcessorCypher';
import { getDatetimeRuleProcessorDrizzle } from './getDatetimeRuleProcessorDrizzle';
import { getDatetimeRuleProcessorGremlin } from './getDatetimeRuleProcessorGremlin';
import { getDatetimeRuleProcessorJSONata } from './getDatetimeRuleProcessorJSONata';
import { getDatetimeRuleProcessorLDAP } from './getDatetimeRuleProcessorLDAP';
import { getDatetimeRuleProcessorMongoDB } from './getDatetimeRuleProcessorMongoDB';
import { getDatetimeRuleProcessorMongoDBQuery } from './getDatetimeRuleProcessorMongoDBQuery';
import { getDatetimeRuleProcessorNL } from './getDatetimeRuleProcessorNL';
import { getDatetimeRuleProcessorParameterized } from './getDatetimeRuleProcessorParameterized';
import { getDatetimeRuleProcessorPrisma } from './getDatetimeRuleProcessorPrisma';
import { getDatetimeRuleProcessorSequelize } from './getDatetimeRuleProcessorSequelize';
import { getDatetimeRuleProcessorSPARQL } from './getDatetimeRuleProcessorSPARQL';
import { getDatetimeRuleProcessorSpEL } from './getDatetimeRuleProcessorSpEL';
import {
  getDatetimeRuleProcessorSQL,
  getDatetimeValueProcessorANSI,
  getDatetimeValueProcessorMSSQL,
  getDatetimeValueProcessorMySQL,
  getDatetimeValueProcessorOracle,
  getDatetimeValueProcessorPostgreSQL,
} from './getDatetimeRuleProcessorSQL';
import { getDatetimeRuleProcessorTanStackDB } from './getDatetimeRuleProcessorTanStackDB';
import { rqbDateTimeLibraryAPI } from './rqbDateTimeLibraryAPI.date-fns';
import type { RQBJsonLogicDateTimeOperations } from './types';

/**
 * Custom JsonLogic date/time operations using date-fns
 */
export const jsonLogicDateTimeOperations: RQBJsonLogicDateTimeOperations =
  getDatetimeJsonLogicOperations(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "sql" format using date-fns
 */
export const datetimeRuleProcessorSQL: RuleProcessor =
  getDatetimeRuleProcessorSQL(rqbDateTimeLibraryAPI);
/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} value processor for "sql" format ("ansi" preset) using date-fns
 */
export const datetimeValueProcessorANSI: ValueProcessorByRule =
  getDatetimeValueProcessorANSI(rqbDateTimeLibraryAPI);
/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} value processor for "sql" format ("mssql" preset) using date-fns
 */
export const datetimeValueProcessorMSSQL: ValueProcessorByRule =
  getDatetimeValueProcessorMSSQL(rqbDateTimeLibraryAPI);
/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} value processor for "sql" format ("mysql" preset) using date-fns
 */
export const datetimeValueProcessorMySQL: ValueProcessorByRule =
  getDatetimeValueProcessorMySQL(rqbDateTimeLibraryAPI);
/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} value processor for "sql" format ("oracle" preset) using date-fns
 */
export const datetimeValueProcessorOracle: ValueProcessorByRule =
  getDatetimeValueProcessorOracle(rqbDateTimeLibraryAPI);
/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} value processor for "sql" format ("postgresql" preset) using date-fns
 */
export const datetimeValueProcessorPostgreSQL: ValueProcessorByRule =
  getDatetimeValueProcessorPostgreSQL(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "cel" format using date-fns
 */
export const datetimeRuleProcessorCEL: ValueProcessorByRule =
  getDatetimeRuleProcessorCEL(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "jsonata" format using date-fns
 */
export const datetimeRuleProcessorJSONata: RuleProcessor =
  getDatetimeRuleProcessorJSONata(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "mongodb_query" format using date-fns
 */
export const datetimeRuleProcessorMongoDBQuery: ValueProcessorByRule =
  getDatetimeRuleProcessorMongoDBQuery(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "natural_language" format using date-fns
 */
export const datetimeRuleProcessorNL: ValueProcessorByRule =
  getDatetimeRuleProcessorNL(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "cypher"/"gql" format using date-fns
 */
export const datetimeRuleProcessorCypher: ValueProcessorByRule =
  getDatetimeRuleProcessorCypher(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "sparql" format using date-fns
 */
export const datetimeRuleProcessorSPARQL: ValueProcessorByRule =
  getDatetimeRuleProcessorSPARQL(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "parameterized"/"parameterized_named" formats
 */
export const datetimeRuleProcessorParameterized: RuleProcessor =
  getDatetimeRuleProcessorParameterized(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "spel" format
 */
export const datetimeRuleProcessorSpEL: RuleProcessor =
  getDatetimeRuleProcessorSpEL(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "ldap" format
 */
export const datetimeRuleProcessorLDAP: RuleProcessor =
  getDatetimeRuleProcessorLDAP(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "gremlin" format
 */
export const datetimeRuleProcessorGremlin: RuleProcessor =
  getDatetimeRuleProcessorGremlin(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "prisma" format
 */
export const datetimeRuleProcessorPrisma: RuleProcessor =
  getDatetimeRuleProcessorPrisma(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "sequelize" format
 */
export const datetimeRuleProcessorSequelize: RuleProcessor =
  getDatetimeRuleProcessorSequelize(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "drizzle" format
 */
export const datetimeRuleProcessorDrizzle: RuleProcessor =
  getDatetimeRuleProcessorDrizzle(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "tanstack_db" format
 */
export const datetimeRuleProcessorTanStackDB: RuleProcessor =
  getDatetimeRuleProcessorTanStackDB(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for (deprecated) "mongodb" format
 */
export const datetimeRuleProcessorMongoDB: RuleProcessor =
  getDatetimeRuleProcessorMongoDB(rqbDateTimeLibraryAPI);

export * from './rqbDateTimeLibraryAPI.date-fns';
