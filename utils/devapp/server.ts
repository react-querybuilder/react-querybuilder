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
import tremorIndexHTML from './pages/tremor.html';

const indexHTMLs = {
  '/antd': antdIndexHTML,
  '/bootstrap': bootstrapIndexHTML,
  '/bulma': bulmaIndexHTML,
  '/chakra': chakraIndexHTML,
  '/datetime': datetimeIndexHTML,
  '/dnd': dndIndexHTML,
  '/fluent': fluentIndexHTML,
  '/mantine': mantineIndexHTML,
  '/material': materialIndexHTML,
  // Not working:
  '/native': nativeIndexHTML,
  '/': rqbIndexHTML,
  '/rqb': rqbIndexHTML,
  '/react-querybuilder': rqbIndexHTML,
  // Not working:
  '/tremor': tremorIndexHTML,
};

const port = process.env.PORT || 3100;

const server = Bun.serve({
  port,
  routes: indexHTMLs,
  async fetch() {
    return new Response('Page not found', { status: 404 });
  },
});

console.log(`Listening on ${server.url}`);
