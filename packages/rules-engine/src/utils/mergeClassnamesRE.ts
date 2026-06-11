import { clsx } from '@react-querybuilder/core';
import type { ClassnamesRE } from '../types';

type MergeClassnamesREParams = (Partial<ClassnamesRE> | undefined)[];

const joinClassnamesByName = (name: keyof ClassnamesRE, args: MergeClassnamesREParams) => {
  let result = '';
  for (let i = 0; i < args.length; i++) {
    const v = args[i]?.[name];
    if (!v) continue;
    // clsx only needed for array/object values; plain strings (common case) pass through
    const s = typeof v === 'string' ? v : clsx(v);
    if (s) result = result ? `${result} ${s}` : s;
  }
  return result;
};

/**
 * Merges a list of partial {@link ClassnamesRE} definitions into a single definition.
 */
export const mergeClassnamesRE = (...args: MergeClassnamesREParams): ClassnamesRE => ({
  rulesEngineBuilder: joinClassnamesByName('rulesEngineBuilder', args),
  rulesEngineHeader: joinClassnamesByName('rulesEngineHeader', args),
  rulesEngineBody: joinClassnamesByName('rulesEngineBody', args),
  consequentBuilder: joinClassnamesByName('consequentBuilder', args),
  consequentBuilderHeader: joinClassnamesByName('consequentBuilderHeader', args),
  consequentBuilderBody: joinClassnamesByName('consequentBuilderBody', args),
  consequentBuilderStandalone: joinClassnamesByName('consequentBuilderStandalone', args),
  conditionBuilder: joinClassnamesByName('conditionBuilder', args),
  conditionBuilderHeader: joinClassnamesByName('conditionBuilderHeader', args),
  conditionBuilderBody: joinClassnamesByName('conditionBuilderBody', args),
  blockLabel: joinClassnamesByName('blockLabel', args),
  blockLabelIf: joinClassnamesByName('blockLabelIf', args),
  blockLabelIfElse: joinClassnamesByName('blockLabelIfElse', args),
  blockLabelElse: joinClassnamesByName('blockLabelElse', args),
  blockLabelThen: joinClassnamesByName('blockLabelThen', args),
  blockLabelWhen: joinClassnamesByName('blockLabelWhen', args),
  blockLabelAlways: joinClassnamesByName('blockLabelAlways', args),
  evaluationMode: joinClassnamesByName('evaluationMode', args),
  shiftActions: joinClassnamesByName('shiftActions', args),
});
