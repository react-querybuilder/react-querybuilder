# Website

This website is built using [Rspress](https://rspress.rs/), a static site generator based on Rsbuild.

**All commands below should be run in the repo root directory** (this directory's parent, i.e. `../` from here).

### Installation

```sh
bun install
```

### Local Development

First build the packages (the website imports package source directly, but CSS comes from each package's build output).

```sh
bun run build
```

Then start the website dev server.

```sh
bun web
```

If the API docs have already been generated, you can skip that step of the build by running

```sh
bun web:skiptypedoc
```

This command starts a local development server and opens up a browser window. Most changes to website and package code are reflected live without having to restart the server. Changes to package stylesheets require rebuilding the updated package.

### Build

```sh
bun website:build
```

This command generates static content into the `build` directory and can be served using any static content hosting service. `bun website:build:llms` also generates `llms.txt`, `llms-full.txt`, and `llms-api.txt` (always generated in CI).

### Deployment

A preview of the website will be available on Netlify when a PR is submitted.

The production website, https://react-querybuilder.js.com/, is deployed on every push to the `main` branch on GitHub.
