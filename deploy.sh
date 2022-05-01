#!/usr/bin/env sh

set -e

npm run build -- --experimental-integrations

cd dist

git init
git checkout -b gh-pages
git add -A
git commit -m 'deploy'


git push -f git@github.com:siverv/astro-git-view.git gh-pages:gh-pages

cd -