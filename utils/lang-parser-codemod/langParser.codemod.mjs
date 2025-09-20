import nodePath from 'node:path';

/** @type {import('./types').LanguageParserCodeMod} */
export default ({ path, source }, { jscodeshift }) =>
  jscodeshift(
    jscodeshift(source)
      .find(jscodeshift.LabeledStatement)
      .replaceWith(n => n.node.body)
      .toSource()
  )
    .find(jscodeshift.IfStatement)
    .filter(
      e =>
        e.node?.test?.left?.left?.argument?.name === 'require' &&
        e.node?.test?.right?.left?.argument?.name === 'exports'
    )
    .replaceWith({
      type: 'ExportNamedDeclaration',
      specifiers: [
        {
          type: 'ExportSpecifier',
          local: {
            type: 'Identifier',
            name: nodePath.parse(path).name,
          },
          exported: {
            type: 'Identifier',
            name: nodePath.parse(path).name,
          },
        },
      ],
    })
    .toSource();
