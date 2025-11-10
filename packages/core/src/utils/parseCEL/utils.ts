import type { DefaultCombinatorName, DefaultOperatorName } from '../../types';
import type {
  CELAddition,
  CELBooleanLiteral,
  CELBytesLiteral,
  CELConditionalAnd,
  CELConditionalExpr,
  CELConditionalOr,
  CELDivision,
  CELDynamicPropertyAccessor,
  CELExpression,
  CELExpressionGroup,
  CELExpressionList,
  CELFieldInit,
  CELFieldInits,
  CELFieldsObject,
  CELFloatLiteral,
  CELFunctionCall,
  CELIdentifier,
  CELIntegerLiteral,
  CELLikeExpression,
  CELList,
  CELLiteral,
  CELMap,
  CELMapInit,
  CELMapInits,
  CELMember,
  CELMemberIdentifierChain,
  CELMemberNegatedIdentifier,
  CELMemberNegatedIdentifierChain,
  CELModulo,
  CELMultiplication,
  CELNegatedLikeExpression,
  CELNegatedSubqueryExpression,
  CELNegation,
  CELNegative,
  CELNullLiteral,
  CELNumericLiteral,
  CELPrimary,
  CELProperty,
  CELRelation,
  CELRelop,
  CELStringLiteral,
  CELSubqueryExpression,
  CELSubtraction,
  CELUnsignedIntegerLiteral,
} from './types';

export const isCELExpressionGroup = (expr: CELExpression): expr is CELExpressionGroup =>
  expr.type === 'ExpressionGroup';
export const isCELConditionalAnd = (expr: CELExpression): expr is CELConditionalAnd =>
  expr.type === 'ConditionalAnd';
export const isCELConditionalOr = (expr: CELExpression): expr is CELConditionalOr =>
  expr.type === 'ConditionalOr';
export const isCELStringLiteral = (expr: CELExpression): expr is CELStringLiteral =>
  expr.type === 'StringLiteral';
export const isCELLiteral = (expr: CELExpression): expr is CELLiteral =>
  isCELNumericLiteral(expr) ||
  isCELStringLiteral(expr) ||
  isCELBooleanLiteral(expr) ||
  isCELNullLiteral(expr) ||
  isCELBytesLiteral(expr);
export const isCELNumericLiteral = (expr: CELExpression): expr is CELNumericLiteral =>
  isCELFloatLiteral(expr) || isCELIntegerLiteral(expr) || isCELUnsignedIntegerLiteral(expr);
export const isCELRelation = (expr: CELExpression): expr is CELRelation => expr.type === 'Relation';
export const isCELList = (expr: CELExpression): expr is CELList => expr.type === 'List';
export const isCELMap = (expr: CELExpression): expr is CELMap => expr.type === 'Map';
export const isCELIdentifier = (expr: CELExpression): expr is CELIdentifier =>
  expr.type === 'Identifier';
export const isCELNegation = (expr: CELExpression): expr is CELNegation => expr.type === 'Negation';
export const isCELMember = (expr: CELExpression): expr is CELMember => expr.type === 'Member';

// istanbul ignore next
export const isCELAddition = (expr: CELExpression): expr is CELAddition => expr.type === 'Addition';
export const isCELBooleanLiteral = (expr: CELExpression): expr is CELBooleanLiteral =>
  expr.type === 'BooleanLiteral';
export const isCELBytesLiteral = (expr: CELExpression): expr is CELBytesLiteral =>
  expr.type === 'BytesLiteral';
// istanbul ignore next
export const isCELConditionalExpr = (expr: CELExpression): expr is CELConditionalExpr =>
  expr.type === 'ConditionalExpr';
// istanbul ignore next
export const isCELDivision = (expr: CELExpression): expr is CELDivision => expr.type === 'Division';
// istanbul ignore next
export const isCELDynamicPropertyAccessor = (
  expr: CELExpression
): expr is CELDynamicPropertyAccessor => expr.type === 'DynamicPropertyAccessor';
// istanbul ignore next
export const isCELExpressionList = (expr: CELExpression): expr is CELExpressionList =>
  expr.type === 'ExpressionList';
