// Type-only assertions guarding the local structural stand-ins for optional peer dependencies
// against upstream drift. This file has no runtime code; it exists to be typechecked.
import type { Operators, SQL } from 'drizzle-orm';
import type { WhereOptions } from 'sequelize';
import type {
  DrizzleOperatorsLike,
  DrizzleWhereCallback,
} from '../defaultRuleGroupProcessorDrizzle';
import type { SequelizeWhereOptionsLike } from '../defaultRuleGroupProcessorSequelize';

// Drizzle's real `Operators` satisfies the local stand-in...
export type _DrizzleOpsAssignable = Operators extends DrizzleOperatorsLike ? true : never;
const _drizzleOps: DrizzleOperatorsLike = {} as Operators;

// ...and the callback's inferred return type is still Drizzle's own `SQL`.
declare const drizzleWhere: DrizzleWhereCallback;
const _drizzleReturn: SQL | undefined = drizzleWhere({}, {} as Operators);

// Only the RQB → Sequelize direction must hold: the stand-in is deliberately loose.
const _sequelizeWhere: WhereOptions = {} as SequelizeWhereOptionsLike;

export type _Unused = [typeof _drizzleOps, typeof _drizzleReturn, typeof _sequelizeWhere];
