import { Picker } from '@react-native-picker/picker';
import { useMemo } from 'react';
import type { TextStyle, ViewStyle } from 'react-native';
import { Button, StyleSheet, Text, View } from 'react-native';
import type { Combinator, RuleGroupProps } from 'react-querybuilder';
import { useRuleGroup } from 'react-querybuilder';
import type { WrapInStyleProp } from './types';

interface RuleGroupStyles {
  ruleGroup?: ViewStyle;
  ruleGroupHeader?: ViewStyle;
  ruleGroupBody?: ViewStyle;
  combinatorSelector?: TextStyle;
  combinatorOption?: TextStyle;
  inlineCombinator?: TextStyle;
}

type RuleGroupStyleSheets = WrapInStyleProp<RuleGroupStyles>;

type RuleGroupNativeProps = RuleGroupProps & {
  styles?: RuleGroupStyles;
};

const baseStyles: RuleGroupStyles = {
  ruleGroup: {
    borderWidth: 1,
    marginBottom: 10,
  },
  ruleGroupHeader: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingRight: 10,
    paddingLeft: 10,
  },
  ruleGroupBody: {
    paddingTop: 10,
    paddingRight: 10,
    paddingLeft: 10,
  },
  combinatorSelector: {
    height: 30,
    width: 50,
  },
};

export const RuleGroupNative = (props: RuleGroupNativeProps) => {
  const rg = { ...props, ...useRuleGroup(props) };

  const {
    schema: {
      controls: { rule: RuleComponent, ruleGroup: RuleGroupComponent },
    },
  } = rg;

  const styles = useMemo(
    (): RuleGroupStyleSheets => ({
      ruleGroup: StyleSheet.flatten([baseStyles.ruleGroup, props.styles?.ruleGroup]),
      ruleGroupHeader: StyleSheet.flatten([
        baseStyles.ruleGroupHeader,
        props.styles?.ruleGroupHeader,
      ]),
      ruleGroupBody: StyleSheet.flatten([baseStyles.ruleGroupBody, props.styles?.ruleGroupBody]),
      combinatorSelector: StyleSheet.flatten([
        baseStyles.combinatorSelector,
        props.styles?.combinatorSelector,
      ]),
      combinatorOption: StyleSheet.flatten([
        baseStyles.combinatorOption,
        props.styles?.combinatorOption,
      ]),
      inlineCombinator: StyleSheet.flatten([
        baseStyles.inlineCombinator,
        props.styles?.inlineCombinator,
      ]),
    }),
    [props.styles]
  );

  return (
    <View style={styles.ruleGroup}>
      <View style={styles.ruleGroupHeader}>
        <Picker
          style={styles.combinatorSelector}
          itemStyle={styles.combinatorOption}
          selectedValue={rg.combinator}
          onValueChange={v => rg.onCombinatorChange(v)}>
          {(rg.schema.combinators as Combinator[]).map(c => (
            <Picker.Item key={c.name} label={c.label} value={c.name} />
          ))}
        </Picker>
        <Button title={props.translations.addRule.label!} onPress={e => rg.addRule(e)} />
        <Button title={props.translations.addGroup.label!} onPress={e => rg.addGroup(e)} />
        {rg.path.length > 0 && (
          <Button title={props.translations.removeGroup.label!} onPress={e => rg.removeGroup(e)} />
        )}
      </View>
      <View style={styles.ruleGroupBody}>
        {rg.ruleGroup.rules.map((r, idx) =>
          typeof r === 'string' ? (
            <Text style={styles.inlineCombinator} key={rg.path.join('-')}>
              {r}
            </Text>
          ) : 'rules' in r ? (
            <RuleGroupComponent
              key={r.id}
              ruleGroup={r}
              path={[...rg.path, idx]}
              translations={rg.translations}
              schema={rg.schema}
              actions={rg.actions}
            />
          ) : (
            <RuleComponent
              key={r.id}
              rule={r}
              path={[...rg.path, idx]}
              translations={rg.translations}
              schema={rg.schema}
              actions={rg.actions}
            />
          )
        )}
      </View>
    </View>
  );
};
