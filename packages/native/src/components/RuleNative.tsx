import * as React from 'react';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { FullField } from 'react-querybuilder';
import { RuleComponents, RuleComponentsWithSubQuery, TestID, useRule } from 'react-querybuilder';
import { defaultNativeStyles } from '../styles';
import type { RuleNativeProps, SchemaNative } from '../types';

const GroupComponentsWrapper = (props: React.PropsWithChildren) => <View {...props} />;

/**
 * @group Components
 */
export const RuleNative = (props: RuleNativeProps): React.JSX.Element => {
  const r = useRule(props);
  const schema = r.schema as SchemaNative<FullField, string>;

  const styles = useMemo(
    () => ({ rule: StyleSheet.flatten([defaultNativeStyles.rule, schema.styles?.rule]) }),
    [schema.styles?.rule]
  );

  return (
    <View style={styles.rule} testID={TestID.rule}>
      {r.matchModes.length > 0 ? (
        <RuleComponentsWithSubQuery {...r} groupComponentsWrapper={GroupComponentsWrapper} />
      ) : (
        <RuleComponents {...r} />
      )}
    </View>
  );
};
