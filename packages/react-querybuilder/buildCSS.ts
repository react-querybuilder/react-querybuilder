import { compile } from 'sass';

const src2dist = (path: string) => path.replace(/\bsrc\b/, 'dist/');
const scss2css = (path: string) => path.replace(/\.scss$/, '.css');
const full2relativePath = (path: string) =>
  path.replace(/^.*?\/(src\/.*css$)/, '$1').replace(/\bsrc\//, './');

const scssGlob = new Bun.Glob('src/*.scss');
const scssPaths = scssGlob.scan();

for await (const filePath of scssPaths) {
  const bunFile = Bun.file(filePath);
  const fileContent = await bunFile.text();
  const { css, sourceMap } = compile(filePath, { sourceMap: true, style: 'compressed' });
  sourceMap!.sources = sourceMap!.sources.map(s => full2relativePath(s));
  const sourceMapText = JSON.stringify(sourceMap);
  const scssDistPath = src2dist(filePath);
  const cssDistPath = src2dist(scss2css(filePath));
  await Promise.all([
    // Copy SCSS source to dist directory
    Bun.write(scssDistPath, fileContent),
    // Write compiled CSS to dist directory
    Bun.write(cssDistPath, css),
    // Write source map to dist directory
    Bun.write(`${cssDistPath}.map`, sourceMapText),
  ]);
}
