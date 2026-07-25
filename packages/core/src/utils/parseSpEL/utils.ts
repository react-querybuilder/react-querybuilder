import type { DefaultCombinatorName, DefaultOperatorName } from '../../types';
import type {
  SpELBaseNode,
  SpELBetweenFields,
  SpELBetweenValues,
  SpELBooleanLiteral,
  SpELCompoundNode,
  SpELExpressionNode,
  SpELIdentifier,
  SpELListNode,
  SpELMethodCall,
  SpELMethodNode,
  SpELNodeType,
  SpELNullLiteral,
  SpELNumericLiteral,
  SpELOpAnd,
  SpELOpMatches,
  SpELOpOr,
  SpELPrimitive,
  SpELProcessedExpression,
  SpELPropertyNode,
  SpELQualifiedIdentifierNode,
  SpELRelOpType,
  SpELRelation as SpELRelationOp,
  SpELStringLiteral,
} from './types';

export const isSpELPropertyNode = (expr: SpELBaseNode<SpELNodeType>): expr is SpELPropertyNode => {
  return expr.getType() === 'property' || expr.getType() === 'variable';
};
export const isSpELCompoundNode = (expr: SpELBaseNode<SpELNodeType>): expr is SpELCompoundNode => {
  return expr.getType() === 'compound' && expr.getChildren().every(c => isSpELPropertyNode(c));
};
export const isSpELListNode = (expr: SpELBaseNode<SpELNodeType>): expr is SpELListNode => {
  return expr.getType() === 'list';
};

export const isSpELOpAnd = (expr: SpELProcessedExpression): expr is SpELOpAnd =>
  expr.type === 'op-and';
export const isSpELOpOr = (expr: SpELProcessedExpression): expr is SpELOpOr =>
  expr.type === 'op-or';
export const isSpELOpMatches = (expr: SpELProcessedExpression): expr is SpELOpMatches =>
  expr.type === 'matches' &&
  ((isSpELIdentifier(expr.children[0]) && isSpELStringLiteral(expr.children[1])) ||
    (isSpELIdentifier(expr.children[1]) && isSpELStringLiteral(expr.children[0])) ||
    (isSpELIdentifier(expr.children[0]) && isSpELIdentifier(expr.children[1])));
export const isSpELIdentifier = (expr: SpELProcessedExpression): expr is SpELIdentifier =>
  (expr.type === 'property' || expr.type === 'variable' || expr.type === 'compound') &&
  expr.identifier !== null;
export const isSpELStringLiteral = (expr: SpELProcessedExpression): expr is SpELStringLiteral =>
  expr.type === 'string';
export const isSpELNumericLiteral = (expr: SpELProcessedExpression): expr is SpELNumericLiteral =>
  expr.type === 'number';
export const isSpELBooleanLiteral = (expr: SpELProcessedExpression): expr is SpELBooleanLiteral =>
  expr.type === 'boolean';
export const isSpELNullLiteral = (expr: SpELProcessedExpression): expr is SpELNullLiteral =>
  expr.type === 'null';
export const isSpELRelationOp = (expr: SpELProcessedExpression): expr is SpELRelationOp =>
  expr.type === 'op-eq' ||
  expr.type === 'op-ne' ||
  expr.type === 'op-gt' ||
  expr.type === 'op-ge' ||
  expr.type === 'op-lt' ||
  expr.type === 'op-le';
export const isSpELPrimitive = (expr: SpELProcessedExpression): expr is SpELPrimitive =>
  isSpELNumericLiteral(expr) ||
  isSpELStringLiteral(expr) ||
  isSpELBooleanLiteral(expr) ||
  isSpELNullLiteral(expr);
export const isSpELBetweenValues = (expr: SpELProcessedExpression): expr is SpELBetweenValues =>
  expr.type === 'between' &&
  isSpELIdentifier(expr.children[0]) &&
  expr.children[1].type === 'list' &&
  expr.children[1].children.length >= 2 &&
  expr.children[1].children.every(c => isSpELPrimitive(c));
export const isSpELBetweenFields = (expr: SpELProcessedExpression): expr is SpELBetweenFields =>
  expr.type === 'between' &&
  isSpELIdentifier(expr.children[0]) &&
  expr.children[1].type === 'list' &&
  expr.children[1].children.length >= 2 &&
  expr.children[1].children.every(c => isSpELIdentifier(c));

/** A SpEL arithmetic infix node (`op-plus`/`op-minus`/`op-multiply`/`op-divide`/`op-modulus`). */
export const isSpELMathOperation = (expr: SpELProcessedExpression): boolean =>
  expr.type === 'op-plus' ||
  expr.type === 'op-minus' ||
  expr.type === 'op-multiply' ||
  expr.type === 'op-divide' ||
  expr.type === 'op-modulus';

/** A method/function invocation node (`.toUpperCase()`, `T(java.lang.Math).abs(x)`, `myFunc(a)`). */
export const isSpELMethodCall = (expr: SpELProcessedExpression): expr is SpELMethodCall =>
  expr.type === 'method' && typeof expr.methodName === 'string';

/**
 * Whether a relation operand should be routed to `getExpression`: an arithmetic infix node or a
 * method/function invocation. Bare identifiers, chains, and literals are not expression operands
 * (they retain their normal handling).
 */
export const isSpELExpressionOperand = (expr: SpELProcessedExpression): boolean =>
  isSpELMathOperation(expr) || isSpELMethodCall(expr);

export const isSpELMethodNode = (expr: SpELBaseNode<SpELNodeType>): expr is SpELMethodNode =>
  expr.getType() === 'method';

/**
 * Builds a {@link SpELMethodCall} from a SpEL `method` node. Arguments are stored on the
 * compiled node's `getRaw()` payload (not as children), so they are processed from there.
 */
