#!/bin/bash

set -e

if [ "$(git rev-parse --abbrev-ref HEAD)" != "develop" ]; then
  echo 'wrong branch: not on develop';
  exit 1;
fi

# lint
npm run lint

# run tests
npm run test

# build the package
npm run build

# build and deploy the demo
npm run demo

# bump the package version
npm version "$1" --git-tag-version

# build the package again with new version
npm run build

# git commit
git add .
git commit --amend -C HEAD
npm publish
git push

# create a release + tag
version="$(jq -r '.version' < 'package.json')"
release="$(gh release create "$version" --title "$version" --generate-notes --target develop)"
open "$release"
