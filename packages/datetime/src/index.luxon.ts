import type { RuleProcessor, ValueProcessorByRule } from 'react-querybuilder';
import { jsonLogicDateTimeOperators as get_jsonLogicDateTimeOperators } from './datetimeRuleProcessorJsonLogic';
import {
  datetimeRuleProcessorSQL as get_datetimeRuleProcessorSQL,
  datetimeValueProcessorANSI as get_datetimeValueProcessorANSI,
  datetimeValueProcessorMSSQL as get_datetimeValueProcessorMSSQL,
  datetimeValueProcessorMySQL as get_datetimeValueProcessorMySQL,
  datetimeValueProcessorOracle as get_datetimeValueProcessorOracle,
  datetimeValueProcessorPostgreSQL as get_datetimeValueProcessorPostgreSQL,
} from './datetimeRuleProcessorSQL';
import { rqbDateTimeOperatorsLuxon } from './operators.luxon';
import type { RQBJsonLogicDateTimeOperators } from './types';

export const jsonLogicDateTimeOperators: RQBJsonLogicDateTimeOperators =
  get_jsonLogicDateTimeOperators(rqbDateTimeOperatorsLuxon);
export { datetimeRuleProcessorJsonLogic } from './datetimeRuleProcessorJsonLogic';

export const datetimeRuleProcessorSQL: RuleProcessor =
  get_datetimeRuleProcessorSQL(rqbDateTimeOperatorsLuxon);
export const datetimeValueProcessorANSI: ValueProcessorByRule =
  get_datetimeValueProcessorANSI(rqbDateTimeOperatorsLuxon);
export const datetimeValueProcessorMSSQL: ValueProcessorByRule =
  get_datetimeValueProcessorMSSQL(rqbDateTimeOperatorsLuxon);
export const datetimeValueProcessorMySQL: ValueProcessorByRule =
  get_datetimeValueProcessorMySQL(rqbDateTimeOperatorsLuxon);
export const datetimeValueProcessorOracle: ValueProcessorByRule =
  get_datetimeValueProcessorOracle(rqbDateTimeOperatorsLuxon);
export const datetimeValueProcessorPostgreSQL: ValueProcessorByRule =
  get_datetimeValueProcessorPostgreSQL(rqbDateTimeOperatorsLuxon);

export * from './operators.luxon';
export * from './types';
