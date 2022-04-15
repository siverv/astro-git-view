
import {getRepos, Repo} from './git';

export function getRepoStaticPaths(){
  return getRepos().map(repo => ({params: {repo: repo.getName()}}));
}

export async function getRepoRefsStaticPaths(){
  return (await Promise.all(getRepos().map(async repo => {
    let name = repo.getName();
    let refs = await repo.getNamedRefs();
    if(repo.includeCommitRefs){
      refs = refs.concat(await repo.getCommitRefs());
    }
    return refs.map(ref => ({params: {repo: name, ref}}))
  }))).flat();
}

export async function getRepoTreesStaticPaths(){
  return (await Promise.all(getRepos().map(async repo => {
    let name = repo.getName();
    let {refPathMap} = await repo.getStaticHelpers();
    let treeEntries = Array.from(refPathMap.entries());
    if(!repo.includeCommitRefs){
      let namedRefs = await repo.getNamedRefs();
      treeEntries = treeEntries.filter(([ref]) => namedRefs.includes(ref));
    }
    return treeEntries
      .flatMap(([ref, map]) => Array.from(map.entries()).map(([key, entry]) => {
        let path = Repo.isBadPath(key) ? entry.oid : key;
        return {params: {repo: name, ref, path}}
      }));
  }))).flat();
}

export async function getRepoOidsStaticPaths(){
  return (await Promise.all(getRepos().map(async repo => {
    let name = repo.getName();
    let {oidMap} = await repo.getStaticHelpers();
    return Array.from(oidMap.keys())
      .map(oid => ({params: {repo: name, oid}}));
  }))).flat();
}

export async function getRepoBlobsStaticPaths(){
  return (await Promise.all(getRepos().map(async repo => {
    let name = repo.getName();
    let {blobOidSet, oidMap} = await repo.getStaticHelpers();
    return Array.from(blobOidSet).map(ref => {
      return {params: {repo: name, ref, path: oidMap.get(ref)}};
    });
  }))).flat();
}