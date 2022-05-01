#!/bin/sh

## FOR USE WHEN DEPLOYING SSG/SSR-HYBRID USING DOCKER.

mkdir -p /var/www/git/html/

echo "Building repositories from $REPOSITORIES_JSON";

npm run build-ssg-ssr -- --repositories "$REPOSITORIES_JSON" --experimental-integrations --astro-base "$ASTRO_BASE" --astro-site "$ASTRO_SITE" 
npm run build-ssr -- --repositories "$REPOSITORIES_JSON" --experimental-integrations --astro-base "$ASTRO_BASE" --astro-site "$ASTRO_SITE"

cp -r ./dist/* /var/www/git/html/

git archive --format zip --output=/var/www/git/html/infrastructure-master.zip master --remote=/var/git/infrastructure/
git archive --format zip --output=/var/www/git/html/kvissleik-master.zip master --remote=/var/git/kvissleik/
git archive --format zip --output=/var/www/git/html/samspill-master.zip master --remote=/var/git/samspill/

npm run serve-ssr;