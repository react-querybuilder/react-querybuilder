import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

if (ExecutionEnvironment.canUseDOM) {
  const [
    core,
    parseCEL,
    parseCypher,
    parseGremlin,
    parseJSONata,
    parseJsonLogic,
    parseMongoDB,
    parseSPARQL,
    parseSpEL,
    parseSQL,
  ] = await Promise.all([
    import('@react-querybuilder/core'),
    import('@react-querybuilder/core/parseCEL'),
    import('@react-querybuilder/core/parseCypher'),
    import('@react-querybuilder/core/parseGremlin'),
    import('@react-querybuilder/core/parseJSONata'),
    import('@react-querybuilder/core/parseJsonLogic'),
    import('@react-querybuilder/core/parseMongoDB'),
    import('@react-querybuilder/core/parseSPARQL'),
    import('@react-querybuilder/core/parseSpEL'),
    import('@react-querybuilder/core/parseSQL'),
  ]);
  Object.assign(globalThis, {
    formatQuery: core.formatQuery,
    parseCEL: parseCEL.parseCEL,
    parseCypher: parseCypher.parseCypher,
    parseGremlin: parseGremlin.parseGremlin,
    parseJSONata: parseJSONata.parseJSONata,
    parseJsonLogic: parseJsonLogic.parseJsonLogic,
    parseMongoDB: parseMongoDB.parseMongoDB,
    parseSPARQL: parseSPARQL.parseSPARQL,
    parseSpEL: parseSpEL.parseSpEL,
    parseSQL: parseSQL.parseSQL,
    transformQuery: core.transformQuery,
    QueryManager: core.QueryManager,
  });
  console.log(
    `RQB utilities available in the console:
 • formatQuery
 • parseCEL
 • parseCypher
 • parseGremlin
 • parseJSONata
 • parseJsonLogic
 • parseMongoDB
 • parseSPARQL
 • parseSpEL
 • parseSQL
 • transformQuery
 • QueryManager`
  );
}
