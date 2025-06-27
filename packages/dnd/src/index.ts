// Legacy exports
export * from './InlineCombinatorDnD';
export * from './QueryBuilderDnD';
export * from './RuleDnD';
export * from './RuleGroupDnD';
export * from './types';

// Library-agnostic exports
export * from './dnd-core';
export * from './hooks/useDndAdapter';
export { QueryBuilderDnD as QueryBuilderDnDNew } from './QueryBuilderDnDNew';
export { RuleDnD as RuleDnDNew } from './RuleDnDNew';

// Helper functions for migration
export { createDndConfig, migrateFromReactDnd } from './utils/migration';
