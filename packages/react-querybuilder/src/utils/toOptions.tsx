import type { NameLabelPair, OptionGroup } from '@react-querybuilder/ts/src/index.noReact';
import { isOptionGroupArray } from './optGroupUtils';

export const toOptions = (arr?: NameLabelPair[] | OptionGroup[]) =>
  isOptionGroupArray(arr)
    ? arr.map(og => (
        <optgroup key={og.label} label={og.label}>
          {og.options.map(opt => (
            <option key={opt.name} value={opt.name}>
              {opt.label}
            </option>
          ))}
        </optgroup>
      ))
    : Array.isArray(arr)
    ? arr.map(opt => (
        <option key={opt.name} value={opt.name}>
          {opt.label}
        </option>
      ))
    : null;
