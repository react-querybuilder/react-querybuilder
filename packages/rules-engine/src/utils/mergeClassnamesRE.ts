import { clsx } from '@react-querybuilder/core';
import type { ClassnamesRE } from '../types';

type MergeClassnamesREParams = (Partial<ClassnamesRE> | undefined)[];

const joinClassnamesByName = (name: keyof ClassnamesRE, args: MergeClassnamesREParams) =>
  clsx(args.map(c => clsx(c?.[name])));

/**
 * Merges a list of partial {@link ClassnamesRE} definitions into a single definition.
 */
export const mergeClassnamesRE = (...args: MergeClassnamesREParams): ClassnamesRE => ({
  rulesEngineBuilder: joinClassnamesByName('rulesEngineBuilder', args),
  rulesEngineHeader: joinClassnamesByName('rulesEngineHeader', args),
  blockLabel: joinClassnamesByName('blockLabel', args),
  consequentBuilder: joinClassnamesByName('consequentBuilder', args),
  consequentBuilderHeader: joinClassnamesByName('consequentBuilderHeader', args),
  consequentBuilderBody: joinClassnamesByName('consequentBuilderBody', args),
  consequentBuilderStandalone: joinClassnamesByName('consequentBuilderStandalone', args),
  conditionBuilder: joinClassnamesByName('conditionBuilder', args),
  conditionBuilderHeader: joinClassnamesByName('conditionBuilderHeader', args),
});
