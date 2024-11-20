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
import { rqbDateTimeOperatorsDateFns } from './operators.date-fns';
import type { RQBJsonLogicDateTimeOperators } from './types';

export const jsonLogicDateTimeOperators: RQBJsonLogicDateTimeOperators =
  get_jsonLogicDateTimeOperators(rqbDateTimeOperatorsDateFns);
export { datetimeRuleProcessorJsonLogic } from './datetimeRuleProcessorJsonLogic';

export const datetimeRuleProcessorSQL: RuleProcessor = get_datetimeRuleProcessorSQL(
  rqbDateTimeOperatorsDateFns
);
export const datetimeValueProcessorANSI: ValueProcessorByRule = get_datetimeValueProcessorANSI(
  rqbDateTimeOperatorsDateFns
);
export const datetimeValueProcessorMSSQL: ValueProcessorByRule = get_datetimeValueProcessorMSSQL(
  rqbDateTimeOperatorsDateFns
);
export const datetimeValueProcessorMySQL: ValueProcessorByRule = get_datetimeValueProcessorMySQL(
  rqbDateTimeOperatorsDateFns
);
export const datetimeValueProcessorOracle: ValueProcessorByRule = get_datetimeValueProcessorOracle(
  rqbDateTimeOperatorsDateFns
);
export const datetimeValueProcessorPostgreSQL: ValueProcessorByRule =
  get_datetimeValueProcessorPostgreSQL(rqbDateTimeOperatorsDateFns);

export * from './operators.date-fns';
export * from './types';
