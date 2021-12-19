// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  mySidebar: [
    "intro",
    {
      type: "category",
      label: "API",
      link: {
        type: "generated-index",
        title: "API",
        description: "Complete documentation for React Query Builder.",
      },
      items: [
        "api/querybuilder",
        "api/export",
        "api/import",
        "api/validation",
        "api/misc",
      ],
    },
    {
      type: "category",
      label: "Tips & Tricks",
      link: {
        type: "generated-index",
        title: "Tips & Tricks",
        description: "Miscellaneous advice and advanced configurations.",
      },
      items: [
        "tips/limit-groups",
        "tips/custom-with-fallback",
        "tips/custom-bind-variables",
        "tips/adding-removing-query-properties",
        "tips/common-mistakes",
      ],
    },
    "compat",
    "typescript",
  ],
};

module.exports = sidebars;
