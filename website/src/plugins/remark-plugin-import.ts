import { existsSync, readFileSync } from 'fs';
import path from 'node:path';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

const importMdRegExp = /^%importmd\s+(.*?)$/;
const importCodeRegExp = /^%importcode\s+(.*?)$/;
const lineNumbersRegExp = /^L(\d+)(-(L(\d+))?)?$/i;
const regionRegExp = /^region=(.+)$/i;
const blockRegExp = /^blockName=(.+)$/i;
const rootDir = path.resolve(__dirname, '../../..');

const getSourceLink = (filePath: string, start?: number, end?: number) => {
  const restOfUrl = `${filePath}${start >= 0 && end >= 0 ? `#L${start + 2}-L${end}` : ''}`;
  return {
    type: 'paragraph',
    children: [
      {
        type: 'blockquote',
        children: [
          {
            type: 'emphasis',
            children: [
              { type: 'text', value: 'Source: ' },
              {
                type: 'link',
                url: `https://github.com/react-querybuilder/react-querybuilder/blob/main${restOfUrl}`,
                children: [{ type: 'text', value: restOfUrl }],
              },
            ],
          },
        ],
      },
    ],
  };
};

export const remarkPluginImport = () => async (ast, vfile) => {
  visit(ast, 'paragraph', node => {
    if (node.children?.length > 0 && node.children[0].type === 'text') {
      // #region Markdown import
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
      // #endregion

      // #region Code import
      const codeImportMatches = importCodeRegExp.exec(node?.children[0].value || '');

      if (codeImportMatches?.[1]) {
        const [url, hash] = codeImportMatches[1].split('#');
        const codeFileAbsolutePath = path.join(rootDir, url);

        if (existsSync(codeFileAbsolutePath)) {
          const rawCode = readFileSync(codeFileAbsolutePath, 'utf-8');
          const codeLines = rawCode.split('\n');
          const lineNumbers = lineNumbersRegExp.exec(hash);
          const region = regionRegExp.exec(hash);
          const block = blockRegExp.exec(hash);
          const lang = path.extname(codeFileAbsolutePath).replace(/^\./, '');

          if (lineNumbers) {
            const start = parseInt(lineNumbers[1]);
            const end =
              (lineNumbers[4] ? parseInt(lineNumbers[4]) : null) ??
              (lineNumbers[2] ? codeLines.length : start);
            node.children = [
              {
                type: 'code',
                value: codeLines.slice(start - 1, end).join('\n'),
                lang,
                meta: null,
              },
              getSourceLink(url, start, end),
            ];
          } else if (region) {
            const start = codeLines.findIndex(v => v.match(`^\\s*// #region ${region[1]}$`));
            const end = codeLines.findIndex((v, i) => i >= start && v.match('^\\s*// #endregion'));
            if (start >= 0) {
              node.children = [
                {
                  type: 'code',
                  value: codeLines.slice(start + 1, end >= 0 ? end : codeLines.length).join('\n'),
                  lang,
                  meta: null,
                },
                getSourceLink(url, start, end),
              ];
            }
          } else if (block) {
            const start = codeLines.findIndex(v =>
              v.match(`^(export )?(const|let|type|interface) ${block[1]} \\{$`)
            );
            const end = codeLines.findIndex((v, i) => i >= start && v.match(/^\}/));
            if (start >= 0) {
              node.children = [
                {
                  type: 'code',
                  value: codeLines.slice(start, end >= 0 ? end + 1 : codeLines.length).join('\n'),
                  lang,
                  meta: null,
                },
                getSourceLink(url, start - 1, end + 1),
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
              getSourceLink(url),
            ];
          }
        } else {
          throw new Error(`Unable to locate file at path: ${codeFileAbsolutePath}`);
        }
      }
      // #endregion
    }
  });
};
