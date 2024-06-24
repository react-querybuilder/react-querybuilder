import { mergeTranslation, mergeTranslations } from './mergeTranslations';

it('merges translations', () => {
  expect(mergeTranslations({})).toEqual({});
  expect(
    mergeTranslations(
      { addRule: { label: 'addRule label', title: 'addRule title' } },
      { addGroup: { label: 'addGroup label', title: 'addGroup title' } },
      undefined
    )
  ).toEqual({
    addGroup: { label: 'addGroup label', title: 'addGroup title' },
    addRule: { label: 'addRule label', title: 'addRule title' },
  });
  expect(
    mergeTranslations(
      { addRule: { label: 'addRule label', title: 'addRule title' } },
      { addRule: { label: 'addRule label2', title: 'addRule title2' } }
    )
  ).toEqual({
    addRule: { label: 'addRule label2', title: 'addRule title2' },
  });
});

it('merges translation', () => {
  expect(mergeTranslation('addRule', {})).toBeUndefined();
  expect(mergeTranslation('addRule', { label: [undefined, undefined] })).toBeUndefined();
  expect(mergeTranslation('addRule', { label: ['Add Rule', undefined] })).toEqual({
    addRule: { label: 'Add Rule' },
  });
  expect(
    mergeTranslation('addRule', { label: ['Label', undefined], title: ['Title', undefined] })
  ).toEqual({
    addRule: { label: 'Label', title: 'Title' },
  });
});
