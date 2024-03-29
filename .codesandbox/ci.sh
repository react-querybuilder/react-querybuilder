#!/usr/bin/env bash

# CodeSandbox CI doesn't have the `alias` or `source` commands available,
# so we can't use the line below (the preferred installation method).
# curl -fsSL https://bun.sh/install | bash

# We can use an npm global install, but we have to override the
# npm_config_user_agent environment variable. Otherwise, Bun throws
# an error about not being compatible with Yarn because it sees Yarn's
# user agent string since CodeSandbox always runs `yarn run ...`.
npm_config_user_agent="npm/? node/?" npm install --global bun

# Now we can get on with business...
yarn install --immutable
bun run build
