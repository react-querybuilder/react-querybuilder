import type { ValueProcessorLegacy } from '../../types/index.noReact';
import { defaultValueProcessorByRule } from './defaultValueProcessorByRule';
import { defaultValueProcessorCELByRule } from './defaultValueProcessorCELByRule';
import { defaultValueProcessorMongoDBByRule } from './defaultValueProcessorMongoDBByRule';
import { defaultValueProcessorSpELByRule } from './defaultValueProcessorSpELByRule';

const internalValueProcessors = {
  default: defaultValueProcessorByRule,
  mongodb: defaultValueProcessorMongoDBByRule,
  cel: defaultValueProcessorCELByRule,
  spel: defaultValueProcessorSpELByRule,
} as const;

const generateValueProcessor =
  (format: 'default' | 'mongodb' | 'cel' | 'spel'): ValueProcessorLegacy =>
  (field, operator, value, valueSource) =>
    internalValueProcessors[format](
      { field, operator, value, valueSource },
      { parseNumbers: false }
    );

export const defaultValueProcessor = generateValueProcessor('default');
export const defaultMongoDBValueProcessor = generateValueProcessor('mongodb');
export const defaultCELValueProcessor = generateValueProcessor('cel');
export const defaultSpELValueProcessor = generateValueProcessor('spel');
export * from './formatQuery';
export { defaultValueProcessorByRule };
export { defaultValueProcessorCELByRule };
export { defaultValueProcessorMongoDBByRule };
export { defaultValueProcessorSpELByRule };
