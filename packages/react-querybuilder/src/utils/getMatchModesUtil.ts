import type {
  FlexibleOption,
  FullField,
  GetOptionIdentifierType,
  MatchModeName,
  MatchModeOptions,
  MatchModes,
} from '../types/index.noReact';
import { isFlexibleOptionArray, toFullOption, toFullOptionList } from './optGroupUtils';

const dummyFD = {
  name: 'name',
  value: 'name',
  matchModes: null,
  label: 'label',
};

/**
 * Utility function to get the value sources array for the given
 * field and operator. If the field definition does not define a
 * `matchModes` property, the `getMatchModes` prop is used.
 * Returns `["value"]` by default.
 */
export const getMatchModesUtil = <F extends FullField, O extends string>(
  fieldData: F,
  operator: string | null,
  getMatchModes?: (
    field: GetOptionIdentifierType<F>,
    operator: O | null,
    misc: { fieldData: F }
  ) => boolean | MatchModes | FlexibleOption<MatchModeName>[]
): MatchModeOptions => {
  // TypeScript doesn't allow it directly, but in practice
  // `fieldData` can end up being undefined or null. The nullish
  // coalescing assignment below avoids errors like
  // "TypeError: Cannot read properties of undefined (reading 'name')"
  const fd = fieldData ? toFullOption(fieldData) : /* istanbul ignore else */ dummyFD;

  let matchModes: boolean | MatchModes | FlexibleOption<MatchModeName>[] = false;

  if (fd.matchModes) {
    matchModes = typeof fd.matchModes === 'function' ? fd.matchModes(operator as O) : fd.matchModes;
  }

  if (!fd.matchModes && !!getMatchModes) {
    matchModes = getMatchModes(fd.value as GetOptionIdentifierType<F>, operator as O, {
      fieldData: fd as F,
    });
  }

  if (matchModes === true) {
    matchModes = ['all', 'none', 'some', 'atLeast', 'atMost', 'exactly'];
  } else if (matchModes === false) {
    return [];
  }

  if (isFlexibleOptionArray(matchModes)) {
    return toFullOptionList(matchModes) as MatchModeOptions;
  }

  return matchModes.map(mm => ({ name: mm, value: mm, label: mm })) as MatchModeOptions;
};
