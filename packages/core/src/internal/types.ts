import type { API, FileInfo } from 'jscodeshift';

export type LanguageParserCodeMod = (file: FileInfo, api: API) => string;
