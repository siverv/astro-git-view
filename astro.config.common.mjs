import { defineConfig } from 'astro/config';
import astroLunrPlugin from '@siverv/astro-lunr/plugin.mjs';
import astroGitPlugin from 'astro-git/plugin.mjs';
import nodejs from '@astrojs/node'
import fs from 'fs';
import path from 'path';

const repoArgIndex = Array.from(process.argv).findIndex(arg => arg.startsWith("--repositories"));
let repositories;
if(repoArgIndex < 0){
	repositories = [
    {name: "astro-git-view", dir: "."},
  ];
} else {
	let repoPath = process.argv[repoArgIndex + 1];
	try {
		repoPath = path.resolve(repoPath);
		let repositoriesString = fs.readFileSync(repoPath);
		repositories = JSON.parse(repositoriesString)
	} catch(err){
		err.message = "Could not find json-file for respositories at path: " + repoPath + "\n" + err.message;
		throw err;
	}
}

const siteArgIndex = Array.from(process.argv).findIndex(arg => arg.startsWith("--astro-site"));
let site;
if(siteArgIndex >= 0){
	site = process.argv[siteArgIndex + 1];
}

const baseArgIndex = Array.from(process.argv).findIndex(arg => arg.startsWith("--astro-base"));
let base;
if(baseArgIndex >= 0){
	base = process.argv[baseArgIndex + 1];
}

export const astroConfig = {
	site: site || "https://siverv.github.io",
	base: base || "/astro-git-view",
}

export const astroGitConfig = {
  repositories,
  badPathFilter: (path) => path.split("/").some(segment => segment === "index.html" || segment.match(/^\.\w/)),
  branchFilter: branch => ["dev", "master"].includes(branch),
  ignoreDiffFilter: path => path.includes("package-lock.json"),
  maxFileSizeForDiff: 100000,
  includeCommitRefs: false,
};

export const astroLunrConfig = {
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
}