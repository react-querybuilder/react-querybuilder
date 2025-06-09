/* eslint-disable unicorn/prefer-module */

/** @type {import('postcss').Plugin} */
function plugin() {
  return {
    postcssPlugin: 'postcss-scoped-donut',
    Rule(rule) {
      rule.selector = rule.selector
        .replaceAll(/(\.rqb-[a-z]+)?\.donut-hole(\.rqb-[a-z]+)? :root\b/g, ':root')
        .replaceAll(/(\.rqb-[a-z]+)?\.donut-hole(\.rqb-[a-z]+)? (html|body)\b/g, '$1.donut-hole$2')
        .replaceAll(/\.rqb-tremor\s+\.rqb-tremor/g, '.rqb-tremor');

      if (rule.every(node => node.type === 'comment')) {
        rule.remove();
      }
    },
  };
}
plugin.postcss = true;

module.exports = plugin;
module.exports.postcss = true;
