// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  mySidebar: [
    "intro",
    {
      "API": [
        "api/querybuilder",
        "api/export",
        "api/import",
        "api/validation",
        "api/misc",
      ],
    },
    {
      "Tips & Tricks": [
        "tips/limit-groups",
        "tips/custom-with-fallback",
        "tips/custom-bind-variables",
        "tips/adding-removing-query-properties",
        "tips/common-mistakes",
      ]
    },
    "typescript",
  ],
};

module.exports = sidebars;
