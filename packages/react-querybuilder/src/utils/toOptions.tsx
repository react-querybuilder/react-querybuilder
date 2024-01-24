import * as React from 'react';
import type { OptionList } from '../types/index.noReact';
import { isOptionGroupArray } from './optGroupUtils';

/**
 * Generates an array of `<option>` or `<optgroup>` elements
 * from a given {@link OptionList}.
 */
export const toOptions = (arr?: OptionList) =>
  isOptionGroupArray(arr)
    ? arr.map(og => (
        <optgroup key={og.label} label={og.label}>
          {og.options.map(opt => (
            <option key={opt.name} value={opt.name} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </optgroup>
      ))
    : Array.isArray(arr)
      ? arr.map(opt => (
          <option key={opt.name} value={opt.name} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))
      : null;
