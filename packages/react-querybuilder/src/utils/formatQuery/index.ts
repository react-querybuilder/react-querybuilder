import type { ValueProcessor } from '../../types';
import { internalValueProcessor } from './internalValueProcessor';
import { internalValueProcessorCEL } from './internalValueProcessorCEL';
import { internalValueProcessorMongoDB } from './internalValueProcessorMongoDB';

const internalValueProcessors = {
  default: internalValueProcessor,
  mongodb: internalValueProcessorMongoDB,
  cel: internalValueProcessorCEL,
} as const;

const generateValueProcessor =
  (format: 'default' | 'mongodb' | 'cel'): ValueProcessor =>
  (field, operator, value, valueSource) =>
    internalValueProcessors[format](
      { field, operator, value, valueSource },
      { parseNumbers: false }
    );

export const defaultValueProcessor = generateValueProcessor('default');
export const defaultMongoDBValueProcessor = generateValueProcessor('mongodb');
export const defaultCELValueProcessor = generateValueProcessor('cel');
export * from './formatQuery';
