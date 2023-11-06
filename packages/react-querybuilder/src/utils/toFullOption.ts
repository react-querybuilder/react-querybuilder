import { produce } from 'immer';
import type {
  FlexibleOption,
  FlexibleOptionList,
  FullOption,
  FullOptionList,
  Option,
  OptionList,
  ValueOption,
} from '../types';
import { isOptionGroupArray } from './optGroupUtils';

const isOptionWithName = (opt: FlexibleOption): opt is Option => Object.hasOwn(opt, 'name');
const isOptionWithValue = (opt: FlexibleOption): opt is ValueOption => Object.hasOwn(opt, 'value');

/**
 * Converts an {@link Option} or {@link FlexibleOption} into a {@link FullOption}.
 * Full options are left unchanged.
 */
function toFullOption<N extends string = string>(
  opt: Option<N> | ValueOption<N> | FullOption<N>
): FullOption<N> {
  const recipe: (o: FlexibleOption) => FullOption<N> = produce(draft => {
    if (isOptionWithName(draft) && !isOptionWithValue(draft)) {
      draft.value = draft.name;
    } else if (!isOptionWithName(draft) && isOptionWithValue(draft)) {
      draft.name = draft.value;
    }
  });
  return recipe(opt);
}

type GetOptionType<OL extends FlexibleOptionList> = OL extends OptionList<infer Opt> ? Opt : never;

/**
 * Converts an {@link OptionList} or {@link FlexibleOptionList} into a {@link FullOptionList}.
 * Lists of full options are left unchanged.
 */
function toFullOptionList<OptList extends OptionList = OptionList>(
  optList: OptList
): FullOptionList<GetOptionType<OptList>>;
function toFullOptionList<OptList extends FlexibleOptionList = FlexibleOptionList>(
  optList: OptList
): FullOptionList<GetOptionType<OptList>>;
function toFullOptionList<OptList extends OptionList = OptionList>(
  optList: OptList
): FullOptionList<GetOptionType<OptList>> {
  if (!Array.isArray(optList)) {
    return [];
  }

  const recipe: (ol: OptionList) => FullOptionList = produce(draft => {
    if (isOptionGroupArray(draft)) {
      for (const optGroup of draft) {
        optGroup.options.forEach((opt, idx) => (optGroup.options[idx] = toFullOption(opt)));
      }
    } else {
      draft.forEach((opt, idx) => (draft[idx] = toFullOption(opt)));
    }
  });

  return recipe(optList) as FullOptionList<GetOptionType<OptList>>;
}

export { toFullOption, toFullOptionList };
