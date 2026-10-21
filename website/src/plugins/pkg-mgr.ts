/* Adapted from `@docusaurus/remark-plugin-npm2yarn` (MIT License) */

import type { Code, Literal } from 'mdast';
import type { MdxJsxFlowElement, MdxJsxAttribute } from 'mdast-util-mdx';
import npmToYarn from 'npm-to-yarn';
import type { Transformer, Plugin } from 'unified';
import type { Node, Parent } from 'unist';

type KnownConverter = 'bun' | 'pnpm' | 'yarn';

type CustomConverter = [name: string, cb: (npmCode: string) => string];

type Converter = CustomConverter | KnownConverter;

type PluginOptions = {
  sync?: boolean;
  converters?: Converter[];
};

function createAttribute(
  attributeName: string,
  attributeValue: MdxJsxAttribute['value']
): MdxJsxAttribute {
  return {
    type: 'mdxJsxAttribute',
    name: attributeName,
    value: attributeValue,
  };
}

function createClassNameAttributesProp(className: string): MdxJsxAttribute {
  return {
    type: 'mdxJsxAttribute',
    name: 'attributes',
    value: {
      type: 'mdxJsxAttributeValueExpression',
      value: `{className: '${className}'}`,
      data: {
        estree: {
          type: 'Program',
          sourceType: 'module',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'ObjectExpression',
                properties: [
                  {
                    type: 'Property',
                    kind: 'init',
                    method: false,
                    shorthand: false,
                    computed: false,
                    key: { type: 'Identifier', name: 'className' },
                    value: { type: 'Literal', value: className, raw: `'${className}'` },
                  },
                ],
              },
            },
          ],
        },
      },
    },
  };
}

function createTabItem({
  code,
  node,
  value,
  label,
}: {
  code: string;
  node: Code;
  value: string;
  label?: string;
}): MdxJsxFlowElement {
  return {
    type: 'mdxJsxFlowElement',
    name: 'TabItem',
    attributes: [
      createAttribute('value', value),
      label && createAttribute('label', label),
      createClassNameAttributesProp(`tab-item-pkg-mgr-${value}`),
    ].filter((attr): attr is MdxJsxAttribute => Boolean(attr)),
    children: [{ type: node.type, lang: node.lang, value: code }],
  };
}

const transformNode = (node: Code, isSync: boolean, converters: Converter[]) => {
  const groupIdProp = isSync
    ? { type: 'mdxJsxAttribute', name: 'groupId', value: 'npm2yarn' }
    : undefined;
  const npmCode = node.value;

  function createConvertedTabItem(converter: Converter) {
    if (typeof converter === 'string') {
      return createTabItem({
        code: npmToYarn(npmCode, converter),
        node,
        value: converter,
        label: converter,
      });
    }
    const [converterName, converterFn] = converter;
    return createTabItem({
      code: converterFn(npmCode),
      node,
      value: converterName,
      label: converterName,
    });
  }

  return [
    {
      type: 'mdxJsxFlowElement',
      name: 'Tabs',
      attributes: [groupIdProp].filter(Boolean),
      children: [
        createTabItem({ code: npmCode, node, value: 'npm' }),
        ...converters.flatMap(createConvertedTabItem),
      ],
    },
  ] as unknown as MdxJsxFlowElement[];
};

const isMdxEsmLiteral = (node: Node): node is Literal => node.type === 'mdxjsEsm';
type ThemeImport = 'Tabs' | 'TabItem';
const themeImports: ThemeImport[] = ['Tabs', 'TabItem'];
// TODO legacy approximation, good-enough for now but not 100% accurate
const hasThemeImport = (node: Node, name: ThemeImport): boolean =>
  isMdxEsmLiteral(node) && new RegExp(`['"]@theme/${name}['"]`).test(node.value);

const isParent = (node: Node): node is Parent => Array.isArray((node as Parent).children);
const isNpm2Yarn = (node: Node): node is Code =>
  node.type === 'code' && (node as Code).meta === 'npm2yarn';

function createImportNode(names: ThemeImport[]) {
  return {
    type: 'mdxjsEsm',
    value: names.map(name => `import ${name} from '@theme/${name}'`).join('\n'),
    data: {
      estree: {
        type: 'Program',
        body: names.map(name => ({
          type: 'ImportDeclaration',
          specifiers: [
            {
              type: 'ImportDefaultSpecifier',
              local: { type: 'Identifier', name },
            },
          ],
          source: {
            type: 'Literal',
            value: `@theme/${name}`,
            raw: `'@theme/${name}'`,
          },
        })),
        sourceType: 'module',
      },
    },
  };
}

const plugin: Plugin<[PluginOptions?]> = (options = {}): Transformer => {
  const { sync = false, converters = ['pnpm', 'bun', 'yarn'] } = options;
  return async root => {
    const { visit } = await import('unist-util-visit');

    let transformed = false;
    const imported = new Set<ThemeImport>();

    visit(root, (node: Node) => {
      for (const name of themeImports) {
        if (hasThemeImport(node, name)) imported.add(name);
      }

      if (isParent(node)) {
        let index = 0;
        while (index < node.children.length) {
          const child = node.children[index];
          if (isNpm2Yarn(child)) {
            const result = transformNode(child, sync, converters);
            node.children.splice(index, 1, ...result);
            index += result.length;
            transformed = true;
          } else {
            index += 1;
          }
        }
      }
    });

    const missing = themeImports.filter(name => !imported.has(name));
    if (transformed && missing.length > 0) {
      (root as Parent).children.unshift(createImportNode(missing));
    }
  };
};

// To continue supporting `require('npm2yarn')` without the `.default` ㄟ(▔,▔)ㄏ
// TODO change to export default after migrating to ESM

// // @ts-expect-error: Docusaurus v4: remove
// export = plugin;

export default plugin;
