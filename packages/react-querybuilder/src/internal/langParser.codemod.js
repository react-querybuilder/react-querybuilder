import path from 'node:path';

/** @type {import('./types').LanguageParserCodeMod} */
export default ({ path: filePath, source }, { jscodeshift: j }) =>
  j(
    j(source)
      .find(j.LabeledStatement)
      .replaceWith(n => n.node.body)
      .toSource()
  )
    .find(j.IfStatement)
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
            name: path.parse(filePath).name,
          },
          exported: {
            type: 'Identifier',
            name: path.parse(filePath).name,
          },
        },
      ],
    })
    .toSource();
