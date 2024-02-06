import { produce } from 'immer';
import type {
  FlexibleOption,
  FlexibleOptionList,
  FlexibleOptionMap,
  FullOption,
  FullOptionList,
  FullOptionMap,
  Option,
  ToFullOption,
  ValueOption,
} from '../types';
import { isPojo } from './misc';
import { isFlexibleOptionGroupArray } from './optGroupUtils';

const isOptionWithName = (opt: FlexibleOption): opt is Option =>
  isPojo(opt) && 'name' in opt && typeof opt.name === 'string';
const isOptionWithValue = (opt: FlexibleOption): opt is ValueOption =>
  isPojo(opt) && 'value' in opt && typeof opt.value === 'string';

/**
 * Converts an {@link Option} or {@link FlexibleOption} into a {@link FullOption}.
 * Full options are left unchanged.
 */
function toFullOption<N extends string>(opt: FlexibleOption<N>): FullOption<N> {
  const recipe: (o: FlexibleOption) => FullOption<N> = produce(draft => {
    if (isOptionWithName(draft) && !isOptionWithValue(draft)) {
      draft.value = draft.name;
    } else if (!isOptionWithName(draft) && isOptionWithValue(draft)) {
      draft.name = draft.value;
    }
  });
  return recipe(opt);
}

/**
 * Converts an {@link OptionList} or {@link FlexibleOptionList} into a {@link FullOptionList}.
 * Lists of full options are left unchanged.
 */
function toFullOptionList<Opt extends FlexibleOption, OptList extends FlexibleOptionList<Opt>>(
  optList: OptList
): FullOptionList<Opt> {
  if (!Array.isArray(optList)) {
    return [] as unknown as FullOptionList<Opt>;
  }

  const recipe: (ol: FlexibleOptionList<FlexibleOption>) => FullOptionList<Opt> = produce(draft => {
    if (isFlexibleOptionGroupArray(draft)) {
      for (const optGroup of draft) {
        optGroup.options.forEach((opt, idx) => (optGroup.options[idx] = toFullOption(opt)));
      }
    } else {
      draft.forEach((opt, idx) => (draft[idx] = toFullOption(opt)));
    }
  });

  return recipe(optList);
}

/**
 * Converts a {@link FlexibleOptionList} into a {@link FullOptionList}.
 * Lists of full options are left unchanged.
 */
function toFullOptionMap<OptMap extends FlexibleOptionMap<FlexibleOption>>(
  optMap: OptMap
): OptMap extends FlexibleOptionMap<infer V, infer K> ? FullOptionMap<ToFullOption<V>, K> : never {
  type K = OptMap extends FlexibleOptionMap<any, infer KT> ? KT : never;
  type V = OptMap extends FlexibleOptionMap<infer VT> ? VT : never;

  return Object.fromEntries(
    (Object.entries(optMap) as [K, V][]).map(([k, v]) => [k, toFullOption(v)])
  ) as OptMap extends FlexibleOptionMap<infer V, infer K>
    ? FullOptionMap<ToFullOption<V>, K>
    : never;
}

export { toFullOption, toFullOptionList, toFullOptionMap };
