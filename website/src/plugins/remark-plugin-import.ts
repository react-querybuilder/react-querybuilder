import { existsSync, readFileSync } from 'fs';
import path from 'node:path';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

const importRegExp = /^%importmd\s+(.*?)$/;

export const remarkPluginImport = () => async (ast, vfile) => {
  visit(ast, 'paragraph', node => {
    if (node?.children[0]?.type === 'text') {
      const matches = importRegExp.exec(node.children[0].value || '');

      if (matches?.[1]) {
        const mdFilePath = path.resolve(vfile.path, '..', matches[1]);
        if (existsSync(mdFilePath)) {
          const rawMd = readFileSync(mdFilePath, 'utf-8');
          node.children = unified().use(remarkParse).use(remarkRehype).parse(rawMd);
        } else {
          throw new Error(`Unable to locate @import file in path: ${mdFilePath}!`);
        }
      }
    }
  });
};
