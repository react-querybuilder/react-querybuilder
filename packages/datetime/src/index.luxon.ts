import type { RuleProcessor, ValueProcessorByRule } from 'react-querybuilder';
import { getDatetimeRuleProcessorCEL } from './datetimeRuleProcessorCEL';
import { getJsonLogicDateTimeOperations } from './datetimeRuleProcessorJsonLogic';
import { getDatetimeRuleProcessorMongoDBQuery } from './datetimeRuleProcessorMongoDBQuery';
import {
  getDatetimeRuleProcessorSQL,
  getDatetimeValueProcessorANSI,
  getDatetimeValueProcessorMSSQL,
  getDatetimeValueProcessorMySQL,
  getDatetimeValueProcessorOracle,
  getDatetimeValueProcessorPostgreSQL,
} from './datetimeRuleProcessorSQL';
import { rqbDateTimeLibraryAPI } from './rqbDateTimeLibraryAPI.luxon';
import type { RQBJsonLogicDateTimeOperations } from './types';

export const jsonLogicDateTimeOperations: RQBJsonLogicDateTimeOperations =
  getJsonLogicDateTimeOperations(rqbDateTimeLibraryAPI);
export { datetimeRuleProcessorJsonLogic } from './datetimeRuleProcessorJsonLogic';

export const datetimeRuleProcessorSQL: RuleProcessor =
  getDatetimeRuleProcessorSQL(rqbDateTimeLibraryAPI);
export const datetimeValueProcessorANSI: ValueProcessorByRule =
  getDatetimeValueProcessorANSI(rqbDateTimeLibraryAPI);
export const datetimeValueProcessorMSSQL: ValueProcessorByRule =
  getDatetimeValueProcessorMSSQL(rqbDateTimeLibraryAPI);
export const datetimeValueProcessorMySQL: ValueProcessorByRule =
  getDatetimeValueProcessorMySQL(rqbDateTimeLibraryAPI);
export const datetimeValueProcessorOracle: ValueProcessorByRule =
  getDatetimeValueProcessorOracle(rqbDateTimeLibraryAPI);
export const datetimeValueProcessorPostgreSQL: ValueProcessorByRule =
  getDatetimeValueProcessorPostgreSQL(rqbDateTimeLibraryAPI);

export const datetimeValueProcessorCEL: ValueProcessorByRule =
  getDatetimeRuleProcessorCEL(rqbDateTimeLibraryAPI);

export const datetimeValueProcessorMongoDBQuery: ValueProcessorByRule =
  getDatetimeRuleProcessorMongoDBQuery(rqbDateTimeLibraryAPI);

export * from './datetimeRuleProcessorJsonLogic';
export * from './datetimeRuleProcessorMongoDBQuery';
export * from './datetimeRuleProcessorSQL';
export * from './rqbDateTimeLibraryAPI.luxon';
export * from './types';
