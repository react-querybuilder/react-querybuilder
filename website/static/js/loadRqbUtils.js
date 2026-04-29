import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

if (ExecutionEnvironment.canUseDOM) {
  const [
    formatQuery,
    parseCEL,
    parseCypher,
    parseGremlin,
    parseJSONata,
    parseJsonLogic,
    parseMongoDB,
    parseSPARQL,
    parseSpEL,
    parseSQL,
    transformQuery,
  ] = await Promise.all([
    import('react-querybuilder/formatQuery'),
    import('react-querybuilder/parseCEL'),
    import('react-querybuilder/parseCypher'),
    import('react-querybuilder/parseGremlin'),
    import('react-querybuilder/parseJSONata'),
    import('react-querybuilder/parseJsonLogic'),
    import('react-querybuilder/parseMongoDB'),
    import('react-querybuilder/parseSPARQL'),
    import('react-querybuilder/parseSpEL'),
    import('react-querybuilder/parseSQL'),
    import('react-querybuilder/transformQuery'),
  ]);
  Object.assign(globalThis, {
    formatQuery: formatQuery.formatQuery,
    parseCEL: parseCEL.parseCEL,
    parseCypher: parseCypher.parseCypher,
    parseGremlin: parseGremlin.parseGremlin,
    parseJSONata: parseJSONata.parseJSONata,
    parseJsonLogic: parseJsonLogic.parseJsonLogic,
    parseMongoDB: parseMongoDB.parseMongoDB,
    parseSPARQL: parseSPARQL.parseSPARQL,
    parseSpEL: parseSpEL.parseSpEL,
    parseSQL: parseSQL.parseSQL,
    transformQuery: transformQuery.transformQuery,
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
 • transformQuery`
  );
}
