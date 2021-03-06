import { defineConfig } from 'astro/config';
import astroLunr from '@siverv/astro-lunr/plugin.mjs';
import astroGit from 'astro-git/plugin.mjs';
import {astroConfig, astroGitConfig, astroLunrConfig} from './astro.config.common.mjs';


process.env.PUBLIC_BASE_URL = astroConfig.base;
process.env.PUBLIC_LUNR_DIR = astroLunrConfig.subDir;


// https://astro.build/config
export default defineConfig({
	...astroConfig,
	integrations: [
		astroGit(astroGitConfig),
		astroLunr(astroLunrConfig),
	],
});
