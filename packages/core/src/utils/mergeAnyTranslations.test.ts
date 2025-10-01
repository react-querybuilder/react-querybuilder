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
  ).toEqual({
    addRule: { label: 'addRule label2', title: 'addRule title2' },
  });
});

it('merges translation', () => {
  expect(mergeAnyTranslation('addRule', {})).toBeUndefined();
  expect(mergeAnyTranslation('addRule', { label: [undefined, undefined] })).toBeUndefined();
  expect(mergeAnyTranslation('addRule', { label: ['Add Rule', undefined] })).toEqual({
    addRule: { label: 'Add Rule' },
  });
  expect(
    mergeAnyTranslation('addRule', { label: ['Label', undefined], title: ['Title', undefined] })
  ).toEqual({
    addRule: { label: 'Label', title: 'Title' },
  });
});
