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
import { rqbDateTimeOperatorsDayjs } from './operators.dayjs';
import type { RQBJsonLogicDateTimeOperators } from './types';

export const jsonLogicDateTimeOperators: RQBJsonLogicDateTimeOperators =
  get_jsonLogicDateTimeOperators(rqbDateTimeOperatorsDayjs);
export { datetimeRuleProcessorJsonLogic } from './datetimeRuleProcessorJsonLogic';

export const datetimeRuleProcessorSQL: RuleProcessor =
  get_datetimeRuleProcessorSQL(rqbDateTimeOperatorsDayjs);
export const datetimeValueProcessorANSI: ValueProcessorByRule =
  get_datetimeValueProcessorANSI(rqbDateTimeOperatorsDayjs);
export const datetimeValueProcessorMSSQL: ValueProcessorByRule =
  get_datetimeValueProcessorMSSQL(rqbDateTimeOperatorsDayjs);
export const datetimeValueProcessorMySQL: ValueProcessorByRule =
  get_datetimeValueProcessorMySQL(rqbDateTimeOperatorsDayjs);
export const datetimeValueProcessorOracle: ValueProcessorByRule =
  get_datetimeValueProcessorOracle(rqbDateTimeOperatorsDayjs);
export const datetimeValueProcessorPostgreSQL: ValueProcessorByRule =
  get_datetimeValueProcessorPostgreSQL(rqbDateTimeOperatorsDayjs);

export * from './operators.dayjs';
export * from './types';
