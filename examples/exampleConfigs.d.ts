type Dependencies = Record<string, string>;

export type PackageJSON = {
  name: string;
  description: string;
  dependencies: Dependencies;
  devDependencies: Dependencies;
  [x: string]: any;
};

interface ExampleConfig {
  name: string;
  dependencies: Dependencies;
  scssPre: string[];
  scssPost: string[];
  tsxImports: string[];
  additionalDeclarations: string[];
  wrapper: [string, string] | null;
  compileToJS: boolean;
  isCompatPackage: boolean;
}

export type ExampleConfigs = Record<string, ExampleConfig>;
