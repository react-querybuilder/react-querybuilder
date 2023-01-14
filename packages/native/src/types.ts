import type {
  QueryBuilderProps,
  RuleGroupType,
  RuleGroupTypeIC,
  RuleProps,
} from '@react-querybuilder/ts';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

export type WrapInStyleProp<K> = { [P in keyof K]?: StyleProp<Required<K>[P]> };

export interface RuleStyles {
  rule?: ViewStyle;
  fieldSelector?: TextStyle;
  fieldOption?: TextStyle;
  operatorSelector?: TextStyle;
  operatorOption?: TextStyle;
  valueSourceSelector?: TextStyle;
  valueSourceOption?: TextStyle;
  value?: TextStyle;
}

export type RuleStyleSheets = WrapInStyleProp<RuleStyles>;

export type RuleNativeProps = RuleProps & {
  styles?: RuleStyles;
};

export type QueryBuilderNativeProps<RG extends RuleGroupType | RuleGroupTypeIC = RuleGroupType> =
  QueryBuilderProps<RG> & {
    styles?: Partial<Record<'thisthing' | 'that', StyleProp<ViewStyle>>>;
  };
