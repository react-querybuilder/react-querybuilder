// @ts-check
import { writeFileSync } from 'node:fs';
import { MarkdownPageEvent, MarkdownRendererEvent } from 'typedoc-plugin-markdown';

const _compatPackageNames = {
  antd: 'Ant Design',
  bootstrap: 'Bootstrap',
  bulma: 'Bulma',
  chakra: 'Chakra UI',
  datetime: 'Date/Time',
  dnd: 'Drag-and-Drop',
  fluent: 'Fluent UI',
  mantine: 'Mantine',
  material: 'MUI/Material',
  native: 'React Native',
  tremor: 'Tremor',
};

/**
 * Amends the frontmatter of API documentation pages.
 *
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 */
export function load(app) {
  app.renderer.on(
    MarkdownPageEvent.BEGIN,
    /** @param {import('typedoc-plugin-markdown').MarkdownPageEvent} page */
    page => {
      if (/\/(api|index)\/index\.md$/gi.test(page.filename)) {
        page.frontmatter = {
          ...page.frontmatter,
          // Index modules should be first in sidebar
          sidebar_position: 0,
        };
      }

      // Update sidebar label and title for submodules
      const mainPkgSubModuleMatch = page.filename.match(
        /\/api\/(@?(?:react-querybuilder)(\/[\w-]+)*\/([\w-]+))\/index.md$/i
      );
      if (mainPkgSubModuleMatch) {
        page.frontmatter = {
          ...page.frontmatter,
          sidebar_label:
            mainPkgSubModuleMatch[3] === 'index' ? '/' : `/${mainPkgSubModuleMatch[3]}`,
          title: mainPkgSubModuleMatch[1],
        };
      }
    }
  );
  app.renderer.on(MarkdownRendererEvent.END, () => {
    writeFileSync('./api/react-querybuilder/_category_.json', JSON.stringify({ position: 1 }));
    writeFileSync('./api/@react-querybuilder/_category_.json', JSON.stringify({ position: 2 }));
    writeFileSync('./api/.gitkeep', '');
  });
}
