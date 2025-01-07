// @ts-check
import { existsSync } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 */
export function load(app) {
  app.renderer.preRenderAsyncJobs.push(async output => {
    if (existsSync(output.outputDirectory)) {
      await rm(output.outputDirectory, { recursive: true });
    }
    await mkdir(output.outputDirectory, { recursive: true });
    await writeFile(path.join(output.outputDirectory, '.gitkeep'), '');
  });
}
