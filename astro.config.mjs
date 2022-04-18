import { defineConfig } from 'astro/config';
import astroLunr from '@siverv/astro-lunr/plugin.mjs';
import astroGit from 'astro-git/plugin.mjs';

// https://astro.build/config
export default defineConfig({
	site: "https://siverv.github.io",
	base: "/astro-git-view",
	integrations: [
		astroGit({
          repositories: [
            {name: "astro-git-view", dir: "."},
            {name: "astro-lunr", dir: "./integrations/astro-lunr"}
          ],
          badPathFilter: (path) => path.split("/").some(segment => segment === "index.html" || segment.match(/^\.\w/)),
          branchFilter: branch => ["dev", "master"].includes(branch),
          includeCommitRefs: false,
		}),
		astroLunr({
			subDir: "lunr",
			pathFilter: (pathname) => {
				return pathname.match(/\w+\/tree\//);
			},
			documentFilter: (doc) => {
				return doc.ref === "master" && !doc.canonicalUrl.includes("package-lock.json");
			},
			initialize: (builder, lunr) => {
				lunr.tokenizer.separator = /[^\w]+/;
				builder.pipeline.reset();
				builder.searchPipeline.reset();
				builder.field("ref", {boost: 0.01});
				builder.field("oid", {boost: 0.01});
				builder.field("path", {boost: 0.1});
				builder.field("name", {boost: 10});
				builder.field("content");
				builder.metadataWhitelist = ["position"];
			},
			verbose: true
		})
	],
});
