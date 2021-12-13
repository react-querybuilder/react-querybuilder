export default (file, api) => {
  const j = api.jscodeshift;
  const root = j(file.source);

  root
    .find(j.IfStatement)
    .filter(
      e =>
        e.node?.test?.left?.left?.argument?.name === 'require' &&
        e.node?.test?.right?.left?.argument?.name === 'exports'
    )
    .remove();

  return root.toSource();
};
