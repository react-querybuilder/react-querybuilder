import type { RuleProcessor, ValueProcessorByRule } from 'react-querybuilder';
import { jsonLogicDateTimeOperations as get_jsonLogicDateTimeOperations } from './datetimeRuleProcessorJsonLogic';
import { datetimeRuleProcessorMongoDBQuery as get_datetimeRuleProcessorMongoDBQuery } from './datetimeRuleProcessorMongoDBQuery';
import {
  datetimeRuleProcessorSQL as get_datetimeRuleProcessorSQL,
  datetimeValueProcessorANSI as get_datetimeValueProcessorANSI,
  datetimeValueProcessorMSSQL as get_datetimeValueProcessorMSSQL,
  datetimeValueProcessorMySQL as get_datetimeValueProcessorMySQL,
  datetimeValueProcessorOracle as get_datetimeValueProcessorOracle,
  datetimeValueProcessorPostgreSQL as get_datetimeValueProcessorPostgreSQL,
} from './datetimeRuleProcessorSQL';
import { rqbDateTimeLibraryAPI } from './rqbDateTimeLibraryAPI.luxon';
import type { RQBJsonLogicDateTimeOperations } from './types';

export const jsonLogicDateTimeOperations: RQBJsonLogicDateTimeOperations =
  get_jsonLogicDateTimeOperations(rqbDateTimeLibraryAPI);
export { datetimeRuleProcessorJsonLogic } from './datetimeRuleProcessorJsonLogic';

export const datetimeRuleProcessorSQL: RuleProcessor =
  get_datetimeRuleProcessorSQL(rqbDateTimeLibraryAPI);
export const datetimeValueProcessorANSI: ValueProcessorByRule =
  get_datetimeValueProcessorANSI(rqbDateTimeLibraryAPI);
export const datetimeValueProcessorMSSQL: ValueProcessorByRule =
  get_datetimeValueProcessorMSSQL(rqbDateTimeLibraryAPI);
export const datetimeValueProcessorMySQL: ValueProcessorByRule =
  get_datetimeValueProcessorMySQL(rqbDateTimeLibraryAPI);
export const datetimeValueProcessorOracle: ValueProcessorByRule =
  get_datetimeValueProcessorOracle(rqbDateTimeLibraryAPI);
export const datetimeValueProcessorPostgreSQL: ValueProcessorByRule =
  get_datetimeValueProcessorPostgreSQL(rqbDateTimeLibraryAPI);

export const datetimeValueProcessorMongoDBQuery: ValueProcessorByRule =
  get_datetimeRuleProcessorMongoDBQuery(rqbDateTimeLibraryAPI);

export * from './rqbDateTimeLibraryAPI.luxon';
export * from './types';
