import * as prod from './dist/index.es';
import { default as QBprod } from './dist/index.es';
import * as dev from './dist/index.es.dev';
import { default as QBdev } from './dist/index.es.dev';

export default process.env.NODE_ENV === 'production' ? QBprod : QBdev;
export const { ...exprt } = process.env.NODE_ENV === 'production' ? prod : dev;
