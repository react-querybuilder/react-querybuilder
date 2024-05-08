// @ts-check
import { writeFileSync } from 'node:fs';
import { MarkdownPageEvent, MarkdownRendererEvent } from 'typedoc-plugin-markdown';

const compatPackageNames = {
  antd: 'Ant Design',
  bootstrap: 'Bootstrap',
  bulma: 'Bulma',
  chakra: 'Chakra UI',
  dnd: 'Drag-and-Drop',
  fluent: 'Fluent UI',
  mantine: 'Mantine',
  material: 'MUI/Material',
  native: 'React Native',
  tremor: 'Tremor',
};

const re = /\/@react-querybuilder\/(\w+)\/index\.md$/;

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
      if (page.filename.endsWith('/api/index.md')) {
        page.frontmatter = {
          ...page.frontmatter,
          // Index should be first in sidebar
          sidebar_position: 0,
        };
      }

      // Update sidebar label for main package
      if (page.filename.endsWith('/react-querybuilder/index.md')) {
        page.frontmatter = {
          ...page.frontmatter,
          sidebar_label: 'React Query Builder',
        };
      }
      // Update sidebar labels for compat packages
      const reMatch = page.filename.match(re);
      if (reMatch) {
        page.frontmatter = {
          ...page.frontmatter,
          sidebar_label: compatPackageNames[reMatch[1]],
        };
      }
    }
  );
  app.renderer.on(MarkdownRendererEvent.END, () => {
    writeFileSync(
      './api/react-querybuilder/_category_.json',
      JSON.stringify({
        position: 1,
      })
    );
    writeFileSync(
      './api/@react-querybuilder/_category_.json',
      JSON.stringify({
        position: 2,
        label: 'Compatibility packages',
      })
    );
  });
}
