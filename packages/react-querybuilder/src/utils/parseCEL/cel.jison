/* description: Parses CEL (see https://github.com/google/cel-spec) */
/* :tabSize=2:indentSize=2:noTabs=true: */

/*
From https://github.com/google/cel-spec/blob/master/doc/langdef.md#syntax
*/
/*
Expr           = ConditionalOr ["?" ConditionalOr ":" Expr] ;
ConditionalOr  = [ConditionalOr "||"] ConditionalAnd ;
ConditionalAnd = [ConditionalAnd "&&"] Relation ;
Relation       = [Relation Relop] Addition ;
Relop          = "<" | "<=" | ">=" | ">" | "==" | "!=" | "in" ;
Addition       = [Addition ("+" | "-")] Multiplication ;
Multiplication = [Multiplication ("*" | "/" | "%")] Unary ;
Unary          = Member
               | "!" {"!"} Member
               | "-" {"-"} Member
               ;
Member         = Primary
               | Member "." IDENT ["(" [ExprList] ")"]
               | Member "[" Expr "]"
               | Member "{" [FieldInits] [","] "}"
               ;
Primary        = ["."] IDENT ["(" [ExprList] ")"]
               | "(" Expr ")"
               | "[" [ExprList] [","] "]"
               | "{" [MapInits] [","] "}"
               | LITERAL
               ;
ExprList       = Expr {"," Expr} ;
FieldInits     = IDENT ":" Expr {"," IDENT ":" Expr} ;
MapInits       = Expr ":" Expr {"," Expr ":" Expr} ;
*/
/*
IDENT          ::= [_a-zA-Z][_a-zA-Z0-9]* - RESERVED
LITERAL        ::= INT_LIT | UINT_LIT | FLOAT_LIT | STRING_LIT | BYTES_LIT
                 | BOOL_LIT | NULL_LIT
INT_LIT        ::= -? DIGIT+ | -? 0x HEXDIGIT+
UINT_LIT       ::= INT_LIT [uU]
FLOAT_LIT      ::= -? DIGIT* . DIGIT+ EXPONENT? | -? DIGIT+ EXPONENT
DIGIT          ::= [0-9]
HEXDIGIT       ::= [0-9abcdefABCDEF]
EXPONENT       ::= [eE] [+-]? DIGIT+
STRING_LIT     ::= [rR]? ( "    ~( " | NEWLINE )*  "
                         | '    ~( ' | NEWLINE )*  '
                         | """  ~"""*              """
                         | '''  ~'''*              '''
                         )
BYTES_LIT      ::= [bB] STRING_LIT
ESCAPE         ::= \ [abfnrtv\?"'`]
                 | \ x HEXDIGIT HEXDIGIT
                 | \ u HEXDIGIT HEXDIGIT HEXDIGIT HEXDIGIT
                 | \ U HEXDIGIT HEXDIGIT HEXDIGIT HEXDIGIT HEXDIGIT HEXDIGIT HEXDIGIT HEXDIGIT
                 | \ [0-3] [0-7] [0-7]
NEWLINE        ::= \r\n | \r | \n
BOOL_LIT       ::= "true" | "false"
NULL_LIT       ::= "null"
RESERVED       ::= BOOL_LIT | NULL_LIT | "in"
                 | "as" | "break" | "const" | "continue" | "else"
                 | "for" | "function" | "if" | "import" | "let"
                 | "loop" | "package" | "namespace" | "return"
                 | "var" | "void" | "while"
WHITESPACE     ::= [\t\n\f\r ]+
COMMENT        ::= '//' ~NEWLINE* NEWLINE
*/
%lex

%options flex

%%

