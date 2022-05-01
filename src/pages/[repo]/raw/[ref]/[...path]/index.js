import {getRepo} from 'astro-git/git.js';

export async function get({ repo: repoName, ref, path, ...rest }) {
  console.log(rest);
  const repo = getRepo(repoName);
  if(!repo){
    return new Response(`Repository not found: ${repoName}`, {
       status: 404,
    });
  }

  const {refPathMap, pathMap, oidMap} = await repo.getStaticHelpers();
  if(!refPathMap.get(ref)){
    return new Response(`Reference not found: ${ref}`, {
       status: 404,
    });
  }

  path = oidMap.get(path) || path;
  const hasRef = refPathMap?.get(ref);
  let entry = refPathMap.get(ref)?.get(path);
  if(entry == null && entry.type != "blob"){
    return new Response(`File not found: ${path}`, {
       status: 404,
    });
  }

  const blob = await repo.getBlob(entry.oid);
  return new Response(blob.blob, {
    status: 200
  });
}

export const getStaticPaths = async () => [];