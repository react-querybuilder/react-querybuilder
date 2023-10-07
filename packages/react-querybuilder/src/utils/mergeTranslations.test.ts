import { mergeTranslations } from './mergeTranslations';

it('merges translations', () => {
  expect(mergeTranslations()).toEqual({});
  expect(mergeTranslations({})).toEqual({});
  expect(
    mergeTranslations(
      { addRule: { label: 'addRule label', title: 'addRule title' } },
      { addGroup: { label: 'addGroup label', title: 'addGroup title' } }
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
