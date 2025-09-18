import type { RuleGroupProcessor } from '@react-querybuilder/core';
import { defaultRuleGroupProcessorDrizzle } from '@react-querybuilder/core';
import type { Column, SQL, Table } from 'drizzle-orm';
import { getOperators } from 'drizzle-orm';

/**
 * Given a Drizzle table config, returns a {@link @react-querybuilder/core!.RuleGroupProcessor RuleGroupProcessor}
 * for use by {@link @react-querybuilder/core!.formatQuery formatQuery}.
 */
export const generateDrizzleRuleGroupProcessor =
  (columns: Record<string, Column> | Table): RuleGroupProcessor<SQL | undefined> =>
  (ruleGroup, options) =>
    defaultRuleGroupProcessorDrizzle(ruleGroup, options)(
      columns as Record<string, Column>,
      getOperators()
    );