const processMethodNode = (
  mn: SpELMethodNode,
  target: SpELProcessedExpression | null,
  typeRef: string | null
): SpELMethodCall => {
  const { methodName, args } = mn.getRaw();
  return {
    type: 'method',
    children: args.map(a => processCompiledExpression(a)),
    startPosition: mn.getStartPosition(),
    endPosition: mn.getEndPosition(),
    value: 'N/A',
    identifier: null,
    methodName,
    target,
    typeRef,
  };
};

/**
 * Processes a SpEL `compound` node that invokes one or more methods, e.g. `name.toUpperCase()`,
 * `a.b.toLowerCase()`, `(a + b).toUpperCase()`, or `T(java.lang.Math).abs(cost)`. Leading
 * property/variable children are collapsed into a dotted receiver identifier, a leading `typeref`
 * becomes the `typeRef` of the first call, and each subsequent `method` child wraps the previous
 * result as its `target`. Returns `null` for chain shapes that can't be represented.
 */
const processMethodChain = (ce: SpELExpressionNode): SpELMethodCall | null => {
  const children = ce.getChildren();
  if (!children.some(c => isSpELMethodNode(c))) {
    return null;
  }

  let index = 0;
  let target: SpELProcessedExpression | null = null;
  let typeRef: string | null = null;
  const first = children[0];

  if (first.getType() === 'typeref') {
    const qualifiedIdentifier = first.getChildren()[0] as unknown as SpELQualifiedIdentifierNode;
    typeRef = qualifiedIdentifier.getRaw().join('.');
    index = 1;
  } else if (isSpELPropertyNode(first)) {
    const parts: string[] = [];
    while (index < children.length && isSpELPropertyNode(children[index])) {
      parts.push((children[index] as unknown as SpELPropertyNode).getRaw());
      ++index;
    }
    target = {
      type: parts.length > 1 ? 'compound' : first.getType(),
      children: [],
      startPosition: first.getStartPosition(),
      endPosition: children[index - 1].getEndPosition(),
      value: 'N/A',
      identifier: parts.join('.'),
    };
  } else {
    // Arbitrary receiver subtree, e.g. `(a + b).toUpperCase()`
    target = processCompiledExpression(first);
    index = 1;
  }

  let result: SpELMethodCall | null = null;
  for (; index < children.length; ++index) {
    const child = children[index];
    if (!isSpELMethodNode(child)) {
      return null;
    }
    result = processMethodNode(child, result ?? target, result ? null : typeRef);
  }
  return result;
};

export const processCompiledExpression = (
  ce: SpELPropertyNode | SpELExpressionNode
): SpELProcessedExpression => {
  const type = ce.getType();

  // Bare function calls, e.g. `myFunc(a, b)`
  if (isSpELMethodNode(ce)) {
    return processMethodNode(ce, null, null);
  }

  // Method chains, e.g. `name.toUpperCase()` or `T(java.lang.Math).abs(cost)`
  if (type === 'compound' && !isSpELCompoundNode(ce)) {
    const methodChain = processMethodChain(ce);
    if (methodChain) {
      return methodChain;
    }
  }

  const identifier = isSpELCompoundNode(ce)
    ? ce
        .getChildren()
        .map(p => (isSpELPropertyNode(p) ? p.getRaw() : /* v8 ignore next -- @preserve */ ''))
        .join('.')
    : isSpELPropertyNode(ce)
      ? ce.getRaw()
      : null;
  const children =
    type === 'compound'
      ? []
      : (isSpELListNode(ce) ? ce.getRaw : ce.getChildren)().map(c => processCompiledExpression(c));
  const startPosition = ce.getStartPosition();
  const endPosition = ce.getEndPosition();
  const value = ce.getValue.length === 0 ? ce.getValue() : 'N/A';

  return {
    type: type === 'compound' && !identifier ? 'invalid' : type,
    children,
    startPosition,
    endPosition,
    value,
    identifier,
  };
};

export const normalizeOperator = (opType: SpELRelOpType, flip?: boolean): DefaultOperatorName => {
  if (flip) {
    if (opType === 'op-lt') return '>';
    if (opType === 'op-le') return '>=';
    if (opType === 'op-gt') return '<';
    if (opType === 'op-ge') return '<=';
  }
  return (
    {
      'op-eq': '=',
      'op-ge': '>=',
      'op-gt': '>',
      'op-le': '<=',
      'op-lt': '<',
      'op-ne': '!=',
    } as const
  )[opType];
};

export const generateFlatAndOrList = (
  expr: SpELProcessedExpression
): (DefaultCombinatorName | SpELProcessedExpression)[] => {
  const combinator = expr.type.slice(3) as DefaultCombinatorName;
  const [left, right] = expr.children;
  if (left.type === 'op-and' || left.type === 'op-or') {
    return [...generateFlatAndOrList(left), combinator, right];
  }
  return [left, combinator, right];
};

export const generateMixedAndOrList = (
  expr: SpELOpAnd | SpELOpOr
): (DefaultCombinatorName | SpELProcessedExpression | ('and' | SpELProcessedExpression)[])[] => {
  const arr = generateFlatAndOrList(expr);
  const returnArray: (
    | DefaultCombinatorName
    | SpELProcessedExpression
    | ('and' | SpELProcessedExpression)[]
  )[] = [];
  let startIndex = 0;
  for (let i = 0; i < arr.length; i += 2) {
    if (arr[i + 1] === 'and') {
      startIndex = i;
      let j = 1;
      while (arr[startIndex + j] === 'and') {
        i += 2;
        j += 2;
      }
      const tempAndArray = arr.slice(startIndex, i + 1) as ('and' | SpELProcessedExpression)[];
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
