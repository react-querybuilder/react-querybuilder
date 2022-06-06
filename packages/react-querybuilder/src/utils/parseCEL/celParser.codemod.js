/** @type {import('./types').ParseCELCodeMod} */
export default (file, api) =>
  api
    .jscodeshift(file.source)
    .find(api.jscodeshift.IfStatement)
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
