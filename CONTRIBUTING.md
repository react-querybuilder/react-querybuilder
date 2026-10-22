# Contributing

Contributions to `react-querybuilder` and associated packages are more than welcome!

_**First contribution?** Learn [how to contribute to an open source project on GitHub][egghead] (free course)._

## Project setup

This project requires [Bun][bun].

1. Fork and clone this repository.
2. Run `bun install` to install dependencies.
3. Build the packages with `bun run build`.
4. Create a branch for your PR with `git checkout -b your-branch-name`.

## Testing changes

To serve a demo page locally, run `bun start`. This demo is <abbr title="Hot Module Reloading">HMR</abbr>-enabled and can load the compatibility packages.

Your IDE should check for TypeScript and lint problems as you code, but to check manually run `bun typecheck`/`bun lint`.

<details>

<summary>Testing individual packages</summary>

Each package has its own `start:*`, `build:*`, and `typecheck:*` scripts, as well as `test:*` scripts with coverage checking bounded to the subject package (for granular coverage checks).

| Package                            | Start script          | Build script          | Typecheck script          | Test script          |
| ---------------------------------- | --------------------- | --------------------- | ------------------------- | -------------------- |
| All packages                       | `bun start`           | `bun run build`       | `bun typecheck`           | `bun run test`       |
| `react-querybuilder`               | `bun start:rqb`       | `bun build:rqb`       | `bun typecheck:rqb`       | `bun test:rqb`       |
| `@react-querybuilder/antd`         | `bun start:antd`      | `bun build:antd`      | `bun typecheck:antd`      | `bun test:antd`      |
| `@react-querybuilder/bootstrap`    | `bun start:bootstrap` | `bun build:bootstrap` | `bun typecheck:bootstrap` | `bun test:bootstrap` |
| `@react-querybuilder/bulma`        | `bun start:bulma`     | `bun build:bulma`     | `bun typecheck:bulma`     | `bun test:bulma`     |
| `@react-querybuilder/chakra`       | `bun start:chakra`    | `bun build:chakra`    | `bun typecheck:chakra`    | `bun test:chakra`    |
| `@react-querybuilder/datetime`     | `bun start:datetime`  | `bun build:datetime`  | `bun typecheck:datetime`  | `bun test:datetime`  |
| `@react-querybuilder/dnd`          | `bun start:dnd`       | `bun build:dnd`       | `bun typecheck:dnd`       | `bun test:dnd`       |
| `@react-querybuilder/expr`         | `bun start:expr`      | `bun build:expr`      | `bun typecheck:expr`      | `bun test:expr`      |
| `@react-querybuilder/fluent`       | `bun start:fluent`    | `bun build:fluent`    | `bun typecheck:fluent`    | `bun test:fluent`    |
| `@react-querybuilder/mantine`      | `bun start:mantine`   | `bun build:mantine`   | `bun typecheck:mantine`   | `bun test:mantine`   |
| `@react-querybuilder/material`     | `bun start:material`  | `bun build:material`  | `bun typecheck:material`  | `bun test:material`  |
| `@react-querybuilder/native`       | `bun start:native`    | `bun build:native`    | `bun typecheck:native`    | `bun test:native`    |
| `@react-querybuilder/prime`        | `bun start:prime`     | `bun build:prime`     | `bun typecheck:prime`     | `bun test:prime`     |
| `@react-querybuilder/rules-engine` | `bun start:re`        | `bun build:re`        | `bun typecheck:re`        | `bun test:re`        |
| `@react-querybuilder/tremor`       | `bun start:tremor`    | `bun build:tremor`    | `bun typecheck:tremor`    | `bun test:tremor`    |

</details>

To locally serve the documentation website, run `bun web`. (To skip regeneration of the TypeDoc API docs, run `bun web:skiptypedoc`.)

The website demo uses the static build of each package and therefore does not support HMR except for the website code itself. To update the website after making changes to one of the packages, run the package's `build:*` script. The change will be detected and the website will be reloaded automatically.

## Proposing changes

Before submitting a pull request, please do the following:

- Discuss the change you wish to make by creating a [new issue][new-issue], creating a [discussion topic][new-discussion], or chatting with us on [Discord][discord].
- Run `bun check:all` to make sure CI will run successfully.
- If adding a new feature, add corresponding tests (we maintain 100% coverage).
- If changing behavior or adding a feature, update the documentation. You may need to update both the [current (aka "next") docs](./website/docs/) and the latest [versioned docs](./website/versioned_docs/).
- If your editor doesn't automatically format code with [oxfmt][oxfmt] when saving changes, run `bun fmt`.
- When addressing a bug, refer to an existing GitHub issue or provide a reproducible example. Any interactive demo or minimal repository is fine, including [CodeSandbox][codesandbox] or [StackBlitz][stackblitz]. You can use the [CI base][example-ci], the [basic example][example-basic-ts] ([JS version][example-basic]), or any of the other [examples](./examples/) as a starter template.

