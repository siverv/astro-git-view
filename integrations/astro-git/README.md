

# astro-git

[Git](https://git-scm.com/) integration for [Astro](https://astro.build/), for use in static path and page generation. Based on [isomorphic-git](https://isomorphic-git.org/).

See example usage in [astro-git-view](https://github.com/siverv/astro-git-view)

## Usage

```js
import { defineConfig } from 'astro/config';
import astroGit from 'astro-git/plugin.mjs';
export default defineConfig({
  integrations: [
    astroGit({})
  ]
});
```

### Config

repositories, includeCommitRefs, branchFilter, tagFilter, verbose

| Config field        | Type                | Description                                  |
|:------------------- |:------------------  |:-------------------------------------------- |
| `repositories`      | [{name?: string, dir: string}] | Repositories to include.  |
| `includeCommitRefs` | boolean             | Whether the commit-hashes should be included in the static path helpers. |
| `branchFilter`      | (string) => boolean | Filter the branches that should be considered relevant |
| `tagFilter`         | (string) => boolean | Filter the tags that should be considered relevant |
| `verbose`           | boolean             | Debug log |


### Example from astro-git-view

Names should be url-safe.

```js
astroGit({
  repositories: [
    {dir: "/path/to/some/repo/with-a-name"}, // named "with-a-name"
    {name: "custom-name", dir: "/path/to/some/repo/with-another-name", tagFilter: tag => false },
    {name: "yet-another", dir: "/path/to/some/repo/yet-another", includeCommitRefs: true},
  ],
  branchFilter: branch => ["dev", "master"].includes(branch),
  tagFilter: tag => tag.match(/v\d+(\.\d+(\.\d+)?)?/),
  includeCommitRefs: false,
  verbose: false
})
```

## The `Repo`-class

Functions from isomorphic git are gradually included as the example projects need them, though with some name-changes.

## Helpers for `getStaticPaths`

The helpers can be imported from `astro-git/gitStaticPaths.js`; 

| Function name             | Description                                        |
|:--------------------------------- |:-------------------------------------------- |
| `getRepoStaticPaths`        | `repo`-param for each repository containing the repo-name    |
| `async getRepoRefsStaticPaths`  | `(repo, ref)`-pair for each reference (branch, tag, and commit if `includeCommitRefs`) |
| `async getRepoTreesStaticPaths`   | `(repo, ref, path)` for each path within each ref within each repo |
| `async getRepoOidsStaticPaths`  | `(repo, oid)` for each tree/blob oid |
| `async getRepoBlobsStaticPaths` | `(repo, ref, path)` for each blob |


## Shortcomings

1. The primary drawback is: it is going to be _slow_ on large git repos. Limit the slowness using the branch- and tag-filters. The future might include a limit to logs, thus reducing the number of commits considered relevant for each named ref.
2. Cloning from a repo-link is not yet implemented, though isomorphic git can support this.
3. `index.html`-files in a repo is in a tricky situation, as it is the name of the auto-generated files from Astro. These are therefore only accessible through oid-based urls, as in `/repo/tree/master/d093e385a31922954d187f3e16d453863be8e0ce` 
