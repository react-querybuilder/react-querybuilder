type Dependencies = Record<string, string>;

export type PackageJSON = {
  name: string;
  description: string;
  dependencies: Dependencies;
  devDependencies: Dependencies;
  peerDependencies: Dependencies;
  [x: string]: any;
};

interface ExampleConfig {
  name: string;
  dependencyKeys: (string | [string, string])[];
  scssPre: string[];
  scssPost: string[];
  tsxImports: string[];
  additionalDeclarations: string[];
  wrapper: [string, string] | null;
  props: string[];
  compileToJS: boolean;
  isCompatPackage: boolean;
  enableDnD: boolean;
}

export type ExampleConfigs = Record<string, ExampleConfig>;

export const configs: ExampleConfigs;
