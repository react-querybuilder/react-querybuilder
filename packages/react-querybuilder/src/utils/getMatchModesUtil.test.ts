import { defaultMatchModes } from '../defaults';
import type { FullField, MatchModeOptions } from '../types/index.noReact';
import { getMatchModesUtil } from './getMatchModesUtil';
import { toFullOption } from './optGroupUtils';

const f: FullField = toFullOption({ name: 'f', label: 'FullField' });
const f1: FullField = toFullOption({ name: 'f1', label: 'F1', matchModes: ['all'] });
const f2: FullField = toFullOption({ name: 'f2', label: 'F2', matchModes: ['some'] });
const f3: FullField = toFullOption({ name: 'f3', label: 'F3', matchModes: ['all', 'some'] });
const f4: FullField = toFullOption({ name: 'f4', label: 'F4', matchModes: ['some', 'all'] });
const f5: FullField = toFullOption({
  name: 'f4',
  label: 'F4',
  matchModes: [{ name: 'all', value: 'all', label: 'all' }] as MatchModeOptions,
});
const f6: FullField = toFullOption({ name: 'f', label: 'FullField', matchModes: true });
const f7: FullField = toFullOption({
  name: 'f4',
  label: 'F4',
  // oxlint-disable-next-line typescript/no-explicit-any
  matchModes: ['custom', 'matchmode'] as any[],
});

it('gets the correct value sources array', () => {
  expect(getMatchModesUtil(f)).toEqual([]);
  expect(getMatchModesUtil(f1)).toEqual([{ name: 'all', value: 'all', label: 'all' }]);
  expect(getMatchModesUtil(f2)).toEqual([{ name: 'some', value: 'some', label: 'some' }]);
  expect(getMatchModesUtil(f3)).toEqual([
    { name: 'all', value: 'all', label: 'all' },
    { name: 'some', value: 'some', label: 'some' },
  ]);
  expect(getMatchModesUtil(f4)).toEqual([
    { name: 'some', value: 'some', label: 'some' },
    { name: 'all', value: 'all', label: 'all' },
  ]);
  expect(getMatchModesUtil(f5)).toEqual([{ name: 'all', value: 'all', label: 'all' }]);
  expect(getMatchModesUtil(f6)).toBe(defaultMatchModes);
  expect(getMatchModesUtil(f7)).toEqual([
    { name: 'custom', value: 'custom', label: 'custom' },
    { name: 'matchmode', value: 'matchmode', label: 'matchmode' },
  ]);
  expect(getMatchModesUtil(f, () => ['all'])).toEqual([
    { name: 'all', value: 'all', label: 'all' },
  ]);
});

it('calls the custom getMatchModes function correctly', () => {
  const getMatchModes = jest.fn();
  getMatchModesUtil(f, getMatchModes);
  expect(getMatchModes).toHaveBeenCalledWith(f.name, { fieldData: toFullOption(f) });
});
