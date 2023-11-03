import { produce } from 'immer';
import type {
  FlexibleOption,
  FullOption,
  FullOptionList,
  Option,
  OptionList,
  ValueOption,
} from '../types';
import { isPojo } from './misc';
import { isOptionGroupArray } from './optGroupUtils';

const isOptionWithName = (opt: FlexibleOption): opt is Option =>
  isPojo(opt) && Object.hasOwn(opt, 'name');

const isOptionWithValue = (opt: FlexibleOption): opt is ValueOption =>
  isPojo(opt) && Object.hasOwn(opt, 'value');

function toFullOption<N extends string = string>(opt: Option<N>): FullOption<N>;
function toFullOption<N extends string = string>(opt: ValueOption<N>): FullOption<N>;
function toFullOption<N extends string = string>(opt: FullOption<N>): FullOption<N>;
function toFullOption<N extends string = string>(opt: any): FullOption<N> {
  const recipe: (o: FlexibleOption) => FullOption<N> = produce(draft => {
    if (isOptionWithName(draft) && !isOptionWithValue(draft)) {
      draft.value = draft.name;
    } else if (!isOptionWithName(draft) && isOptionWithValue(draft)) {
      draft.name = draft.value;
    }
  });
  return recipe(opt);
}

type GetOptionType<OL extends OptionList> = OL extends OptionList<infer Opt> ? Opt : never;

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
