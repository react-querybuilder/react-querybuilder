export type LernaJSON = {
  packages: string[];
  version: string;
  npmClient: 'yarn' | 'npm';
  useWorkspaces: boolean;
};