// istanbul ignore next
export const isCELFieldInit = (expr: CELExpression): expr is CELFieldInit =>
  expr.type === 'FieldInit';
// istanbul ignore next
export const isCELFieldInits = (expr: CELExpression): expr is CELFieldInits =>
  expr.type === 'FieldInits';
// istanbul ignore next
export const isCELFieldsObject = (expr: CELExpression): expr is CELFieldsObject =>
  expr.type === 'FieldsObject';
export const isCELFloatLiteral = (expr: CELExpression): expr is CELFloatLiteral =>
  expr.type === 'FloatLiteral';
// istanbul ignore next
export const isCELFunctionCall = (expr: CELExpression): expr is CELFunctionCall =>
  expr.type === 'FunctionCall';
export const isCELIntegerLiteral = (expr: CELExpression): expr is CELIntegerLiteral =>
  expr.type === 'IntegerLiteral';
// istanbul ignore next
export const isCELMapInit = (expr: CELExpression): expr is CELMapInit => expr.type === 'MapInit';
// istanbul ignore next
export const isCELMapInits = (expr: CELExpression): expr is CELMapInits => expr.type === 'MapInits';
// istanbul ignore next
export const isCELModulo = (expr: CELExpression): expr is CELModulo => expr.type === 'Modulo';
// istanbul ignore next
export const isCELMultiplication = (expr: CELExpression): expr is CELMultiplication =>
  expr.type === 'Multiplication';
// istanbul ignore next
export const isCELNegative = (expr: CELExpression): expr is CELNegative => expr.type === 'Negative';
export const isCELNullLiteral = (expr: CELExpression): expr is CELNullLiteral =>
  expr.type === 'NullLiteral';
// istanbul ignore next
export const isCELProperty = (expr: CELExpression): expr is CELProperty => expr.type === 'Property';
// istanbul ignore next
export const isCELSubtraction = (expr: CELExpression): expr is CELSubtraction =>
  expr.type === 'Subtraction';
export const isCELUnsignedIntegerLiteral = (
  expr: CELExpression
): expr is CELUnsignedIntegerLiteral => expr.type === 'UnsignedIntegerLiteral';

export const isCELIdentifierOrChain = (
  expr: CELExpression
): expr is CELMemberIdentifierChain | CELIdentifier | CELDynamicPropertyAccessor =>
  isCELIdentifier(expr) ||
  isCELDynamicPropertyAccessor(expr) ||
  (isCELMember(expr) &&
    !!expr.left &&
    !!expr.right &&
    !expr.list &&
    !expr.value &&
    isCELIdentifierOrChain(expr.left) &&
    isCELIdentifier(expr.right));

export const isCELNegatedIdentifier = (expr: CELExpression): expr is CELMemberNegatedIdentifier =>
  isCELNegation(expr) && isCELIdentifier(expr.value);

export const isCELNegatedIdentifierOrChain = (
  expr: CELExpression
): expr is CELMemberNegatedIdentifierChain | CELMemberNegatedIdentifier =>
  isCELNegatedIdentifier(expr) ||
  (isCELMember(expr) &&
    !!expr.left &&
    !!expr.right &&
    !expr.list &&
    !expr.value &&
    isCELIdentifierOrChain(expr.right) &&
    isCELNegatedIdentifier(expr.left));

export const isCELLikeExpression = (expr: CELExpression): expr is CELLikeExpression =>
  isCELMember(expr) &&
  !!expr.left &&
  !!expr.right &&
  !!expr.list &&
  isCELIdentifierOrChain(expr.left) &&
  isCELIdentifier(expr.right) &&
  (expr.right.value === 'contains' ||
    expr.right.value === 'startsWith' ||
    expr.right.value === 'endsWith') &&
  expr.list.value.length === 1 &&
  (isCELStringLiteral(expr.list.value[0]) || isCELIdentifier(expr.list.value[0]));

