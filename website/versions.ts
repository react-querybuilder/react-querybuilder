// Doc versions. `default` served at `/docs/**`, `next` at `/docs/next/**`, others at `/docs/<v>/**`
export const defaultVersion = '7';
export const versions = [
  { id: 'next', label: 'Next', path: '/docs/next' },
  { id: '7', label: 'v7 / v8', path: '/docs' },
  { id: '6', label: 'v6', path: '/docs/6' },
  { id: '5', label: 'v5', path: '/docs/5', archived: true },
  { id: '4', label: 'v4', path: '/docs/4', archived: true },
  { id: '3', label: 'v3', path: '/docs/3', archived: true },
] as const;
export type VersionId = (typeof versions)[number]['id'];
