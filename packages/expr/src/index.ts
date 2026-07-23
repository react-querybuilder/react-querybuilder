import type { RuleProcessor } from '@react-querybuilder/core';
import { getExpressionRuleProcessorCEL } from './processors/getExpressionRuleProcessorCEL';
import { getExpressionRuleProcessorCypher } from './processors/getExpressionRuleProcessorCypher';
import { getExpressionRuleProcessorDrizzle } from './processors/getExpressionRuleProcessorDrizzle';
import { getExpressionRuleProcessorElasticSearch } from './processors/getExpressionRuleProcessorElasticSearch';
import { getExpressionRuleProcessorJSONata } from './processors/getExpressionRuleProcessorJSONata';
import { getExpressionRuleProcessorJsonLogic } from './processors/getExpressionRuleProcessorJsonLogic';
import { getExpressionRuleProcessorMongoDB } from './processors/getExpressionRuleProcessorMongoDB';
import { getExpressionRuleProcessorMongoDBQuery } from './processors/getExpressionRuleProcessorMongoDBQuery';
import { getExpressionRuleProcessorNL } from './processors/getExpressionRuleProcessorNL';
import { getExpressionRuleProcessorParameterized } from './processors/getExpressionRuleProcessorParameterized';
import { getExpressionRuleProcessorSequelize } from './processors/getExpressionRuleProcessorSequelize';
import { getExpressionRuleProcessorSPARQL } from './processors/getExpressionRuleProcessorSPARQL';
import { getExpressionRuleProcessorSpEL } from './processors/getExpressionRuleProcessorSpEL';
import { getExpressionRuleProcessorSQL } from './processors/getExpressionRuleProcessorSQL';
import { getExpressionRuleProcessorTanStackDB } from './processors/getExpressionRuleProcessorTanStackDB';

export * from './functions/cel';
export * from './functions/cypher';
export * from './functions/drizzle';
export * from './functions/jsonata';
export * from './functions/jsonLogic';
export * from './functions/meta';
export * from './functions/mongodb';
export * from './functions/nl';
export * from './functions/painless';
export * from './functions/parameterized';
export * from './functions/sparql';
export * from './functions/spel';
export * from './functions/sql';
export * from './functions/tanstackDb';
export * from './jsonLogicOperators';
export * from './parsers/getExpressionParserJsonLogic';
export * from './parsers/getExpressionParserSQL';
export * from './processors/getExpressionRuleProcessorCEL';
export * from './processors/getExpressionRuleProcessorCypher';
export * from './processors/getExpressionRuleProcessorDrizzle';
export * from './processors/getExpressionRuleProcessorElasticSearch';
export * from './processors/getExpressionRuleProcessorJSONata';
export * from './processors/getExpressionRuleProcessorJsonLogic';
export * from './processors/getExpressionRuleProcessorMongoDB';
export * from './processors/getExpressionRuleProcessorMongoDBQuery';
export * from './processors/getExpressionRuleProcessorNL';
export * from './processors/getExpressionRuleProcessorParameterized';
export * from './processors/getExpressionRuleProcessorSequelize';
export * from './processors/getExpressionRuleProcessorSPARQL';
export * from './processors/getExpressionRuleProcessorSpEL';
export * from './processors/getExpressionRuleProcessorSQL';
export * from './processors/getExpressionRuleProcessorTanStackDB';
export * from './registry';
export * from './types';
export * from './utils/createExpressionValidator';
export * from './utils/serializeDrizzle';
export * from './utils/serializeInfix';
export * from './utils/serializeMongoAgg';
export * from './utils/serializeTanStackDb';
export * from './utils/stringExprProcessor';
export * from './utils/validateExpression';

/** Ready-to-use "sql" rule processor bound to {@link defaultSQLSerializers}. */
export const expressionRuleProcessorSQL: RuleProcessor = getExpressionRuleProcessorSQL();

/**
 * Ready-to-use "parameterized"/"parameterized_named" rule processor bound to
 * {@link defaultParameterizedSerializers}.
 */
export const expressionRuleProcessorParameterized: RuleProcessor =
  getExpressionRuleProcessorParameterized();

/** Ready-to-use "jsonlogic" rule processor bound to {@link defaultJsonLogicSerializers}. */
export const expressionRuleProcessorJsonLogic: RuleProcessor =
  getExpressionRuleProcessorJsonLogic();

/** Ready-to-use "cel" rule processor bound to {@link defaultCELSerializers}. */
export const expressionRuleProcessorCEL: RuleProcessor = getExpressionRuleProcessorCEL();

/** Ready-to-use "spel" rule processor bound to {@link defaultSpELSerializers}. */
export const expressionRuleProcessorSpEL: RuleProcessor = getExpressionRuleProcessorSpEL();

/** Ready-to-use "cypher"/"gql" rule processor bound to {@link defaultCypherSerializers}. */
export const expressionRuleProcessorCypher: RuleProcessor = getExpressionRuleProcessorCypher();

/** Ready-to-use "sparql" rule processor bound to {@link defaultSPARQLSerializers}. */
export const expressionRuleProcessorSPARQL: RuleProcessor = getExpressionRuleProcessorSPARQL();

/** Ready-to-use "jsonata" rule processor bound to {@link defaultJSONataSerializers}. */
export const expressionRuleProcessorJSONata: RuleProcessor = getExpressionRuleProcessorJSONata();

/**
 * Ready-to-use "mongodb_query" rule processor bound to {@link defaultMongoDBSerializers}.
 */
export const expressionRuleProcessorMongoDBQuery: RuleProcessor =
  getExpressionRuleProcessorMongoDBQuery();

/** Ready-to-use (deprecated) "mongodb" rule processor bound to {@link defaultMongoDBSerializers}. */
export const expressionRuleProcessorMongoDB: RuleProcessor = getExpressionRuleProcessorMongoDB();

/** Ready-to-use "drizzle" rule processor bound to {@link defaultDrizzleSerializers}. */
export const expressionRuleProcessorDrizzle: RuleProcessor = getExpressionRuleProcessorDrizzle();

/** Ready-to-use "sequelize" rule processor bound to {@link defaultSQLSerializers}. */
export const expressionRuleProcessorSequelize: RuleProcessor =
  getExpressionRuleProcessorSequelize();

/** Ready-to-use "tanstack_db" rule processor bound to {@link defaultTanStackDbSerializers}. */
export const expressionRuleProcessorTanStackDB: RuleProcessor =
  getExpressionRuleProcessorTanStackDB();

/** Ready-to-use "elasticsearch" rule processor bound to {@link defaultPainlessSerializers}. */
export const expressionRuleProcessorElasticSearch: RuleProcessor =
  getExpressionRuleProcessorElasticSearch();

/** Ready-to-use "natural_language" rule processor bound to {@link defaultNLSerializers}. */
export const expressionRuleProcessorNL: RuleProcessor = getExpressionRuleProcessorNL();
