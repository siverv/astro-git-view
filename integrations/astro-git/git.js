import fs from 'fs';
import path from 'path';
import git from 'isomorphic-git'
import { TREE } from 'isomorphic-git'
import * as Diff from 'diff';

export class Repo {
  static BAD_NAMES = ["index.html"];
  static isBadPath(path){
    return Repo.BAD_NAMES.some(badName => path.endsWith(badName));
  }

  constructor({dir, includeCommitRefs, name, branchFilter, tagFilter, verbose}){
    this.config = {fs, dir};
    this.includeCommitRefs = includeCommitRefs == true;
    this.name = name || dir.split("/").pop();
    this.branchFilter = branchFilter || (() => true);
    this.tagFilter = tagFilter || (() => true);
    this.verbose = verbose;
    this.logMap = new Map();
    this.oidMap = new Map();
    this.refMap = new Map();
  }

  getName(){
    return this.name;
  }

  getDescription(){
    return this.description
      || (this.description = fs.readFileSync(path.join(this.config.dir, "/.git/description")));
  }

  async sortRefs(refs){
    return (await Promise.all(refs.map(async ref => {
      let oid = await this.resolveRef(ref);
      let object = await this.getObject(oid);
      return {
        ref, oid, object,
        date: this.getDateOfCommit(object)
      };
    }))).sort((a,b) => b.date - a.date).map(a => a.ref);
  }

  async getMainBranch(){
    return this.mainBranch
      || (this.mainBranch = await git.currentBranch(this.config));
  }

  async latestCommit(){
    let main = await this.getMainBranch();
    let log = await this.getLog(main);
    return log[0];
  }

  async getBranches(){
    return this.branches
      || (this.branches = await this.sortRefs((await git.listBranches(this.config)).filter(this.branchFilter)));
  }

  async getTags(){
    return this.tags
      || (this.tags = await this.sortRefs((await git.listTags(this.config)).filter(this.tagFilter)));
  }

  async getNamedRefs(){
    return (await this.getBranches()).concat(await this.getTags());
  }

  async getCommitRefs(){
    return this.commitRefs
      || (this.commitRefs =
          Array.from(new Set((await Promise.all((await this.getNamedRefs())
            .map(async ref => await this.getLog(ref))))
            .flatMap(log => log.map(({oid}) => oid)))));
  }

  async getLog(ref){
    if(!this.logMap.has(ref)){
      let log = await git.log({...this.config, ref});
      this.logMap.set(ref, log);
      return log;
    }
    return this.logMap.get(ref);
  }
  
  async resolveRef(ref){
    if(!this.refMap.has(ref)){
      let oid = await git.resolveRef({...this.config, ref});
      this.refMap.set(ref, oid);
      return oid;
    }
    return this.refMap.get(ref);
  }

  async getTree(oid){
    return await git.readTree({...this.config, oid});
  }

  async getBlob(oid){
    return await git.readBlob({...this.config, oid});
  }

  async getObject(oid){
    return await git.readObject({...this.config, oid});
  }

  async getCommit(oid){
    return await git.readCommit({...this.config, oid});
  }

  async getTag(oid){
    return await git.readTag({...this.config, oid});
  }

  async resolveObject(oid){
    if(!this.oidMap.has(oid)){
      let object = await git.readObject({...this.config, oid});
      if(object.type === "tree"){
        object = await git.readTree({...this.config, oid});
      } else if(object.type === "blob") {
        object = await git.readBlob({...this.config, oid});
      } else if(object.type === "commit") {
        object = await git.readCommit({...this.config, oid});
      } else if(object.type === "tag") {
        object = await git.readTag({...this.config, oid});
      } else {
        throw new Error(`Object retrieved by oid=${oid} has unknown type=${object.type}`);
      }
      this.oidMap.set(oid, object);
      return object;
    }
    return this.oidMap.get(oid);
  }

  async walk(trees){
    return await git.walk({...this.config, trees: trees.map(tree => TREE({ref: tree})), map: async (path, entries) => {
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

  getDateOfCommit(commitEntry){
    let timestampedMetadata = (commitEntry.commit||commitEntry.object)?.author
      || (commitEntry.tag||commitEntry.object)?.tagger
    return new Date((timestampedMetadata.timestamp - timestampedMetadata.timezoneOffset * 60) * 1000);
  }

  async getHistory(ref, path, repo) {
    if(!path){
      path = "."
    }
    let {refPathMap} = await this.getStaticHelpers(repo);
    const log = await this.getLog(ref);
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

  getStaticHelpersSync(){
    if(!this.helperMaps){
      throw new Error(`getStaticHelpersSync requires preloading the staticHelpers during initialization.`)
    }
    return this.helperMaps;
  }

  async getStaticHelpers(){
    if(this.helperMaps){
      return this.helperMaps;
    }
    const namedRefs = await this.getNamedRefs();
    const commitRefs = await this.getCommitRefs();
    const refs = namedRefs.concat(commitRefs);
    if(this.verbose){
      console.log(`Initializing repo ${this.getName()}, processing ${refs.length} refs`)
    }

    const completeWalk = await this.walk(refs);
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
      if(Repo.isBadPath(path)) {
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
    this.helperMaps = {namedRefs, pathMap, oidMap, refPathMap, blobOidSet};
    return this.helperMaps;
  }

  async getDiff(refFrom, refTo){
    const decoder = new TextDecoder("utf-8");
    let diffList = [];
    await git.walk({
      ...this.config,
      trees: [git.TREE({ ref: refFrom }), git.TREE({ ref: refTo })],
      map: async (path, [nodeFrom, nodeTo]) => {
        if (path === '.' || !nodeFrom || !nodeTo
          || (await nodeFrom.type()) === 'tree'
          || (await nodeTo.type()) === 'tree') {
          return
        }
        const oidFrom = await nodeFrom.oid();
        const oidTo = await nodeTo.oid();
        if(oidFrom === oidTo){
          return;
        } else if(!oidFrom){
          diffList.push({type: "ADD", path, a: oidFrom, b: oidTo});
        } else if(!oidTo){
          diffList.push({type: "REMOVE", path, a: oidFrom, b: oidTo});
        } {
          let blobFrom = await this.getBlob(oidFrom);
          let blobTo = await this.getBlob(oidTo);
          diffList.push({
            type: "MODIFY",
            path,
            a: oidFrom,
            b: oidTo,
            diff: Diff.diffLines(decoder.decode(blobFrom.blob), decoder.decode(blobTo.blob))
          })
        }
      },
    });
    return diffList;
  }

  async preload(){
    await this.getStaticHelpers();
  }
}

const repoMap = new Map();

export function getRepos(){
  return Array.from(repoMap.values());
}
export function getRepo(repoName){
  return repoMap.get(repoName); 
}

export default async function initialize({repositories, ...commonConfig}) {
  if(repoMap.size > 0){
    return;
  }
  for(let repoConfig of repositories){
    let repo = new Repo({...commonConfig, ...repoConfig});
    repoMap.set(repo.getName(), repo);
    await repo.preload();
  }
}