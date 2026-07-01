import type { SQLPreset } from '@react-querybuilder/core';
import type { SQLSerializer, SQLSerializerFn } from '../types';

/**
 * Resolves a {@link SQLSerializer} to a concrete serializer function for the given preset.
 * A plain function is returned as-is; a preset-keyed map returns the preset's override
 * (falling back to `default` when the preset has none, e.g. `min`/`max` on non-`sqlite`
 * presets).
 */
export const resolvePresetSerializer = (
  serializer: SQLSerializer,
  preset?: SQLPreset
): SQLSerializerFn =>
  typeof serializer === 'function' ? serializer : (serializer[preset!] ?? serializer.default);
