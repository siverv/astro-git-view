
export function getRepoPath(repo){
	return `/${repo.getName()}`;
}

export function getRefPath(repo, ref){
	return `${getRepoPath(repo)}/tree/${ref}`;
}

export function getTreePath(repo, ref, ...path){
	path = path.filter(segment => segment && segment !== ".").join("/")
	if(repo.constructor.isBadPath(path)){
		let {pathMap} = repo.getStaticHelpersSync();
		path = pathMap.get(path).get(ref).oid;
	}
	return `${getRefPath(repo,ref)}/${path}`;
}

export function getCommitPath(repo, ref){
	return `${getRepoPath(repo)}/commit/${ref}`;
}