#!/usr/bin/env bash

npm install --global bun

# Ignore scripts to avoid prisma preinstall, which fails because the
# CodeSandbox CI Node version doesn't meet Prisma's minimum requirement.
bun install --frozen-lockfile --ignore-scripts
bun node_modules/bun/install.js
