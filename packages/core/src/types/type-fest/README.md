## Vendored `type-fest`

This folder contains vendored copies of certain source files from the `type-fest` TypeScript utility library. The files are unchanged from the original source other than the removal of JSDoc `@category` tags and addition of `@group type-fest` tags to align with our own TypeDoc API generation.

These files are vendored to avoid requiring that users add `type-fest` as a dependency. See [#854](https://github.com/react-querybuilder/react-querybuilder/discussions/854) and [#857](https://github.com/react-querybuilder/react-querybuilder/issues/857)

To check if this folder is already up to date with the latest installed version of `type-fest`, run the following from the root of the repository:

```bash
bun check-type-fest
```

To regenerate this folder based on the latest installed version of `type-fest`, run:

```bash
bun update-type-fest
```

To force regeneration regardless of whether this folder is up to date, add the `--force` flag:

```bash
bun update-type-fest --force
```
