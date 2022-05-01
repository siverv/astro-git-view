
const BASE_URL = import.meta.env.PUBLIC_BASE_URL || "/";


export function joinPath(...path){
	return path.filter(Boolean).join("/").replace(/\/+/g, "/");
}

export function getRootPath(){
	return BASE_URL;
}

export function getRepoPath(repo){
	return joinPath(BASE_URL, `${repo.getName()}`);
}

export function getRefPath(repo, ref){
	return joinPath(getRepoPath(repo), "tree", ref);
}

export function getTreePath(repo, ref, ...path){
	path = path.filter(segment => segment && segment !== ".").join("/")
	if(repo.isBadPath(path)){
		let {pathMap} = repo.getStaticHelpersSync();
		let refMap = pathMap.get(path).get(ref);
		if(!refMap){
			return null;
		} else {
			path = refMap.oid;
		}
	}
	return joinPath(getRefPath(repo,ref), path);
}

export function getRawPath(repo, ref, ...path){
	path = path.filter(segment => segment && segment !== ".").join("/")
	if(repo.isBadPath(path)){
		let {pathMap} = repo.getStaticHelpersSync();
		let refMap = pathMap.get(path).get(ref);
		if(!refMap){
			return null;
		} else {
			path = refMap.oid;
		}
	}
	return joinPath(getRepoPath(repo), "raw", ref, path);
}

export function getCommitPath(repo, ref, path){
	let hash = "";
	if(path){
		let {pathMap} = repo.getStaticHelpersSync();
		let entry = pathMap.get(path).get(ref);
		if(entry && entry.type === "blob"){
			hash = "B" + entry.oid;
		}
	}
	return joinPath(getRepoPath(repo), "commit", ref) + (hash ? "#" + hash : "");
}