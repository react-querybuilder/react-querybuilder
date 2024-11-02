/* eslint-disable unicorn/prefer-module, unicorn/no-anonymous-default-export */

/* @type {import('postcss').PluginCreator} */
module.exports = () => ({
  postcssPlugin: 'postcss-scoped-donut',
  Rule(rule) {
    rule.selector = rule.selector
      .replaceAll(/(\.rqb-[a-z]+)?\.donut-hole(\.rqb-[a-z]+)? :root\b/g, ':root')
      .replaceAll(/(\.rqb-[a-z]+)?\.donut-hole(\.rqb-[a-z]+)? (html|body)\b/g, '$1.donut-hole$2');
    if (rule.every(node => node.type === 'comment')) {
      rule.remove();
    }
    if (rule.every(node => node.type === 'decl' && node.prop.startsWith('--'))) {
      rule.selector = rule.selector.replaceAll(/(\.rqb-[a-z]+)?\.donut-hole(\.rqb-[a-z]+)?\b/g, '');
    }
  },
});
module.exports.postcss = true;
