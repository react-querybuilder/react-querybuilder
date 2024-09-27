import { compile } from 'sass';

const src2dist = (path: string) => path.replace(/\bsrc\b/, 'dist/');
const scss2css = (path: string) => path.replace(/\.scss$/, '.css');
const full2relativePath = (path: string) => path.replace(/^.*?\/(src\/.*css$)/, '$1');

// Find all src/*.scss files
const scssGlob = new Bun.Glob('src/*.scss');
const scssPaths = scssGlob.scan();

// Write SCSS source, compiled CSS, and source map to dist directory
for await (const filePath of scssPaths) {
  const bunFile = Bun.file(filePath);
  const fileContent = await bunFile.text();
  const { css, sourceMap } = compile(filePath, { sourceMap: true, style: 'compressed' });
  sourceMap!.sources = sourceMap!.sources.map(s => full2relativePath(s).replace(/\bsrc\//, './'));
  const sourceMapText = JSON.stringify(sourceMap);
  await Promise.all([
    Bun.write(src2dist(filePath), fileContent),
    Bun.write(src2dist(scss2css(filePath)), css),
    Bun.write(`${src2dist(scss2css(filePath))}.map`, sourceMapText),
  ]);
}
