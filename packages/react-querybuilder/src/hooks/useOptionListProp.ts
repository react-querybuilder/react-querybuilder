import type {
  FullOption,
  PreparedOptionList,
  PrepareOptionListParams,
} from '@react-querybuilder/core';
import { prepareOptionList } from '@react-querybuilder/core';
import { useMemo } from 'react';

export interface UseOptionListProp<O extends FullOption> extends PreparedOptionList<O> {}

export interface UseOptionListPropParams<O extends FullOption> extends PrepareOptionListParams<O> {}

/**
 * @group Hooks
 * @deprecated Memoize the result of `prepareOptionList` instead.
 */
// istanbul ignore next
export const useOptionListProp = <O extends FullOption>(
  props: UseOptionListPropParams<O>
): UseOptionListProp<O> =>
  useMemo(
    () => prepareOptionList(props),
    // oxlint-disable-next-line exhaustive-deps
    Object.values(props)
  );

// // "Enumerated props" version:
// export const useOptionListProp = <O extends FullOption>(
//   props: UseOptionListPropParams<O>
// ): UseOptionListProp<O> => {
//   const { placeholder, optionList, baseOption, labelMap, autoSelectOption } = props;
//   return useMemo(
//     () =>
//       prepareOptionList({
//         placeholder,
//         optionList,
//         baseOption,
//         labelMap,
//         autoSelectOption,
//       }),
//     [placeholder, optionList, baseOption, labelMap, autoSelectOption]
//   );
// };
