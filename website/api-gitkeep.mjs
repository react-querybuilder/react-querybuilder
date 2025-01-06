// @ts-check
import { writeFileSync } from 'node:fs';
import { MarkdownRendererEvent } from 'typedoc-plugin-markdown';

/**
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 */
export function load(app) {
  // Add a .gitkeep file to the API documentation folder in case the
  // API docs do not get generated.
  app.renderer.on(MarkdownRendererEvent.END, () => {
    writeFileSync('./api/.gitkeep', '');
  });
}
