## Checklist for publishing

1. Update [CHANGELOG.md](CHANGELOG.md) with changes per [Keep a Changelog format](https://keepachangelog.com/).
2. Update documentation in [`website/docs`](website/docs) (and the latest version in [`website/versioned_docs`](website/versioned_docs) if not releasing a new major version).

### Publishing from GitHub

3. Manually run the [Version](https://github.com/react-querybuilder/react-querybuilder/actions/workflows/version.yml) workflow.
4. Manually run the [Publish](https://github.com/react-querybuilder/react-querybuilder/actions/workflows/version.yml) workflow.

### Manual publishing

([Publish from GitHub](#publishing-from-github) if possible to [add provenance statements](https://docs.npmjs.com/generating-provenance-statements).)

3. Run `npx lerna version [major|minor|patch|prerelease]` (this automatically runs the `version` script in [`./package.json`](package.json) before committing and tagging).
4. Run `npx lerna publish from-git` (add ` --dist-tag next` if version was `prerelease` in previous step).
