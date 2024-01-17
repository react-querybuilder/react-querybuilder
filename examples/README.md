## Examples

### Cloning locally

To clone a copy of an example without cloning this entire repo:

```bash
npx degit github:react-querybuilder/react-querybuilder/examples/example-name my-rqb-example
```

Replace `example-name` with the example's folder name. For example, to clone the [basic-ts](./basic-ts/) example:

```bash
npx degit github:react-querybuilder/react-querybuilder/examples/basic-ts my-rqb-example
```

### CodeSandbox

To set up CodeSandbox using one of the examples as a template:

1. Navigate to the example folder (e.g. [basic-ts](./basic-ts/)) on GitHub.
2. In the browser address bar, change the domain of the URL from `github.com` to `githubbox.com` (add "box" between "github" and ".com") and press Enter/Return.

You will be forwarded to [codesandbox.io](https://codesandbox.io) with the example project preloaded.

## Development

To update the examples, modify the [`_template` example](./_template/) and/or [exampleConfigs.ts](./exampleConfigs.ts) and then run `bun generate-examples` from the repo root directory (requires [Bun](https://bun.sh)). The examples configured in [exampleConfigs.ts](./exampleConfigs.ts) will be completely regenerated.
