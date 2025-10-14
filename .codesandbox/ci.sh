#!/usr/bin/env bash

# CodeSandbox CI doesn't have the `alias` or `source` commands available,
# so we can't use the line below (the preferred installation method)...
# curl -fsSL https://bun.sh/install | bash

# ...we have to use an npm global install:
npm install --global bun
# Use this to pin Bun version:
# npm install --global bun@1.1.29

# Now we can get on with business...
bun install --frozen-lockfile
