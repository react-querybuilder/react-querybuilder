import { defaultClassnamesRE } from '../defaults';
import { mergeClassnamesRE } from './mergeClassnamesRE';

it('handles strings', () => {
  expect(mergeClassnamesRE({ rulesEngineBuilder: 'reb' })).toEqual({
    ...defaultClassnamesRE,
    rulesEngineBuilder: 'reb',
  });
  expect(mergeClassnamesRE({ rulesEngineBuilder: 'reb', rulesEngineHeader: 'reh' })).toEqual({
    ...defaultClassnamesRE,
    rulesEngineBuilder: 'reb',
    rulesEngineHeader: 'reh',
  });
});

it('handles arrays and objects', () => {
  expect(
    mergeClassnamesRE({ rulesEngineBuilder: ['reb', 'reb2'], rulesEngineHeader: { reh: true } })
  ).toEqual({ ...defaultClassnamesRE, rulesEngineBuilder: 'reb reb2', rulesEngineHeader: 'reh' });
});

it('handles multiple objects and declaration types', () => {
  expect(
    mergeClassnamesRE(
      { rulesEngineBuilder: ['reb', 'reb2'], rulesEngineHeader: { reh: true } },
      { rulesEngineBuilder: { reb3: 1, reb4: 'yes' }, rulesEngineHeader: 'reh2' }
    )
  ).toEqual({
    ...defaultClassnamesRE,
    rulesEngineBuilder: 'reb reb2 reb3 reb4',
    rulesEngineHeader: 'reh reh2',
  });
});

it('handles non-string values that normalize to empty', () => {
  expect(mergeClassnamesRE({ rulesEngineBuilder: [] }, { rulesEngineBuilder: {} })).toEqual(
    defaultClassnamesRE
  );
});
