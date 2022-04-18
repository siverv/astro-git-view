# Astro Git View

A server-side generated source code explorer for git-repositories, inspired by [stagit](https://codemadness.org/stagit.html), built with [Astro](https://astro.build)

See [astro-git](./integrations/astro-git) and [astro-lunr](./integrations/astro-lunr) for the astro-plugins that supply most of the functionality.

[Demo on Github Pages](https://siverv.github.io/astro-git-view/)

Note that usage on github pages requires a fix to [the base-path problem for static assets](https://github.com/withastro/astro/issues/3119), otherwise it will be without style and script. At the moment, this is built with a local fork of Astro that fixes this.

## Commands

All commands are run from the root of the project, from a terminal:

| Command          							 		| Action                                       |
|:------------------------------------------------- |:-------------------------------------------- |
| `npm ci --ignore-scripts` 						| Installs dependencies                        |
| `npm run dev -- --experimental-integrations`     	| Starts local dev server at `localhost:3000`  |
| `npm run build -- --experimental-integrations`   	| Build your production site to `./dist/`      |
| `npm run preview -- --experimental-integrations` 	| Preview your build locally, before deploying |
