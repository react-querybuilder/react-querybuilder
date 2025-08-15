import { useMemo } from 'react';
import { defaultPlaceholderLabel, defaultPlaceholderName } from '../defaults';
import type {
  BaseOptionMap,
  FlexibleOptionList,
  FlexibleOptionListProp,
  FullOption,
  FullOptionList,
  FullOptionMap,
  FullOptionRecord,
  GetOptionIdentifierType,
  OptionGroup,
  Placeholder,
} from '../types';
import {
  isFlexibleOptionGroupArray,
  objectKeys,
  toFullOption,
  toFullOptionList,
  toFullOptionMap,
  uniqByIdentifier,
  uniqOptGroups,
} from '../utils';

export interface UseOptionListProp<O extends FullOption> {
  defaultOption: FullOption;
  optionList: O[] | OptionGroup<O>[];
  optionsMap: Partial<FullOptionRecord<FullOption>>;
}

export interface UseOptionListPropParams<O extends FullOption> {
  placeholder?: Placeholder;
  optionList?: FlexibleOptionListProp<O> | BaseOptionMap<O>;
  baseOption?: Record<string, unknown>;
  labelMap?: Record<string, string>;
  autoSelectOption?: boolean;
}

export const useOptionListProp = <O extends FullOption>(
  props: UseOptionListPropParams<O>
): UseOptionListProp<O> => {
  type OptionIdentifier = GetOptionIdentifierType<O>;

  // istanbul ignore next
  const {
    optionList: optionListPropOriginal,
    baseOption = {},
    labelMap = {},
    placeholder: {
      placeholderName = defaultPlaceholderName,
      placeholderLabel = defaultPlaceholderLabel,
      placeholderGroupLabel = defaultPlaceholderLabel,
    } = {},
    autoSelectOption = true,
  } = props;

  const defaultOption = useMemo(
    () =>
      ({
        id: placeholderName,
        name: placeholderName,
        value: placeholderName,
        label: placeholderLabel,
      }) as FullOption,
    [placeholderLabel, placeholderName]
  );
  const optionsProp = useMemo(
    () => optionListPropOriginal ?? ([defaultOption] as FlexibleOptionList<O>),
    [defaultOption, optionListPropOriginal]
  );

  const optionList = useMemo((): O[] | OptionGroup<O>[] => {
    const opts = (
      Array.isArray(optionsProp)
        ? toFullOptionList(optionsProp, baseOption, labelMap)
        : (objectKeys(toFullOptionMap(optionsProp, baseOption)) as unknown as OptionIdentifier[])
            .map<
              FullOption<OptionIdentifier>
            >(opt => ({ ...optionsProp[opt]!, name: opt, value: opt }))
            .sort((a, b) => a.label.localeCompare(b.label))
    ) as FullOptionList<O>;
    if (isFlexibleOptionGroupArray(opts)) {
      return autoSelectOption
        ? (uniqOptGroups(opts) as FullOptionList<O>)
        : (uniqOptGroups([
            {
              label: placeholderGroupLabel,
              options: [defaultOption],
            },
            ...opts,
          ]) as FullOptionList<O>);
    } else {
      return autoSelectOption
        ? (uniqByIdentifier(opts as O[]) as FullOptionList<O>)
        : (uniqByIdentifier([defaultOption, ...(opts as O[])]) as FullOptionList<O>);
    }
  }, [autoSelectOption, baseOption, defaultOption, labelMap, optionsProp, placeholderGroupLabel]);

  const optionsMap = useMemo(() => {
    if (!Array.isArray(optionsProp)) {
      const op = toFullOptionMap(optionsProp, baseOption) as FullOptionMap<
        FullOption,
        OptionIdentifier
      >;
      return autoSelectOption ? op : { ...op, [placeholderName]: defaultOption };
    }
    const om: Partial<FullOptionRecord<FullOption>> = {};
    if (isFlexibleOptionGroupArray(optionList)) {
      for (const og of optionList) {
        for (const opt of og.options) {
          om[(opt.value ?? /* istanbul ignore next */ opt.name) as OptionIdentifier] = toFullOption(
            opt,
            baseOption
          ) as FullOption;
        }
      }
    } else {
      for (const opt of optionList) {
        om[(opt.value ?? /* istanbul ignore next */ opt.name) as OptionIdentifier] = toFullOption(
          opt,
          baseOption
        ) as FullOption;
      }
    }
    return om;
  }, [autoSelectOption, baseOption, defaultOption, optionList, optionsProp, placeholderName]);

  return { defaultOption, optionList, optionsMap };
};