export const isCELNegatedLikeExpression = (expr: CELExpression): expr is CELNegatedLikeExpression =>
  isCELMember(expr) &&
  !!expr.left &&
  !!expr.right &&
  !!expr.list &&
  isCELNegatedIdentifierOrChain(expr.left) &&
  isCELIdentifier(expr.right) &&
  (expr.right.value === 'contains' ||
    expr.right.value === 'startsWith' ||
    expr.right.value === 'endsWith') &&
  expr.list.value.length === 1 &&
  (isCELStringLiteral(expr.list.value[0]) || isCELIdentifier(expr.list.value[0]));

export const isCELSubqueryExpression = (expr: CELExpression): expr is CELSubqueryExpression =>
  isCELMember(expr) &&
  !!expr.left &&
  !!expr.right &&
  !!expr.list &&
  isCELIdentifierOrChain(expr.left) &&
  isCELIdentifier(expr.right) &&
  (expr.right.value === 'all' || expr.right.value === 'exists') &&
  expr.list.value.length >= 2;

export const isCELNegatedSubqueryExpression = (
  expr: CELExpression
): expr is CELNegatedSubqueryExpression =>
  isCELMember(expr) &&
  !!expr.left &&
  !!expr.right &&
  !!expr.list &&
  isCELNegatedIdentifierOrChain(expr.left) &&
  isCELIdentifier(expr.right) &&
  (expr.right.value === 'all' || expr.right.value === 'exists') &&
  expr.list.value.length >= 2;

export const extractSubqueryComponents = (
  expr: CELMember
): {
  field: string;
  method: 'all' | 'exists';
  alias: string | null;
  condition: CELExpression;
} | null => {
  // istanbul ignore next
  if (!isCELSubqueryExpression(expr)) {
    return null;
  }

  const field = getCELIdentifierFromChain(expr.left! as CELIdentifier | CELMemberIdentifierChain);
  const method = expr.right!.value as 'all' | 'exists';
  const [aliasExpr, conditionExpr] = expr.list!.value;

  const alias = isCELIdentifier(aliasExpr) ? aliasExpr.value : /* istanbul ignore next */ null;

  return {
    field,
    method,
    alias,
    condition: conditionExpr,
  };
};

export const getCELIdentifierFromChain = (
  expr: CELIdentifier | CELMemberIdentifierChain | CELDynamicPropertyAccessor | CELMember
): string => {
  if (isCELIdentifier(expr)) {
    return expr.value;
  }

  if (isCELDynamicPropertyAccessor(expr)) {
    const leftField = getCELIdentifierFromChain(expr.left);
    // Handle string literals in bracket notation
    // istanbul ignore else
    if (isCELStringLiteral(expr.right)) {
      const propertyName = evalCELLiteralValue(expr.right);
      return `${leftField}["${propertyName}"]`;
    }
    // For non-string literals, use a fallback approach
    // istanbul ignore next
    return `${leftField}[${expr.right.type}]`;
  }

  // istanbul ignore else
  if (
    expr.left &&
    expr.right &&
    isCELIdentifier(expr.right) &&
    (isCELIdentifier(expr.left) ||
      isCELMember(expr.left) ||
      isCELDynamicPropertyAccessor(expr.left))
  ) {
    return `${getCELIdentifierFromChain(expr.left)}.${expr.right.value}`;
  }

  // Fallback for other CELMember types
  // istanbul ignore next
  return expr.type;
};

export const getCELIdentifierFromNegatedChain = (
  expr: CELMemberNegatedIdentifier | CELMemberNegatedIdentifierChain
): string => {
  if (isCELNegatedIdentifier(expr)) {
    return `${``.padStart(expr.negations, `!`)}${expr.value.value}`;
  }

  return `${getCELIdentifierFromNegatedChain(expr.left)}.${expr.right.value}`;
};

