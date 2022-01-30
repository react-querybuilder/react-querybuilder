import { Field, QueryBuilderProps, ValueSources } from '../types';

export const getValueSourcesUtil = (
  fieldData: Field,
  operator: string,
  getValueSources?: QueryBuilderProps['getValueSources']
): ValueSources => {
  if (fieldData?.valueSources) {
    if (typeof fieldData.valueSources === 'function') {
      return fieldData.valueSources(operator);
    }
    return fieldData.valueSources;
  }
  if (getValueSources) {
    const vals = getValueSources(fieldData.name, operator);
    /* istanbul ignore else */
    if (vals) return vals;
  }

  return ['value'];
};
