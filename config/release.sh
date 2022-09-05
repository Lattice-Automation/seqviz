#!/bin/bash

set -e

if [ "$(git rev-parse --abbrev-ref HEAD)" != "develop" ]; then
  echo 'wrong branch: not on develop';
  exit 1;
fi

npm run test:ci
npm version "$1" --git-tag-version
npm run build
git add .
git commit --amend -C HEAD
npm publish
git push

version="$(jq -r '.version' < 'package.json')"
release="$(gh release create "$version" --title "$version" --generate-notes --target develop)"
open "$release"

npm run demo