[/][/]\s.*\n                                                      /* skip end-of-line comments */
\s+                                                               /* skip whitespace */
// Reserved words
in                                                                return 'in'
as                                                                return 'as'
break                                                             return 'break'
const                                                             return 'const'
continue                                                          return 'continue'
else                                                              return 'else'
for                                                               return 'for'
function                                                          return 'function'
if                                                                return 'if'
import                                                            return 'import'
let                                                               return 'let'
loop                                                              return 'loop'
package                                                           return 'package'
namespace                                                         return 'namespace'
return                                                            return 'return'
var                                                               return 'var'
void                                                              return 'void'
while                                                             return 'while'
null                                                              return 'NULL_LIT'
true                                                              return 'BOOL_LIT'
false                                                             return 'BOOL_LIT'
// Operators and other characters
\.                                                                return 'DOT'
","                                                               return ','
"("                                                               return '('
")"                                                               return ')'
"!="                                                              return '!='
"!"                                                               return '!'
"+"                                                               return '+'
"-"                                                               return '-'
"*"                                                               return '*'
"/"                                                               return '/'
"%"                                                               return '%'
"=="                                                              return '=='
">="                                                              return '>='
">"                                                               return '>'
"<="                                                              return '<='
"<"                                                               return '<'
"{"                                                               return '{'
"}"                                                               return '}'
"&&"                                                              return '&&'
"||"                                                              return '||'
// Identfiers
[_a-zA-Z][_a-zA-Z0-9]*                                            return 'IDENT'
// Literals
[rR]?['](\\.|[^'\\n\\r])*[']                                      return 'STRING_LIT'
[rR]?["](\\.|[^"\\n\\r])*["]                                      return 'STRING_LIT'
[rR]?['''](\\.)*[''']                                             return 'STRING_LIT'
[rR]?["""](\\.)*["""]                                             return 'STRING_LIT'
[-]?([0-9]+|0x[0-9a-fA-F]+)                                       return 'INT_LIT'
([0-9]+|0x[0-9a-fA-F]+)[uU]                                       return 'UINT_LIT'
[-]?[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+(\.[0-9]+)?)?                return 'FLOAT_LIT'
// Misc
<<EOF>>                                                           return 'EOF'
.                                                                 return 'INVALID'

/lex

%left '||'
%left '&&'
%left '==' '!='
%left '>' '>=' '<' '<='
%left '+' '-'
%left '/' '%' '*'
%left '?' ':'

%start main

%% /* language grammar */

main
  : expr EOF { return { nodeType: 'Main', value: $1 }; }
  ;
string_literal
  : STRING_LIT -> { type: 'StringLiteral', value: $1 }
  ;
bytes_literal
  : "b" string_literal -> { type: 'BytesLiteral', value: $2 }
  | "B" string_literal -> { type: 'BytesLiteral', value: $2 }
  ;
number_literal
  : INT_LIT -> { type: 'IntegerLiteral', value: $1 }
  | UINT_LIT = -> { type: 'UnsignedIntegerLiteral', value: $1 }
  | FLOAT_LIT = -> { type: 'FloatLiteral', value: $1 }
  ;
boolean_literal
  : BOOL_LIT -> { type: 'BooleanLiteral', value: $1 === 'true' }
  ;
null_literal
  : NULL_LIT -> { type: 'NullLiteral', value: null }
  ;
literal
  : string_literal -> $1
  | number_literal -> $1
  | bytes_literal -> $1
  | boolean_literal -> $1
  | null_literal -> $1
  ;
ident
  : IDENT -> { type: 'Identifier', value: $1 }
  ;
relop
  : '==' -> $1
  | '>=' -> $1
  | '>' -> $1
  | '<=' -> $1
  | '<' -> $1
  | '!=' -> $1
  ;
relation
  : member relop member -> { type: 'Relation', left: $1, operator: $2, right: $3 }
  | member 'in' list -> { type: 'Relation', left: $1, operator: $2, right: $3 }
  | member 'in' map -> { type: 'Relation', left: $1, operator: $2, right: $3 }
  ;
exclamation_list
  : '!' -> { type: 'ExclamationList', value: [ $1 ] }
  | exclamation_list '!' -> $1; $$.value.push($2);
  ;
hyphen_list
  : '-' -> { type: 'HyphenList', value: [ $1 ] }
  | hyphen_list '-' -> $1; $$.value.push($2);
  ;
unary
  : member -> $1
  | exclamation_list member -> { type: 'Negation', negations: $1, value: $2 }
  | hyphen_list member -> { type: 'Negative', negatives: $1, value: $2 }
  ;
member
  : primary ->  $1
  | member DOT ident -> { type: 'Member', left: $1, right: $3 }
  | member DOT ident '(' expr_list ')' -> { type: 'Member', left: $1, right: $3, list: $5 }
  | member '[' expr ']' -> { type: 'DynamicPropertyAccessor', left: $1, right: $3 }
  // TODO: This needs a better type name
  | member '{' field_inits trailing_comma '}' -> { type: 'FieldsObject', left: $1, list: $3, trailingComma: $4 }
  ;
trailing_comma
  : -> false
  | ',' -> true
  ;
primary
  : ident -> $1
  | DOT ident -> { type: 'Property', value: $2 }
  | ident '(' expr_list trailing_comma ')' -> { type: 'FunctionCall', name: $1, args: $3, trailingComma: $4 }
  | DOT ident '(' expr_list trailing_comma ')' -> { type: 'Property', value: $2, args: $4, trailingComma: $5 }
  | '(' expr ')' -> { type: 'ExpressionGroup', value: $2 }
  | list -> $1
  | map -> $1
  | literal -> $1
  ;
list
  : '[' expr_list trailing_comma ']' -> { type: 'List', value: $2, trailingComma: $3 }
  ;
map
  : '{' map_inits trailing_comma '}' -> { type: 'Map', value: $2, trailingComma: $3 }
  ;
math_operation
  : expr '+' expr -> { type: 'Addition', left: $1, right: $3 }
  | expr '-' expr -> { type: 'Subtraction', left: $1, right: $3 }
  | expr '*' expr -> { type: 'Multiplication', left: $1, right: $3 }
  | expr '/' expr -> { type: 'Division', left: $1, right: $3 }
  | expr '%' expr -> { type: 'Modulo', left: $1, right: $3 }
  ;
expr
  : member -> $1
  // TODO: support conditional expression (x ? y : z)
  // | conditional_expr -> $1
  | conditional_and -> $1
  | conditional_or -> $1
  | relation -> $1
  | math_operation -> $1
  | like_expr -> $1
  ;
conditional_expr
  : expr '?' expr ':' expr -> { type: 'ConditionalExpr', condition: $1, valueIfTrue: $3, valueIfFalse: $5 }
  ;
conditional_and
  : expr '&&' expr -> { type: 'ConditionalAnd', left: $1, right: $3 }
  ;
conditional_or
  : expr '||' expr -> { type: 'ConditionalOr', left: $1, right: $3 }
  ;
expr_list
  : expr -> { type: 'ExpressionList', value: [ $1 ] }
  | expr_list ',' expr -> $1; $$.value.push($3);
  ;
field_inits
  : ident ':' expr -> { type: 'FieldInits', value: [ { type: 'FieldInit', left: $1, right: $3 } ] }
  | field_inits ',' ident ':' expr -> $1; $$.value.push({ type: 'FieldInit', left: $3, right: $5 });
  ;
map_inits
  : expr ':' expr -> { type: 'MapInits', value: [ { type: 'MapInit', left: $1, right: $3 } ] }
  | map_inits ',' expr ':' expr -> $1; $$.value.push({ type: 'MapInit', left: $3, right: $5 });
  ;
