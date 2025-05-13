import type { Column, SQL, Table } from 'drizzle-orm';
import { getOperators } from 'drizzle-orm';
import type { RuleGroupProcessor } from 'react-querybuilder';
import { defaultRuleGroupProcessorDrizzle } from 'react-querybuilder';

/**
 * Given a Drizzle table config, returns a {@link react-querybuilder!index.RuleGroupProcessor RuleGroupProcessor}
 * for use by {@link react-querybuilder!index.formatQuery formatQuery}.
 */
export const generateDrizzleRuleGroupProcessor =
  (columns: Record<string, Column> | Table): RuleGroupProcessor<SQL | undefined> =>
  (ruleGroup, options) =>
    defaultRuleGroupProcessorDrizzle(ruleGroup, options)(
      columns as Record<string, Column>,
      getOperators()
    );
