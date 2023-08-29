import type { Serve } from 'bun';
import open from 'open';
import { compile } from 'sass';
import { bunPluginFlowRemoveTypes } from './packages/native/dev/flow-plugin';

const port = process.env.PORT ?? 3000;

const packages =
  'antd|bootstrap|bulma|chakra|dnd|fluent|mantine|material|native|react-querybuilder' as const;
const packageWholeWordRegExp = new RegExp(`^(${packages})$`, 'i');
const packagePathEndingRegExp = new RegExp(`packages/(${packages})/?$`, 'i');

const pkgName = Bun.argv.find(p => p.match(packageWholeWordRegExp)) ?? 'react-querybuilder';

declare global {
  // eslint-disable-next-line no-var
  var opened: boolean;
}
globalThis.opened ??= false;
if (!globalThis.opened) {
  setTimeout(() => open(`http://localhost:${port}/packages/${pkgName}`), 500);
}
globalThis.opened = true;

// const baseDir = `./packages/${pkgName}`;

const navDiv = `<div style="display:flex;justify-content:end">${packages
  .split('|')
  .map(p => `<a href="/packages/${p}/index.html">${p}</a>`)
  .join('&nbsp;&nbsp;')}</div>`;

const server = {
  async fetch(req) {
    const reqAsURL = new URL(req.url);
    if (packagePathEndingRegExp.test(reqAsURL.pathname)) {
      return Response.redirect(`${reqAsURL.pathname.replace(/\/$/, '')}/index.html`, 302);
    } else if (/\.(?:m|c)?(?:j|t)sx?$/.test(reqAsURL.pathname)) {
      const build = await Bun.build({
        entrypoints: [`.${reqAsURL.pathname}`],
        plugins: [bunPluginFlowRemoveTypes],
      }); //, root: baseDir });
      if (build.success) {
        return new Response(build.outputs[0], {
          headers: { 'Content-Type': 'application/javascript' },
        });
      }
      console.log(build.logs);
      return new Response('export {}', { headers: { 'Content-Type': 'application/javascript' } });
    } else if (/\.ico$/.test(reqAsURL.pathname)) {
      return new Response(Bun.file('./website/static/img/react-querybuilder.png'));
    } else if (/\.s?css$/.test(reqAsURL.pathname)) {
      const { css } = compile(`.${reqAsURL.pathname}`);
      return new Response(css, { headers: { 'Content-Type': 'text/css' } });
    } else if (reqAsURL.pathname.endsWith('/index.html')) {
      return new Response(
        (await Bun.file(`.${reqAsURL.pathname}`).text()).replace(/<body>/, `<body>${navDiv}`),
        { headers: { 'Content-Type': 'text/html;charset=utf-8' } }
      );
    }
    return new Response(Bun.file(`.${reqAsURL.pathname}`));
  },
  port,
} satisfies Serve;

export default server;
