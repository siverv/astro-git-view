import { defineConfig } from 'astro/config';
import astroLunr from './integrations/astro-lunr/plugin.mjs';

// https://astro.build/config
export default defineConfig({
	siteUrl: "localhost",
	integrations: [
		astroLunr({
			pathFilter: (pathname) => {
				return pathname.startsWith("tree/master") && !pathname.includes("package-lock.json");
			},
			documentFilter: (doc) => {
				return doc.ref === "master";
			}
		})
	]
});
