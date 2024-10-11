## Checklist for publishing

### Preparation

1. Update [CHANGELOG.md](CHANGELOG.md) with changes per [Keep a Changelog format](https://keepachangelog.com/).
2. Update documentation in [`website/docs`](website/docs) (and the latest version in [`website/versioned_docs`](website/versioned_docs) if not releasing a new major version).

### Publish to npm

[Publish from GitHub](#from-github) if possible to [add provenance statements](https://docs.npmjs.com/generating-provenance-statements).

#### From GitHub

> Note: The "Version" and "Publish" workflows are separate so that the "Publish" workflow can be run against the commit created by the "Version" workflow. This ensures that the provenance statements point to the commit with the latest version tag and not its parent commit.

1. Manually run the [Version](https://github.com/react-querybuilder/react-querybuilder/actions/workflows/version.yml) workflow.
2. Manually run the [Publish](https://github.com/react-querybuilder/react-querybuilder/actions/workflows/publish.yml) workflow.

#### Manual

3. Run `npx lerna version [major|minor|patch|prerelease]` (this automatically runs the `version` script in [`./package.json`](package.json) before committing and tagging).
4. Run `npx lerna publish from-git` (add ` --dist-tag next` if version was `prerelease` in previous step).

### Wrap up

5. Publish a [new release on GitHub](https://github.com/react-querybuilder/react-querybuilder/releases).