## Generated files

<details>

<summary>
Some files committed to this repository are generated by scripts and should not be modified by hand. If you modify any of the following source files, regenerate the dependent files before committing your changes.
</summary>

### CEL and SQL parsers

Run `bun generate-parsers`.

| Source file                                                             | Generated file                                                                |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [cel.jison](./packages/react-querybuilder/src/utils/parseCEL/cel.jison) | [celParser.js](./packages/react-querybuilder/src/utils/parseCEL/celParser.js) |
| [sql.jison](./packages/react-querybuilder/src/utils/parseSQL/sql.jison) | [sqlParser.js](./packages/react-querybuilder/src/utils/parseSQL/sqlParser.js) |

### Examples

Run `bun generate-examples`.

Sources:

- [examples/\_template](./examples/_template) - template example folder
- [examples/exampleConfigs.ts](./examples/exampleConfigs.ts) - configurations for each example
- [examples/generateExamples.ts](./examples/generateExamples.ts) - script to generate examples from template

Generated folders:

- [examples/antd](./examples/antd)
- [examples/basic-ts](./examples/basic-ts)
- [examples/basic](./examples/basic)
- [examples/bootstrap](./examples/bootstrap)
- [examples/bulma](./examples/bulma)
- [examples/chakra](./examples/chakra)
- [examples/datetime](./examples/datetime)
- [examples/dnd](./examples/dnd)
- [examples/fluent](./examples/fluent)
- [examples/mantine](./examples/mantine)
- [examples/material](./examples/material)

(The dependencies and Prettier configs of other [examples](./examples) will be updated, but they will not be completely regenerated like the ones listed above.)

</details>

## Publishing

### Preparation

1. Update [CHANGELOG.md](./CHANGELOG.md) with changes per [Keep a Changelog format](https://keepachangelog.com/).
2. Update documentation in [`website/docs`](./website/docs) (and the latest version in [`website/versioned_docs`](./website/versioned_docs) if not releasing a new major version).

### Publish to npm

[Publish from GitHub](#from-github) if possible to [add provenance statements](https://docs.npmjs.com/generating-provenance-statements).

#### From GitHub

> Note: The "Version" and "Publish" workflows are separate so that the "Publish" workflow runs against the commit created by the "Version" workflow. This ensures that the provenance statements point to the commit with the latest version tag and not its parent commit.

1. Manually run the [Version](https://github.com/react-querybuilder/react-querybuilder/actions/workflows/version.yml) workflow, choosing a version bump strategy and setting **Run type** to **Live**. It bumps the package versions with Lerna, pushes the tag, and creates a GitHub Release. (Use **Dry run** to preview without changing anything.)
2. Creating the release automatically triggers the [Publish](https://github.com/react-querybuilder/react-querybuilder/actions/workflows/publish.yml) workflow — there is no need to run it by hand. It builds the packages and publishes them to npm, choosing the dist-tag from the release:
   - Prereleases (e.g. `8.0.0-next.1`) publish under the `next` tag.
   - Stable releases marked "latest" publish under the `latest` tag.
   - Stable releases _not_ marked "latest" are skipped.

   The Publish workflow can still be run manually if you need to re-publish or push a specific dist-tag.

#### Manual

1. Run `npx lerna version [major|minor|patch|prerelease]` (this automatically runs the `version` script in [`./package.json`](./package.json) before committing and tagging).
2. Run `npx lerna publish from-git` (add ` --dist-tag next` if version was `prerelease` in previous step).
3. Publish a [new release on GitHub](https://github.com/react-querybuilder/react-querybuilder/releases). (When publishing [from GitHub](#from-github), the "Version" workflow does this automatically.)

[new-issue]: https://github.com/react-querybuilder/react-querybuilder/issues/new
[new-discussion]: https://github.com/react-querybuilder/react-querybuilder/discussions/new
[discord]: https://react-querybuilder.js.org/discord
[egghead]: https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github
[bun]: https://bun.com/
[oxfmt]: https://oxc.rs/docs/guide/usage/formatter.html
[codesandbox]: https://codesandbox.io
[stackblitz]: https://stackblitz.com
[example-ci]: https://github.com/react-querybuilder/react-querybuilder/tree/main/examples/ci
[example-basic-ts]: https://github.com/react-querybuilder/react-querybuilder/tree/main/examples/basic-ts
[example-basic]: https://github.com/react-querybuilder/react-querybuilder/tree/main/examples/basic
