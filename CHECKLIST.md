## Checklist for publishing

1. Update [CHANGELOG.md](CHANGELOG.md) with changes per [Keep a Changelog format](https://keepachangelog.com/)
2. Update documentation in [`website/docs`](website/docs) and [`website/versioned_docs`](website/versioned_docs)
3. Run `yarn lerna version [major|minor|patch|prerelease]` (this automatically runs the `version` script in [`./package.json`](package.json) before committing and tagging)
4. Run `yarn lerna publish from-git` (with `--dist-tag next` if version was `prerelease` in previous step)
