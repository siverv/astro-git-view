
import {getBranches, getLog, getTags, getFiles, getCompleteWalk} from '@utils/git';

const repoMap = new Map();
const defaultRepo = "default";

export const BAD_NAMES = ["index.html"]

export async function getRepoMaps(repo=defaultRepo){
	if(repoMap.has(repo)){
		return repoMap.get(repo);
	}
	console.log(`Initializing repo ${repo}`)
	const branches = await getBranches();
	const tags = await getTags();
	const branchLogs = await Promise.all(branches.map(branch => getLog(branch)));
	const commitRefs = branchLogs.flatMap(log => log.map(entry => entry.oid));

	const refs = Array.from(new Set(branches.concat(tags).concat(commitRefs)));
	console.log(`Processing ${refs.length} refs`);

	const completeWalk = await getCompleteWalk(refs);
	const pathMap = new Map();
	const oidMap = new Map();
	const blobOidSet = new Set();
	const refPathMap = new Map(refs.map(ref => [ref, new Map()]));
	completeWalk.forEach(({path, entries}) => {
		pathMap.set(path, new Map(entries.flatMap((entry, index) => {
			if(!entry){
				return [];
			}
			return [[refs[index], entry]]
		})));
		if(BAD_NAMES.includes(path)){
			let oids = entries.map(entry => entry?.oid).filter(id=>id);
			refs.forEach(ref => oids.forEach(oid => refPathMap.get(ref).set(oid, null)));
			entries.forEach((entry, index) => {
				if(entry){
					refPathMap.get(refs[index]).set(entry.oid, entry);
				}
			})
		}
		entries.forEach((entry, index) => {
			if(entry){
				oidMap.set(entry.oid, path);
				blobOidSet.add(entry.oid);
			}
			refPathMap.get(refs[index]).set(path, entry);
		});
	});
	const maps = {pathMap, oidMap, refPathMap, blobOidSet};
	repoMap.set(repo, maps);
	return maps;
}

export async function getRefs(repo){
	let {refPathMap} = await getRepoMaps(repo);
	return Array.from(refPathMap.keys())
		.map(ref => ({params: {ref}}));
}

export async function getOids(repo){
	let {oidMap} = await getRepoMaps(repo);
	return Array.from(oidMap.keys())
		.map(oid => ({params: {oid}}));
}

export async function getPaths(repo){
	let {refPathMap} = await getRepoMaps(repo);
	return Array.from(refPathMap.entries())
		.flatMap(([ref, map]) => Array.from(map.keys()).map(path => ({params: {ref, path}})));
}

export async function getPathsWithIndexHandling(repo){
	let {refPathMap} = await getRepoMaps(repo);
	return Array.from(refPathMap.entries())
		.flatMap(([ref, map]) => Array.from(map.entries()).map(([key, entry]) => {
			let path = key === "index.html" ? entry.oid : key;
			return {params: {ref, path}}
		}));
}

export async function getBlobRefs(repo) {
	let {blobOidSet, oidMap} = await getRepoMaps(repo);
	return Array.from(blobOidSet).map(ref => {
		return {params: {ref, path: oidMap.get(ref)}}
	})
}


export async function getHistory(ref, path) {
	const log = await getLog(ref);
	const {refPathMap} = await getRepoMaps();
	return log
	  .map(entry => ({
	    ref: entry.oid,
	    timestamp: entry.commit.author.timestamp,
	    checksum: refPathMap.get(entry.oid)?.get(path)?.oid,
	    entry
	  }))
	  .filter(a => a.checksum)
	  .sort((a,b) => a.timestamp - b.timestamp)
	  .filter((a,i,l) => l.findIndex(b => b.checksum === a.checksum) === i)
	  .sort((a,b) => b.timestamp - a.timestamp)
	  .map(a => a.entry);
}