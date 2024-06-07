#!/usr/bin/env bash

# CodeSandbox CI doesn't have the `alias` or `source` commands available,
# so we can't use the line below (the preferred installation method).
# curl -fsSL https://bun.sh/install | bash

# We can use an npm global install, but we have to override the
# npm_config_user_agent environment variable. Otherwise, Bun throws
# an error about not being compatible with Yarn because it sees Yarn's
# user agent string since CodeSandbox always runs `yarn run ...`.
# See https://github.com/oven-sh/bun/issues/2530.
npm_config_user_agent="npm/? node/?" npm install --global bun

# CodeSandbox CI runs `yarn install` unconditionally, so we need to
# remove any new artifacts from that command.
rm -rf node_modules ./packages/*/node_modules ./website/node_modules yarn.lock .yarn .yarnrc.yml

# Now we can get on with business...
bun install --frozen-lockfile
bun run build
