import { defineConfig } from 'astro/config';
import astroLunr from './integrations/astro-lunr/plugin.mjs';
import astroGit from './integrations/astro-git/plugin.mjs';

// https://astro.build/config
export default defineConfig({
	siteUrl: "localhost",
	integrations: [
		astroGit({
          repositories: [
            {name: "infrastructure", dir: "/home/siver/Projects/kvissleik.no/infrastructure"},
            {name: "samspill", dir: "/home/siver/Projects/kvissleik.no/samspill"},
            {name: "kvissleik", dir: "/home/siver/Projects/kvissleik.no/kvissleik"},
            {name: "astro-git", dir: "/home/siver/Projects/astro-git/"},
          ],
          branchFilter: branch => ["dev", "master"].includes(branch),
          includeCommitRefs: false
		}),
		astroLunr({
			pathFilter: (pathname) => {
				return pathname.match(/\w+\/tree\/master/) && !pathname.includes("package-lock.json");
			},
			documentFilter: (doc) => {
				return doc.ref === "master";
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
			}
		})
	]
});
