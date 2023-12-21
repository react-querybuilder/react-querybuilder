import { existsSync, readFileSync } from 'fs';
import path from 'node:path';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

const importMdRegExp = /^%importmd\s+(.*?)$/;
const importCodeRegExp = /^%importcode\s+(.*?)$/;
const hashRegExp = /^L(\d+)(-(L(\d+))?)?$/i;
const regionRegExp = /^region=(.+)$/i;

export const remarkPluginImport = () => async (ast, vfile) => {
  visit(ast, 'paragraph', node => {
    if (node.children?.length > 0 && node.children[0].type === 'text') {
      const mdImportMatches = importMdRegExp.exec(node.children[0].value || '');

      if (mdImportMatches?.[1]) {
        const mdFilePath = path.resolve(vfile.path, '..', mdImportMatches[1]);
        if (existsSync(mdFilePath)) {
          const rawMd = readFileSync(mdFilePath, 'utf-8');
          node.children = unified().use(remarkParse).use(remarkRehype).parse(rawMd).children;
        } else {
          throw new Error(`Unable to locate file at path: ${mdFilePath}`);
        }
      }

      const codeImportMatches = importCodeRegExp.exec(node?.children[0].value || '');

      if (codeImportMatches?.[1]) {
        const [url, hash] = codeImportMatches[1].split('#');
        const codeFilePath = path.resolve(vfile.path, '..', url);

        if (existsSync(codeFilePath)) {
          const rawCode = readFileSync(codeFilePath, 'utf-8');
          const codeLines = rawCode.split('\n');
          const hashParts = hashRegExp.exec(hash);
          const region = regionRegExp.exec(hash);
          const lang = path.extname(codeFilePath).replace(/^\./, '');

          if (hashParts) {
            const start = parseInt(hashParts[1]);
            const end =
              (hashParts[4] ? parseInt(hashParts[4]) : null) ??
              (hashParts[2] ? codeLines.length : start);
            node.children = [
              {
                type: 'code',
                value: codeLines.slice(start - 1, end).join('\n'),
                lang,
                meta: null,
              },
            ];
          } else if (region) {
            const start = codeLines.indexOf(`// #region ${region[1]}`);
            const end = codeLines.indexOf('// #endregion', start);
            if (start >= 0) {
              node.children = [
                {
                  type: 'code',
                  value: codeLines.slice(start + 1, end >= 0 ? end : codeLines.length).join('\n'),
                  lang,
                  meta: null,
                },
              ];
            }
          } else {
            node.children = [
              {
                type: 'code',
                value: rawCode,
                lang,
                meta: null,
              },
            ];
          }
        } else {
          throw new Error(`Unable to locate file at path: ${codeFilePath}`);
        }
      }
    }
  });
};
