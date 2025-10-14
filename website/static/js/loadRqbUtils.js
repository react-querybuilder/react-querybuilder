import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

if (ExecutionEnvironment.canUseDOM) {
  const [
    formatQuery,
    parseCEL,
    parseJSONata,
    parseJsonLogic,
    parseMongoDB,
    parseSpEL,
    parseSQL,
    transformQuery,
  ] = await Promise.all([
    import('react-querybuilder/formatQuery'),
    import('react-querybuilder/parseCEL'),
    import('react-querybuilder/parseJSONata'),
    import('react-querybuilder/parseJsonLogic'),
    import('react-querybuilder/parseMongoDB'),
    import('react-querybuilder/parseSpEL'),
    import('react-querybuilder/parseSQL'),
    import('react-querybuilder/transformQuery'),
  ]);
  Object.assign(globalThis, {
    formatQuery: formatQuery.formatQuery,
    parseCEL: parseCEL.parseCEL,
    parseJSONata: parseJSONata.parseJSONata,
    parseJsonLogic: parseJsonLogic.parseJsonLogic,
    parseMongoDB: parseMongoDB.parseMongoDB,
    parseSpEL: parseSpEL.parseSpEL,
    parseSQL: parseSQL.parseSQL,
    transformQuery: transformQuery.transformQuery,
  });
  console.log(
    `RQB utilities available in the console:
 • formatQuery
 • parseCEL
 • parseJSONata
 • parseJsonLogic
 • parseMongoDB
 • parseSpEL
 • parseSQL
 • transformQuery`
  );
}
