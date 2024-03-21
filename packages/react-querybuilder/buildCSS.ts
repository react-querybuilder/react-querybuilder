import { compile } from 'sass';

const src2dist = (path: string) => path.replace(/\bsrc\//, 'dist/');
const scss2css = (path: string) => path.replace(/\.scss$/, '.css');
const full2relativePath = (path: string) => path.replace(/^.*?\/(src\/.*css$)/, '$1');

// Find all src/*.scss files
const scssPaths = (await Bun.$`ls src/*.scss`.text()).split('\n').filter(Boolean);
// Get the text of those files
const scssTexts = await Promise.all(scssPaths.map(file => Bun.file(file).text()));

// Create the dist directory if it doesn't exist
await Bun.$`mkdir -p dist`;

// Write SCSS source, compiled CSS, and source map to dist directory
await Promise.all(
  scssPaths.map(async (file, idx) => {
    const { css, sourceMap } = compile(file, { sourceMap: true });
    sourceMap!.sources = sourceMap!.sources.map(s => full2relativePath(s).replace(/\bsrc\//, './'));
    const sourceMapText = JSON.stringify(sourceMap);
    return Promise.all([
      Bun.write(src2dist(file), scssTexts[idx]),
      Bun.write(src2dist(scss2css(file)), css),
      Bun.write(`${src2dist(scss2css(file))}.map`, sourceMapText),
    ]);
  })
);
