import type { OptionList } from '@react-querybuilder/core';
import { isOptionGroupArray } from '@react-querybuilder/core';
import * as React from 'react';

/**
 * Generates an array of `<option>` or `<optgroup>` elements
 * from a given {@link OptionList}.
 *
 * @group Option Lists
 */
export const toOptions = (arr?: OptionList): React.JSX.Element[] | null =>
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
