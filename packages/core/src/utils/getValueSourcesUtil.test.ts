import type { FullField, ValueSourceFullOptions, ValueSources } from '../types';
import { getValueSourcesUtil } from './getValueSourcesUtil';
import { toFullOption } from './optGroupUtils';

const toVSO = (vss: ValueSources) =>
  vss.map(vs => ({ name: vs, value: vs, label: vs })) as ValueSourceFullOptions;

const fvsV = toVSO(['value']);
const fvsF = toVSO(['field']);
const fvsVF = toVSO(['value', 'field']);
const fvsFV = toVSO(['field', 'value']);

const f: FullField = toFullOption({ name: 'f', label: 'FullField' });
const f1: FullField = toFullOption({ name: 'f1', label: 'F1', valueSources: ['value'] });
const f2: FullField = toFullOption({ name: 'f2', label: 'F2', valueSources: ['field'] });
const f3: FullField = toFullOption({ name: 'f3', label: 'F3', valueSources: ['value', 'field'] });
const f4: FullField = toFullOption({ name: 'f4', label: 'F4', valueSources: ['field', 'value'] });
const f1f: FullField = toFullOption({ name: 'f1f', label: 'F1F', valueSources: () => ['value'] });
const f2f: FullField = toFullOption({ name: 'f2f', label: 'F2F', valueSources: () => ['field'] });
const f3f: FullField = toFullOption({
  name: 'f3f',
  label: 'F3F',
  valueSources: () => ['value', 'field'],
});
const f4f: FullField = toFullOption({
  name: 'f4f',
  label: 'F4F',
  valueSources: () => ['field', 'value'],
});
const f1fo: FullField = toFullOption({
  name: 'f1fo',
  label: 'F1FO',
  valueSources: (op: string) => (op === '=' ? ['value'] : ['value']),
});
const f2fo: FullField = toFullOption({
  name: 'f2fo',
  label: 'F2FO',
  valueSources: (op: string) => (op === '=' ? ['value'] : ['field']),
});
const f3fo: FullField = toFullOption({
  name: 'f3fo',
  label: 'F3FO',
  valueSources: (op: string) => (op === '=' ? ['value'] : ['value', 'field']),
});
const f4fo: FullField = toFullOption({
  name: 'f4fo',
  label: 'F4FO',
  valueSources: (op: string) => (op === '=' ? ['value'] : ['field', 'value']),
});

it('gets the correct value sources array', () => {
  expect(getValueSourcesUtil(f, '=')).toEqual(fvsV);
  expect(getValueSourcesUtil(f, '=')).toEqual(fvsV);
  expect(getValueSourcesUtil(f1, '=')).toEqual(fvsV);
  expect(getValueSourcesUtil(f2, '=')).toEqual(fvsF);
  expect(getValueSourcesUtil(f3, '=')).toEqual(fvsVF);
  expect(getValueSourcesUtil(f4, '=')).toEqual(fvsFV);
  expect(getValueSourcesUtil(f1f, '=')).toEqual(fvsV);
  expect(getValueSourcesUtil(f2f, '=')).toEqual(fvsF);
  expect(getValueSourcesUtil(f3f, '=')).toEqual(fvsVF);
  expect(getValueSourcesUtil(f4f, '=')).toEqual(fvsFV);
  expect(getValueSourcesUtil(f1fo, '=')).toEqual(fvsV);
  expect(getValueSourcesUtil(f2fo, '=')).toEqual(fvsV);
  expect(getValueSourcesUtil(f3fo, '=')).toEqual(fvsV);
  expect(getValueSourcesUtil(f4fo, '=')).toEqual(fvsV);
  expect(getValueSourcesUtil(f1fo, '>')).toEqual(fvsV);
  expect(getValueSourcesUtil(f2fo, '>')).toEqual(fvsF);
  expect(getValueSourcesUtil(f3fo, '>')).toEqual(fvsVF);
  expect(getValueSourcesUtil(f4fo, '>')).toEqual(fvsFV);
  expect(getValueSourcesUtil(f, '=', () => ['value'])).toEqual(fvsV);
  // @ts-expect-error In practice, fieldData can be undefined
  expect(getValueSourcesUtil(undefined, '>')).toEqual([
    { name: 'value', value: 'value', label: 'value' },
  ]);
});

it('calls the custom getValueSources function correctly', () => {
  const getValueSources = jest.fn(() => fvsF);
  getValueSourcesUtil(f, '=', getValueSources);
  expect(getValueSources).toHaveBeenCalledWith(f.name, '=', { fieldData: toFullOption(f) });
});
