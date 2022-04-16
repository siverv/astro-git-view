import { defineConfig } from 'astro/config';
import astroLunr from 'astro-lunr/plugin.mjs';
import astroGit from 'astro-git/plugin.mjs';

// https://astro.build/config
export default defineConfig({
	siteUrl: "localhost",
	integrations: [
		astroGit({
          repositories: [
            {name: "astro-git-view", dir: "."},
          ],
          branchFilter: branch => ["dev", "master"].includes(branch),
          includeCommitRefs: false
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
	]
});
