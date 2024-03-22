# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

**All commands below should be run in the repo root directory** (this directory's parent, i.e. `../` from here).

### Installation

```sh
yarn install
```

### Local Development

First build the packages.

```sh
bun run build
```

Then start the website dev server.

```sh
bun web
```

If the API docs have already been generated, you can skip that step of the build by running

```
RQB_TYPEDOC_DONE=true bun web
```

This command starts a local development server and opens up a browser window. Most changes to the website code are reflected live without having to restart the server, but any changes to the packages would require a rebuild of any updated packages and a restart of the website server.

### Build

```sh
bun website:build
```

This command generates static content into the `build` directory and can be served using any static content hosting service.

### Deployment

A preview of the website will be available on Netlify when a PR is submitted.

The production website, https://react-querybuilder.js.com/, is deployed on every push to the `main` branch on GitHub.
