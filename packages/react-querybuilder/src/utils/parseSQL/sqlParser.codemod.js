export default (file, api) => {
  const j = api.jscodeshift;
  const root = j(file.source);

  root
    .find(j.AssignmentExpression)
    .filter(
      (e) => e.node?.left?.object?.name === 'exports' && e.node?.left?.property?.name === 'main'
    )
    .remove();

  root
    .find(j.IfStatement)
    .filter((e) => e.node?.test?.right?.left?.object?.name === 'require')
    .remove();

  return root.toSource();
};
