## Checklist for publishing

### Preparation

1. Update [CHANGELOG.md](CHANGELOG.md) with changes per [Keep a Changelog format](https://keepachangelog.com/).
2. Update documentation in [`website/docs`](website/docs) (and the latest version in [`website/versioned_docs`](website/versioned_docs) if not releasing a new major version).

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

3. Run `npx lerna version [major|minor|patch|prerelease]` (this automatically runs the `version` script in [`./package.json`](package.json) before committing and tagging).
4. Run `npx lerna publish from-git` (add ` --dist-tag next` if version was `prerelease` in previous step).

### Wrap up

5. Publish a [new release on GitHub](https://github.com/react-querybuilder/react-querybuilder/releases). (When publishing [from GitHub](#from-github), the "Version" workflow already does this automatically.)
