import antdIndexHTML from './pages/antd.html';
import bootstrapIndexHTML from './pages/bootstrap.html';
import bulmaIndexHTML from './pages/bulma.html';
import chakraIndexHTML from './pages/chakra.html';
import datetimeIndexHTML from './pages/datetime.html';
import dndIndexHTML from './pages/dnd.html';
import fluentIndexHTML from './pages/fluent.html';
import mantineIndexHTML from './pages/mantine.html';
import materialIndexHTML from './pages/material.html';
import nativeIndexHTML from './pages/native.html';
import rqbIndexHTML from './pages/rqb.html';
import rebIndexHTML from './pages/rules-engine.html';
import tremorIndexHTML from './pages/tremor.html';

const indexHTMLs = {
  '/antd': antdIndexHTML,
  '/bootstrap': bootstrapIndexHTML,
  '/bulma': bulmaIndexHTML,
  '/chakra': chakraIndexHTML,
  '/datetime': datetimeIndexHTML, // Not implemented
  '/dnd': dndIndexHTML,
  '/fluent': fluentIndexHTML,
  '/mantine': mantineIndexHTML,
  '/material': materialIndexHTML,
  '/native': nativeIndexHTML, // Flow transpilation not working
  '/rules-engine': rebIndexHTML,
  '/': rqbIndexHTML,
  '/rqb': rqbIndexHTML,
  '/react-querybuilder': rqbIndexHTML,
  '/tremor': tremorIndexHTML,
};

const port = process.env.PORT || 3100;

const server = Bun.serve({
  development: true,
  port,
  routes: indexHTMLs,
  async fetch() {
    return new Response('Page not found', { status: 404 });
  },
});

console.log(`Listening on ${server.url}`);
