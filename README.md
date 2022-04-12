# Astro Git

A server-side generated source code explorer for git-repositories, inspired by [stagit](https://codemadness.org/stagit.html), built with [Astro](https://astro.build)

## 🧞 Commands

First set the `GIT_REPO_DIR`-env variable as the full path to the repo you want to build for.

All commands are run from the root of the project, from a terminal:

| Command           | Action                                       |
|:----------------  |:-------------------------------------------- |
| `npm ci --ignore-scripts`     | Installs dependencies                        |
| `npm run dev`     | Starts local dev server at `localhost:3000`  |
| `npm run build`   | Build your production site to `./dist/`      |
| `npm run preview` | Preview your build locally, before deploying |
