import { defaultMatchModes } from '../defaults';
import type {
  FlexibleOption,
  FullField,
  GetOptionIdentifierType,
  MatchMode,
  MatchModeOptions,
} from '../types/index.noReact';
import { lc } from './misc';
import { isFlexibleOptionArray, toFullOption, toFullOptionList } from './optGroupUtils';

const dummyFD = {
  name: 'name',
  value: 'name',
  matchModes: null,
  label: 'label',
};

/**
 * Utility function to get the match modes array for the given
 * field. If the field definition does not define a `matchModes`
 * property, the `getMatchModes` prop is used. Returns
 * `FullOption<MatchMode>[]` of all match modes by default.
 */
export const getMatchModesUtil = <F extends FullField>(
  fieldData: F,
  getMatchModes?: (
    field: GetOptionIdentifierType<F>,
    misc: { fieldData: F }
  ) => boolean | MatchMode[] | FlexibleOption<MatchMode>[]
): MatchModeOptions => {
  // TypeScript doesn't allow it directly, but in practice
  // `fieldData` can end up being undefined or null. The nullish
  // coalescing assignment below avoids errors like
  // "TypeError: Cannot read properties of undefined (reading 'name')"
  const fd = fieldData ? toFullOption(fieldData) : /* istanbul ignore next */ dummyFD;

  let matchModes: boolean | MatchMode[] | FlexibleOption<MatchMode>[] = fd.matchModes ?? false;

  if (!matchModes && getMatchModes) {
    matchModes = getMatchModes(fd.value as GetOptionIdentifierType<F>, {
      fieldData: fd as F,
    });
  }

  if (matchModes === true) {
    return defaultMatchModes;
  } else if (matchModes === false) {
    return [];
  }

  if (isFlexibleOptionArray(matchModes)) {
    return toFullOptionList(matchModes) as MatchModeOptions;
  }

  return (matchModes?.map(
    mm =>
      defaultMatchModes.find(dmm => dmm.value === lc(mm)) ?? {
        name: mm,
        value: mm,
        label: mm,
      }
  ) ?? []) as MatchModeOptions;
};
