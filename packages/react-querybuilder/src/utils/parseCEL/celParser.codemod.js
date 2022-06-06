/** @type {import('./types').ParseCELCodeMod} */
export default ({ source }, { jscodeshift: j }) =>
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
            name: 'celParser',
          },
          exported: {
            type: 'Identifier',
            name: 'celParser',
          },
        },
      ],
    })
    .toSource();
