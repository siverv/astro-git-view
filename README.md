# Astro Git View

A server-side generated source code explorer for git-repositories, inspired by [stagit](https://codemadness.org/stagit.html), built with [Astro](https://astro.build)

See [astro-git](./integrations/astro-git) and [astro-lunr](https://github.com/siverv/astro-lunr) for the astro-plugins that supply most of the functionality.

[Pure SSG demo on Github Pages](https://siverv.github.io/astro-git-view/)

[SSG/SSR-hybrid demo on git.kvissleik.no](https://git.kvissleik.no)

The SSG/SSR-hybrid maintains the full tree-view for each included branch and tag, but specific commits and raw files are served using the SSR-module.

## Commands

All commands are run from the root of the project, from a terminal:

| Command          							 		| Action                                       |
|:------------------------------------------------- |:-------------------------------------------- |
| `npm ci --ignore-scripts` 						| Installs dependencies                        |
| `npm run dev -- --experimental-integrations`     	| Starts local dev server at `localhost:3000`  |
| `npm run build -- --experimental-integrations`   	| Build your production site to `./dist/`      |
| `npm run preview -- --experimental-integrations` 	| Preview your build locally, before deploying |


## Running SSR 

### in Docker

SSR is SSR-only, but for deployment, I want SSG for common resources, and SSR for the more obscure parts.

To use:

```
docker compose up -d
```

This will start a server at `localhost:80`


### Standalone

```
npm run build-ssr -- --experimental-integrations
npm run serve-ssr -- --experimental-integrations
```

Then go to `localhost:12549`

Static assets are not included, meaning styling and scripting will be missing.


### SSR + astro-lunr

Note that `astro-lunr` is currently not removing the `<lunr-document/>`-elements when hosted using SSR. (Seems like `options.addRenderer` is not included by the adapter?)

Therefore a temporary css-style of `lunr-document {display: none}` is included in main.css;