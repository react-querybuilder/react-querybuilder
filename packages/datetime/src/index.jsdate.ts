/**
 * Import from `"@react-querybuilder/datetime/jsdate"` for enhanced date/time support using a custom JavaScript `Date`-based library.
 *
 * @module jsdate
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
import { rqbDateTimeLibraryAPI } from './rqbDateTimeLibraryAPI.jsdate';
import type { RQBJsonLogicDateTimeOperations } from './types';

/**
 * Custom JsonLogic date/time operations using JavaScript `Date`.
 */
export const jsonLogicDateTimeOperations: RQBJsonLogicDateTimeOperations =
  getDatetimeJsonLogicOperations(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "sql" format using JavaScript `Date`
 */
export const datetimeRuleProcessorSQL: RuleProcessor =
  getDatetimeRuleProcessorSQL(rqbDateTimeLibraryAPI);
/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} value processor for "sql" format ("ansi" preset) using JavaScript `Date`
 */
export const datetimeValueProcessorANSI: ValueProcessorByRule =
  getDatetimeValueProcessorANSI(rqbDateTimeLibraryAPI);
/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} value processor for "sql" format ("mssql" preset) using JavaScript `Date`
 */
export const datetimeValueProcessorMSSQL: ValueProcessorByRule =
  getDatetimeValueProcessorMSSQL(rqbDateTimeLibraryAPI);
/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} value processor for "sql" format ("mysql" preset) using JavaScript `Date`
 */
export const datetimeValueProcessorMySQL: ValueProcessorByRule =
  getDatetimeValueProcessorMySQL(rqbDateTimeLibraryAPI);
/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} value processor for "sql" format ("oracle" preset) using JavaScript `Date`
 */
export const datetimeValueProcessorOracle: ValueProcessorByRule =
  getDatetimeValueProcessorOracle(rqbDateTimeLibraryAPI);
/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} value processor for "sql" format ("postgresql" preset) using JavaScript `Date`
 */
export const datetimeValueProcessorPostgreSQL: ValueProcessorByRule =
  getDatetimeValueProcessorPostgreSQL(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "cel" format using JavaScript `Date`
 */
export const datetimeRuleProcessorCEL: RuleProcessor =
  getDatetimeRuleProcessorCEL(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "jsonata" format using JavaScript `Date`
 */
export const datetimeRuleProcessorJSONata: RuleProcessor =
  getDatetimeRuleProcessorJSONata(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "mongodb_query" format using JavaScript `Date`
 */
export const datetimeRuleProcessorMongoDBQuery: RuleProcessor =
  getDatetimeRuleProcessorMongoDBQuery(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "natural_language" format using JavaScript `Date`
 */
export const datetimeRuleProcessorNL: ValueProcessorByRule =
  getDatetimeRuleProcessorNL(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "cypher"/"gql" format using JavaScript `Date`
 */
export const datetimeRuleProcessorCypher: RuleProcessor =
  getDatetimeRuleProcessorCypher(rqbDateTimeLibraryAPI);

/**
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "sparql" format using JavaScript `Date`
 */
export const datetimeRuleProcessorSPARQL: RuleProcessor =
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
 * {@link @react-querybuilder/core!formatQuery formatQuery} rule processor for "elasticsearch" format
 */
export const datetimeRuleProcessorElasticSearch: RuleProcessor =
  getDatetimeRuleProcessorElasticSearch(rqbDateTimeLibraryAPI);

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

export * from './rqbDateTimeLibraryAPI.jsdate';
