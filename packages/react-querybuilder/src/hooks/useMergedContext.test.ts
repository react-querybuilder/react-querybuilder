import { renderHook } from '@testing-library/react';
import { defaultTranslations } from '../defaults';
import type { Translations } from '../types';
import { useMergedContext } from './useMergedContext';

it('merges context', async () => {
  const customTranslations: Partial<Translations> = { addRule: { label: 'Add Rule' } };
  const hookResult = renderHook(useMergedContext, {
    initialProps: { finalize: false, translations: customTranslations },
  });
  expect(hookResult.result.current).toMatchObject(
    expect.objectContaining({ translations: customTranslations })
  );

  hookResult.rerender({ finalize: true, translations: customTranslations });
  expect(hookResult.result.current).toMatchObject(
    expect.objectContaining({
      translations: {
        ...defaultTranslations,
        addRule: { ...defaultTranslations.addRule, label: 'Add Rule' },
      },
    })
  );
});
