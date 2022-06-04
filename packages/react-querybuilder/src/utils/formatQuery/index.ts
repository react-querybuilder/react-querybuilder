import type { ValueProcessor } from '../../types/index.noReact';
import { internalValueProcessor } from './internalValueProcessor';
import { internalValueProcessorCEL } from './internalValueProcessorCEL';
import { internalValueProcessorMongoDB } from './internalValueProcessorMongoDB';
import { internalValueProcessorSpEL } from './internalValueProcessorSpEL';

const internalValueProcessors = {
  default: internalValueProcessor,
  mongodb: internalValueProcessorMongoDB,
  cel: internalValueProcessorCEL,
  spel: internalValueProcessorSpEL,
} as const;

const generateValueProcessor =
  (format: 'default' | 'mongodb' | 'cel' | 'spel'): ValueProcessor =>
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
