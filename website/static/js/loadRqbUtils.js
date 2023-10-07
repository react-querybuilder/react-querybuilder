import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

if (ExecutionEnvironment.canUseDOM) {
  const loadRqbUtils = async () => {
    const { formatQuery } = await import('react-querybuilder/formatQuery');
    globalThis.formatQuery = formatQuery;
    const { parseCEL } = await import('react-querybuilder/parseCEL');
    globalThis.parseCEL = parseCEL;
    const { parseJsonLogic } = await import('react-querybuilder/parseJsonLogic');
    globalThis.parseJsonLogic = parseJsonLogic;
    const { parseMongoDB } = await import('react-querybuilder/parseMongoDB');
    globalThis.parseMongoDB = parseMongoDB;
    const { parseSQL } = await import('react-querybuilder/parseSQL');
    globalThis.parseSQL = parseSQL;
    const { transformQuery } = await import('react-querybuilder/transformQuery');
    globalThis.transformQuery = transformQuery;
    console.log(
      `RQB utilities availble in the console:
 • formatQuery
 • parseCEL
 • parseJsonLogic
 • parseMongoDB
 • parseSQL
 • transformQuery`
    );
  };

  loadRqbUtils();
}
