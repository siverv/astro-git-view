import fs from 'fs';
import git from 'isomorphic-git'
import { TREE , STAGE  } from 'isomorphic-git'


const gitConfig = {
	fs,
	dir: import.meta.env.GIT_REPO_DIR
};


export function getName(){
	return gitConfig.dir.split("/").pop();
}

export function getDescription(){
	return fs.readFileSync(gitConfig.dir + "/.git/description");
}

export async function getBranches(){
	return await git.listBranches(gitConfig);
}


export async function getTags(){
	return await git.listTags(gitConfig);
}

export async function resolveRef(ref){
	return await git.resolveRef({...gitConfig, ref});
}

export async function getMainBranch(){
	return await git.currentBranch(gitConfig);
}

export async function getBranchInfo(){
	let branches = await git.listBranches(gitConfig);
	return {
		current: await git.currentBranch(gitConfig),
		branches: branches.map(branch => {
			return branch;
			/*return {
				name: branch,
				info: 
			}*/
		})
	}
}

export async function getLog(ref){
	return await git.log({...gitConfig, ref})
}
export async function getLogForRef(ref){
	return await git.log({...gitConfig, ref})
}

export async function listFiles(ref){
	return await git.listFiles({...gitConfig, ref})
}

export async function getFiles(ref){
	return await git.listFiles({...gitConfig, ref})
}

export async function getCommit(oid){
	return await git.readCommit({...gitConfig, oid});
}

export async function getBlob(oid){
	return await git.readBlob({...gitConfig, oid})
}

export async function getTree(oid){
	return await git.readTree({...gitConfig, oid})
}

export async function getObject(ref, path){
	return await git.readObject({...gitConfig, oid: ref, format: "parsed", filepath: path})
}

export async function getCompleteWalk(trees){
	return await git.walk({...gitConfig, trees: trees.map(tree => TREE({ref: tree})), map: async (path, entries) => {
		return {
			path,
			entries: await Promise.all(entries.map(async (entry, index) => {
				if(!entry){
					return null;
				}
				let type = await entry.type();
				return {
					oid: await entry.oid(),
					type: type,
					mode: (await entry.mode()).toString("8")
				}
			}))
		};
	}})
}


export function commitEntryDate(commitEntry){
	return new Date((commitEntry.commit.author.timestamp + commitEntry.commit.author.timezoneOffset * 60) * 1000);
}