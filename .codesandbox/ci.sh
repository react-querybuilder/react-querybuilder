#!/usr/bin/env bash

export npm_config_user_agent="npm/? node/?"
# curl -fsSL https://bun.sh/install | bash
npm_config_user_agent="npm/? node/?" npm install --global bun
bun run build
