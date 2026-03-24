import { defaultTranslations } from '../defaults';
import { mergeAnyTranslation, mergeAnyTranslations } from './mergeAnyTranslations';

it('merges translations', () => {
  expect(mergeAnyTranslations({})).toEqual({});
  expect(
    mergeAnyTranslations(
      { addRule: { label: 'addRule label', title: 'addRule title' } },
      { addGroup: { label: 'addGroup label', title: 'addGroup title' } }
    )
  ).toEqual({
    addGroup: { label: 'addGroup label', title: 'addGroup title' },
    addRule: { label: 'addRule label', title: 'addRule title' },
  });
  expect(
    mergeAnyTranslations(
      { addRule: { label: 'addRule label', title: 'addRule title' } },
      { addRule: { label: 'addRule label2', title: 'addRule title2' } }
    )
  ).toEqual({ addRule: { label: 'addRule label2', title: 'addRule title2' } });
});

it('merges translation', () => {
  expect(mergeAnyTranslation('addRule', {})).toBeUndefined();
  expect(mergeAnyTranslation('addRule', { label: [undefined, undefined] })).toBeUndefined();
  expect(mergeAnyTranslation('addRule', { label: ['Add Rule', undefined] })).toEqual({
    addRule: { label: 'Add Rule' },
  });
  expect(mergeAnyTranslation('addRule', { label: [undefined, 'Add Rule'] })).toEqual({
    addRule: { label: 'Add Rule' },
  });
  expect(
    mergeAnyTranslation('addRule', { label: ['Label', undefined], title: ['Title', undefined] })
  ).toEqual({ addRule: { label: 'Label', title: 'Title' } });
  expect(
    mergeAnyTranslation('addRule', { label: [undefined, undefined] }, defaultTranslations)
  ).toHaveProperty('addRule', defaultTranslations.addRule);
  expect(mergeAnyTranslation('addRule', {}, defaultTranslations)).toHaveProperty(
    'addRule',
    defaultTranslations.addRule
  );
});

describe('prototype pollution prevention', () => {
  afterEach(() => {
    // Safety cleanup in case a test fails
    delete (Object.prototype as Record<string, unknown>)['polluted'];
  });

  it('mergeAnyTranslations ignores __proto__ keys', () => {
    const malicious = JSON.parse('{"__proto__":{"polluted":"yes"}}');
    mergeAnyTranslations({}, malicious);
    expect(({} as Record<string, unknown>)['polluted']).toBeUndefined();
  });

  it('mergeAnyTranslations ignores constructor keys', () => {
    const malicious = JSON.parse('{"constructor":{"polluted":"yes"}}');
    const result = mergeAnyTranslations({}, malicious);
    expect(result).toEqual({});
  });

  it('mergeAnyTranslations ignores prototype keys', () => {
    const malicious = JSON.parse('{"prototype":{"polluted":"yes"}}');
    const result = mergeAnyTranslations({}, malicious);
    expect(result).toEqual({});
  });

  it('mergeAnyTranslation returns undefined for unsafe el values', () => {
    expect(mergeAnyTranslation('__proto__', { label: ['x', undefined] })).toBeUndefined();
    expect(mergeAnyTranslation('constructor', { label: ['x', undefined] })).toBeUndefined();
    expect(mergeAnyTranslation('prototype', { label: ['x', undefined] })).toBeUndefined();
  });

  it('mergeAnyTranslation filters unsafe keys from keyPropContextMap', () => {
    const result = mergeAnyTranslation('addRule', {
      label: ['Label', undefined],
      __proto__: ['bad', undefined],
      constructor: ['bad', undefined],
    } as unknown as Record<string, [unknown, unknown]>);
    expect(result).toEqual({ addRule: { label: 'Label' } });
    expect(({} as Record<string, unknown>)['polluted']).toBeUndefined();
  });
});