export function evalCELLiteralValue(literal: CELStringLiteral): string;
export function evalCELLiteralValue(literal: CELBooleanLiteral): boolean;
export function evalCELLiteralValue(literal: CELNumericLiteral): number | null;
export function evalCELLiteralValue(literal: CELBytesLiteral): null;
export function evalCELLiteralValue(literal: CELNullLiteral): null;
export function evalCELLiteralValue(literal: CELLiteral): string | boolean | number | null;
export function evalCELLiteralValue(literal: CELLiteral) {
  switch (literal.type) {
    case 'StringLiteral': {
      return literal.value.replaceAll(/^((?:'''|"""|'|")?)([\S\s]*?)\1$/gm, '$2');
    }
    case 'BooleanLiteral': {
      return literal.value;
    }
    case 'NullLiteral':
    case 'BytesLiteral': {
      return null;
    }
    default:
      return literal.value;
  }
}

export const celNormalizeCombinator = (c: '&&' | '||'): DefaultCombinatorName =>
  c === '||' ? 'or' : 'and';

export const celNormalizeOperator = (op: CELRelop, flip?: boolean): DefaultOperatorName => {
  if (flip) {
    if (op === '<') return '>';
    if (op === '<=') return '>=';
    if (op === '>') return '<';
    if (op === '>=') return '<=';
  }
  if (op === '==') return '=';
  return op;
};

export const celGenerateFlatAndOrList = (
  expr: CELConditionalAnd | CELConditionalOr
): (DefaultCombinatorName | CELExpression)[] => {
  const combinator = celNormalizeCombinator(expr.type === 'ConditionalAnd' ? '&&' : '||');
  const { left, right } = expr;
  if (isCELConditionalAnd(left) || isCELConditionalOr(left)) {
    return [...celGenerateFlatAndOrList(left), combinator, right];
  }
  return [left, combinator, right];
};

export const celGenerateMixedAndOrList = (
  expr: CELConditionalAnd | CELConditionalOr
): (DefaultCombinatorName | CELExpression | ('and' | CELExpression)[])[] => {
  const arr = celGenerateFlatAndOrList(expr);
  const returnArray: (DefaultCombinatorName | CELExpression | ('and' | CELExpression)[])[] = [];
  let startIndex = 0;
  for (let i = 0; i < arr.length; i += 2) {
    if (arr[i + 1] === 'and') {
      startIndex = i;
      let j = 1;
      while (arr[startIndex + j] === 'and') {
        i += 2;
        j += 2;
      }
      const tempAndArray = arr.slice(startIndex, i + 1) as ('and' | CELExpression)[];
      returnArray.push(tempAndArray);
      i -= 2;
    } else if (arr[i + 1] === 'or') {
      if (i === 0 || i === arr.length - 3) {
        if (i === 0 || arr[i - 1] === 'or') {
          returnArray.push(arr[i]);
        }
        returnArray.push(arr[i + 1]);
        if (i === arr.length - 3) {
          returnArray.push(arr[i + 2]);
        }
      } else {
        if (arr[i - 1] === 'and') {
          returnArray.push(arr[i + 1]);
        } else {
          returnArray.push(arr[i], arr[i + 1]);
        }
      }
    }
  }
  if (returnArray.length === 1 && Array.isArray(returnArray[0])) {
    // If length is 1, then the only element is an AND array so just return that
    return returnArray[0];
  }
  return returnArray;
};

const isPrimitiveArrayUsage = (expr: CELExpression, alias: string | null): boolean => {
  // istanbul ignore next
  if (!alias) return false;

  // Check if alias is used alone (e.g., "score > 90" where "score" is the alias)
  if (isCELIdentifier(expr) && expr.value === alias) {
    return true;
  }

  // Check if alias is used with primitive operators (contains, startsWith, endsWith)
  if (isCELLikeExpression(expr) && isCELIdentifier(expr.left) && expr.left.value === alias) {
    return true;
  }

  // Recursively check relations for primitive usage and conditional expressions
  if (isCELRelation(expr) || isCELConditionalAnd(expr) || isCELConditionalOr(expr)) {
    return isPrimitiveArrayUsage(expr.left, alias) || isPrimitiveArrayUsage(expr.right, alias);
  }

  // istanbul ignore next
  if (isCELExpressionGroup(expr) || isCELNegation(expr)) {
    return isPrimitiveArrayUsage(expr.value, alias);
  }

  return false;
};

const transformAliasInExpressionInternal = (
  expr: CELExpression,
  alias: string | null,
  isPrimitive: boolean
): CELExpression => {
  // istanbul ignore next
  if (!alias) return expr;

  // If it's an identifier that matches the alias
  if (isCELIdentifier(expr) && expr.value === alias) {
    return { type: 'Identifier', value: '' } as CELIdentifier;
  }

  // If it's a member expression starting with the alias, remove the alias part
  if (isCELMember(expr) && expr.left && isCELIdentifier(expr.left) && expr.left.value === alias) {
    // For object arrays: "alias.property" becomes "property"
    // For primitive arrays: this shouldn't happen as we should have caught it above
    if (expr.right && isCELIdentifier(expr.right) && !isPrimitive) {
      // If this is a method call (has a list), preserve the Member structure
      if (expr.list) {
        return {
          type: 'Member',
          left: { type: 'Identifier', value: '' },
          right: expr.right,
          list: expr.list,
        } as CELMember;
      }
      return expr.right;
    }
  }

  // Handle CEL like expressions (e.g., "alias.contains('test')")
  if (isCELLikeExpression(expr) && isCELIdentifier(expr.left) && expr.left.value === alias) {
    // Transform "alias.contains('test')" to just "contains('test')" with empty field
    // Keep it as a Member type but replace the left side with empty identifier
    return {
      type: 'Member',
      left: { type: 'Identifier', value: '' },
      right: expr.right,
      list: expr.list,
    } as CELMember;
  }

  // Handle negated like expressions
  if (
    isCELNegatedLikeExpression(expr) &&
    expr.left &&
    isCELNegatedIdentifier(expr.left) &&
    expr.left.value.value === alias
  ) {
    return {
      type: 'Member',
      left: {
        type: 'Negation',
        negations: expr.left.negations,
        value: { type: 'Identifier', value: '' },
      },
      right: expr.right,
      list: expr.list,
    } as CELMember;
  }

  // If it's a member chain like "alias.prop1.prop2", transform to "prop1.prop2"
  if (isCELMember(expr) && expr.left && expr.right) {
    const transformedLeft = transformAliasInExpressionInternal(expr.left, alias, isPrimitive);
    // istanbul ignore else
    if (transformedLeft !== expr.left) {
      return {
        type: 'Member',
        left: transformedLeft as CELPrimary | CELMember,
        right: expr.right,
        list: expr.list,
        value: expr.value,
      } as CELMember;
    }
  }

  // For other expression types, recursively transform child expressions
  if (isCELRelation(expr)) {
    return {
      type: 'Relation',
      left: transformAliasInExpressionInternal(expr.left, alias, isPrimitive),
      right: transformAliasInExpressionInternal(expr.right, alias, isPrimitive),
      operator: expr.operator,
    } as CELRelation;
  }

  if (isCELConditionalAnd(expr)) {
    return {
      type: 'ConditionalAnd',
      left: transformAliasInExpressionInternal(expr.left, alias, isPrimitive),
      right: transformAliasInExpressionInternal(expr.right, alias, isPrimitive),
    } as CELConditionalAnd;
  }

  if (isCELConditionalOr(expr)) {
    return {
      type: 'ConditionalOr',
      left: transformAliasInExpressionInternal(expr.left, alias, isPrimitive),
      right: transformAliasInExpressionInternal(expr.right, alias, isPrimitive),
    } as CELConditionalOr;
  }

  if (isCELExpressionGroup(expr)) {
    return {
      type: 'ExpressionGroup',
      value: transformAliasInExpressionInternal(expr.value, alias, isPrimitive),
    } as CELExpressionGroup;
  }

  if (isCELNegation(expr)) {
    return {
      type: 'Negation',
      negations: expr.negations,
      value: transformAliasInExpressionInternal(expr.value, alias, isPrimitive) as CELPrimary,
    } as CELNegation;
  }

  return expr;
};

export const transformAliasInExpression = (
  expr: CELExpression,
  alias: string | null
): CELExpression => {
  // istanbul ignore next
  if (!alias) return expr;

  const isPrimitive = isPrimitiveArrayUsage(expr, alias);
  return transformAliasInExpressionInternal(expr, alias, isPrimitive);
};
