import { defineConfig } from 'astro/config';
import astroLunr from '@siverv/astro-lunr/plugin.mjs';
import astroGit from 'astro-git/plugin.mjs';
import nodejs from '@astrojs/node'
import {astroConfig, astroGitConfig, astroLunrConfig} from './astro.config.common.mjs';

process.env.PUBLIC_BASE_URL = astroConfig.base;
process.env.PUBLIC_LUNR_DIR = astroLunrConfig.subDir;
process.env.PUBLIC_IS_SSR = "true";

// https://astro.build/config
export default defineConfig({
  ...astroConfig,
  adapter: nodejs(),
  outDir: './dist-ssr',
  integrations: [
    astroGit(astroGitConfig),
    astroLunr(astroLunrConfig),
  ],
});
