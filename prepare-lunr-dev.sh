#!/bin/bash

npm run build -- --experimental-integrations || exit
cp {dist,public}/lunr-index.json
cp {dist,public}/lunr-docs.json