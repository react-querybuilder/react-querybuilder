/**
 * Import from `"@react-querybuilder/datetime/dayjs"` for enhanced date/time support using [Day.js](https://day.js.org/).
 *
 * @module dayjs
 */

import type { RuleProcessor, ValueProcessorByRule } from 'react-querybuilder';
import { getDatetimeJsonLogicOperations } from './getDatetimeJsonLogicOperations';
import { getDatetimeRuleProcessorCEL } from './getDatetimeRuleProcessorCEL';
import { getDatetimeRuleProcessorCypher } from './getDatetimeRuleProcessorCypher';
import { getDatetimeRuleProcessorDrizzle } from './getDatetimeRuleProcessorDrizzle';
import { getDatetimeRuleProcessorElasticSearch } from './getDatetimeRuleProcessorElasticSearch';
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
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "jsonata" format using Day.js
 */
export const datetimeRuleProcessorJSONata: RuleProcessor =
  getDatetimeRuleProcessorJSONata(rqbDateTimeLibraryAPI);

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

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "cypher"/"gql" format using Day.js
 */
export const datetimeRuleProcessorCypher: ValueProcessorByRule =
  getDatetimeRuleProcessorCypher(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "sparql" format using Day.js
 */
export const datetimeRuleProcessorSPARQL: ValueProcessorByRule =
  getDatetimeRuleProcessorSPARQL(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "parameterized"/"parameterized_named" formats using Day.js
 */
export const datetimeRuleProcessorParameterized: RuleProcessor =
  getDatetimeRuleProcessorParameterized(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "spel" format using Day.js
 */
export const datetimeRuleProcessorSpEL: RuleProcessor =
  getDatetimeRuleProcessorSpEL(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "ldap" format using Day.js
 */
export const datetimeRuleProcessorLDAP: RuleProcessor =
  getDatetimeRuleProcessorLDAP(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "gremlin" format using Day.js
 */
export const datetimeRuleProcessorGremlin: RuleProcessor =
  getDatetimeRuleProcessorGremlin(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "prisma" format using Day.js
 */
export const datetimeRuleProcessorPrisma: RuleProcessor =
  getDatetimeRuleProcessorPrisma(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "sequelize" format using Day.js
 */
export const datetimeRuleProcessorSequelize: RuleProcessor =
  getDatetimeRuleProcessorSequelize(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "drizzle" format using Day.js
 */
export const datetimeRuleProcessorDrizzle: RuleProcessor =
  getDatetimeRuleProcessorDrizzle(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "elasticsearch" format using Day.js
 */
export const datetimeRuleProcessorElasticSearch: RuleProcessor =
  getDatetimeRuleProcessorElasticSearch(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "tanstack_db" format using Day.js
 */
export const datetimeRuleProcessorTanStackDB: RuleProcessor =
  getDatetimeRuleProcessorTanStackDB(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for (deprecated) "mongodb" format using Day.js
 */
export const datetimeRuleProcessorMongoDB: RuleProcessor =
  getDatetimeRuleProcessorMongoDB(rqbDateTimeLibraryAPI);

export * from './rqbDateTimeLibraryAPI.dayjs';
