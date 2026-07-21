// Registers the TS6 resolve hook (see typescript6-hooks.mjs). Loaded via
// `node --import` (NODE_OPTIONS) for the website build so typedoc uses TS6.
import { register } from 'node:module';

register('./typescript6-hooks.mjs', import.meta.url);
