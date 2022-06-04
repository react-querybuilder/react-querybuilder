import type { Field } from '../types/index.noReact';
import { getValueSourcesUtil } from './getValueSourcesUtil';

const f: Field = { name: 'f', label: 'F' };
const f1: Field = { name: 'f1', label: 'F1', valueSources: ['value'] };
const f2: Field = { name: 'f2', label: 'F2', valueSources: ['field'] };
const f3: Field = { name: 'f3', label: 'F3', valueSources: ['value', 'field'] };
const f4: Field = { name: 'f4', label: 'F4', valueSources: ['field', 'value'] };
const f1f: Field = { name: 'f1f', label: 'F1F', valueSources: () => ['value'] };
const f2f: Field = { name: 'f2f', label: 'F2F', valueSources: () => ['field'] };
const f3f: Field = { name: 'f3f', label: 'F3F', valueSources: () => ['value', 'field'] };
const f4f: Field = { name: 'f4f', label: 'F4F', valueSources: () => ['field', 'value'] };
const f1fo: Field = {
  name: 'f1fo',
  label: 'F1FO',
  valueSources: op => (op === '=' ? ['value'] : ['value']),
};
const f2fo: Field = {
  name: 'f2fo',
  label: 'F2FO',
  valueSources: op => (op === '=' ? ['value'] : ['field']),
};
const f3fo: Field = {
  name: 'f3fo',
  label: 'F3FO',
  valueSources: op => (op === '=' ? ['value'] : ['value', 'field']),
};
const f4fo: Field = {
  name: 'f4fo',
  label: 'F4FO',
  valueSources: op => (op === '=' ? ['value'] : ['field', 'value']),
};

it('gets the correct value sources array', () => {
  expect(getValueSourcesUtil(f, '=')).toEqual(['value']);
  expect(getValueSourcesUtil(f1, '=')).toEqual(['value']);
  expect(getValueSourcesUtil(f2, '=')).toEqual(['field']);
  expect(getValueSourcesUtil(f3, '=')).toEqual(['value', 'field']);
  expect(getValueSourcesUtil(f4, '=')).toEqual(['field', 'value']);
  expect(getValueSourcesUtil(f1f, '=')).toEqual(['value']);
  expect(getValueSourcesUtil(f2f, '=')).toEqual(['field']);
  expect(getValueSourcesUtil(f3f, '=')).toEqual(['value', 'field']);
  expect(getValueSourcesUtil(f4f, '=')).toEqual(['field', 'value']);
  expect(getValueSourcesUtil(f1fo, '=')).toEqual(['value']);
  expect(getValueSourcesUtil(f2fo, '=')).toEqual(['value']);
  expect(getValueSourcesUtil(f3fo, '=')).toEqual(['value']);
  expect(getValueSourcesUtil(f4fo, '=')).toEqual(['value']);
  expect(getValueSourcesUtil(f1fo, '>')).toEqual(['value']);
  expect(getValueSourcesUtil(f2fo, '>')).toEqual(['field']);
  expect(getValueSourcesUtil(f3fo, '>')).toEqual(['value', 'field']);
  expect(getValueSourcesUtil(f4fo, '>')).toEqual(['field', 'value']);
  expect(getValueSourcesUtil(f, '=', () => ['value'])).toEqual(['value']);
});
