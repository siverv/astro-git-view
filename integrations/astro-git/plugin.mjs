
function serializeConfigIncludingFunctions(config){
  let idCounter = 0;
  let getId = () => "***" + idCounter++ + "***";
  let funcMap = new Map();
  return JSON.stringify(config, (_, value) => {
    if(typeof value === "function"){
      let id = getId();
      funcMap.set(id, value.toString());
      return id;
    } else return value
  }).replace(/"(\*\*\*\d\*\*\*)"/g, (_, x) => funcMap.get(x));
}

export default function createPlugin(config){
  if(!config.repositories){
    throw new Error(`The astro-git plugin requires at least the repositories-field`)
  }
  const configString = serializeConfigIncludingFunctions(config);
  return {
    name: 'astro-plugin-git',
    hooks: {
      'astro:config:setup': (options) => {
        options.injectScript("page-ssr", `import initializeGitRepos from '@integrations/astro-git/git';\nawait initializeGitRepos(${configString});`)
      }
    }
  }
}