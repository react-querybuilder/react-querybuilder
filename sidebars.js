// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  mySidebar: [
    "intro",
    {
      API: [
        "api/querybuilder",
        "api/export",
        "api/import",
        "api/validation",
        "api/misc",
      ],
    },
    "typescript",
  ],
};

module.exports = sidebars;
