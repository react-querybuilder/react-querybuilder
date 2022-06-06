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

%options case-sensitive

%%

[/][/]\s.*\n                                                      /* skip end-of-line comments */
\s+                                                               /* skip whitespace */
// Reserved words
// Boolean literals
// true                                                              return 'TRUE'
// false                                                             return 'FALSE'
// Null literal
// null                                                              return 'NULL'
// Other reserved words
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
// Operators and other characters
","                                                               return ','
"("                                                               return '('
")"                                                               return ')'
"!="                                                              return '!='
"!"                                                               return '!'
"||"                                                              return '||'
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
// Misc
[_a-zA-Z][_a-zA-Z0-9]*                                            return 'IDENT'
"true"                                                            return 'BOOL_LIT'
"false"                                                           return 'BOOL_LIT'
"null"                                                            return 'NULL_LIT'
[rR]?['](\\.|[^'\\n])*[']                                         return 'STRING_LIT'
[rR]?["](\\.|[^"\\n])*["]                                         return 'STRING_LIT'
[rR]?['''](\\.|[^'''])*[''']                                      return 'STRING_LIT'
[rR]?["""](\\.|[^"""])*["""]                                      return 'STRING_LIT'
[-]?([0-9]+|0x[0-9a-fA-F]+)                                       return 'INT_LIT'
([0-9]+|0x[0-9a-fA-F]+)[uU]                                       return 'UINT_LIT'
[-]?[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+(\.[0-9]+)?)?                return 'FLOAT_LIT'

<<EOF>>                                                           return 'EOF'
.                                                                 return 'INVALID'

/lex

%left '=' '!='        /* '=' in sql equals '==' */
%left '>' '>=' '<' '<='
%left '+' '-'
%left '/' '%' '*'

%start main

%% /* language grammar */

main
  : expr EOF { return { nodeType: 'Main', value: $1 }; }
  ;
string_literal
  : STRING_LIT { $$ = { type: 'StringLiteral', value: $1 } }
  ;
bytes_literal
  : "b" string_literal { $$ = { type: 'BytesLiteral', value: $2 } }
  | "B" string_literal { $$ = { type: 'BytesLiteral', value: $2 } }
  ;
number_literal
  : INT_LIT { $$ = { type: 'IntegerLiteral', value: $1 } }
  | UINT_LIT = { $$ = { type: 'UnsignedIntegerLiteral', value: $1 } }
  | FLOAT_LIT = { $$ = { type: 'FloatLiteral', value: $1 } }
  ;
boolean_literal
  : BOOL_LIT { $$ = { type: 'BooleanLiteral', value: $1 } }
  ;
null_literal
  : NULL_LIT { $$ = { type: 'NullLiteral', value: 'null' } }
  ;
literal
  : string_literal { $$ = $1 }
  | number_literal { $$ = $1 }
  | bytes_literal { $$ = $1 }
  | boolean_literal { $$ = $1 }
  | null_literal { $$ = $1 }
  ;
ident
  : IDENT { $$ = { type: 'Identifier', value: $1 } }
  ;
relop
  : '==' { $$ = $1 }
  | '>=' { $$ = $1 }
  | '>' { $$ = $1 }
  | '<=' { $$ = $1 }
  | '<' { $$ = $1 }
  | '!=' { $$ = $1 }
  | 'in' { $$ = $1 }
  ;
relation
  : member relop member { $$ = { type: 'Relation', left: $1, operator: $2, right: $3 } }
  ;
exclamation_list
  : '!' { $$ = { type: 'ExclamationList', value: [ $1 ] } }
  | exclamation_list '!' { $$ = $1; $$.value.push($2); }
  ;
hyphen_list
  : '-' { $$ = { type: 'HyphenList', value: [ $1 ] } }
  | hyphen_list '-' { $$ = $1; $$.value.push($2); }
  ;
unary
  : member { $$ = { type: 'Unary', value: $1 } }
  | exclamation_list member { $$ = { type: 'Unary', exclamationList: $1, value: $2 } }
  | hyphen_list member { $$ = { type: 'Unary', hyphenList: $1, value: $2 } }
  ;
member
  : primary { $$ = { type: 'Member', value: $1 } }
  | member '.' ident { $$ = { type: 'Member', left: $1, right: $3 } }
  | member '.' ident '(' expr_list ')' { $$ = { type: 'Member', left: $1, right: $3, list: $5 } }
  | member '[' expr ']' { $$ = { type: 'Member', left: $1, list: $3 } }
  | member '{' field_inits trailing_comma '}' { $$ = { type: 'Member', left: $1, list: $3 } }
  ;
trailing_comma
  : { $$ = $1 }
  | ',' { $$ = $1 }
  ;
dot_opt
  : { $$ = null }
  | '.' { $$ = $1 }
  ;
primary
  : dot_opt ident { $$ = { type: 'Primary', dotOpt: $1, value: $2 } }
  | dot_opt ident '(' expr_list trailing_comma ')' { $$ = { type: 'Primary', dotOpt: $1, value: $2, list: $4 } }
  | '(' expr ')' { $$ = { type: 'Primary', brackets: 'parens', value: $2 } }
  | '[' expr_list trailing_comma ']' { $$ = { type: 'Primary', brackets: 'square', list: $2 } }
  | '{' map_inits trailing_comma '}' { $$ = { type: 'Primary', brackets: 'curly', list: $2 } }
  | literal
  ;
addition
  : expr '+' expr { $$ = { type: 'Addition', left: $1, right: $3 } }
  | expr '-' expr { $$ = { type: 'Subtraction', left: $1, right: $3 } }
  ;
multiplication
  : expr '*' expr { $$ = { type: 'Multiplication', left: $1, right: $3 } }
  | expr '/' expr { $$ = { type: 'Division', left: $1, right: $3 } }
  | expr '%' expr { $$ = { type: 'Modulo', left: $1, right: $3 } }
  ;
expr
  : member { $$ = $1 }
  | relation { $$ = $1 }
  | addition { $$ = $1 }
  | multiplication { $$ = $1 }
  ;
conditional_and
  : expr '&&' expr { $$ = { type: 'ConditionalAnd', operator: $2, left: $1, right: $3 } }
  ;
conditional_or
  : expr '||' expr { $$ = { type: 'ConditionalOr', operator: $2, left: $1, right: $3 } }
  ;
expr_list
  : expr { $$ = { type: 'ExpressionList', value: [ $1 ] } }
  | expr_list ',' expr { $$ = $1; $$.value.push($3); }
  ;
field_inits
  : ident ':' expr { $$ = { type: 'FieldInits', value: [ { type: 'FieldInit', left: $1, right: $3 } ] } }
  | field_inits ',' ident ':' expr { $$ = $1; $$.value.push({ type: 'FieldInit', left: $3, right: $5 }); }
  ;
map_inits
  : expr ':' expr { $$ = { type: 'MapInits', value: [ { type: 'MapInit', left: $1, right: $3 } ] } }
  | map_inits ',' expr ':' expr { $$ = $1; $$.value.push({ type: 'MapInit', left: $3, right: $5 }); }
  ;
