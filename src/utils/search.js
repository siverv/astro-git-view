import {search, enrich} from "astro-lunr/client/lunr.js";

export async function searchOnLoad(useResult){
  window.addEventListener("load", async () => {
    let searchForm = document.getElementById("search-form");
    let index = searchForm.dataset.index;
    if(searchForm){
      if(window.location.search.includes("query=")){
        let searchParams = new URLSearchParams(window.location.search);
        let query = searchParams.get("query");
        if(!query){
          return;
        }
        let hits = await search(query, index);
        let result = await enrich(hits, index);
        useResult({result, query});
      }
    }
  })
}

export async function searchOnSubmit(useResult){
  let searchForm = document.getElementById("search-form");
  let index = searchForm.dataset.index;
  searchForm.addEventListener("submit", async ev => {
    ev.preventDefault();
    if(searchForm){
      let searchParams = new URLSearchParams(new FormData(ev.target))
      let query = searchParams.get("query");
      if(!query){
        return;
      }
      let hits = await search(query, index);
      let result = await enrich(hits, index);
      useResult({result, query});
    }
  })
}

export async function displaySearchResult({result, query}){
  const section = document.getElementById("search-result-section");
  const searchResults = document.getElementById("search-result-list");
  searchResults.innerHTML = "";
  section.style.display = "block";
  document.getElementById("search-result-query").textContent = query;
  document.getElementById("search-result-total").textContent = result.length;
  document.getElementById("search-result-close").onclick = () => {
    searchResults.innerHTML = "";
    section.style.display = "none"
  };
  const template = document.getElementById("search-item-template");
  const contentLineTemplate = document.getElementById("search-item-content-line-template");
  for(let {hit, doc} of result){
    const fragment = template.content.cloneNode(true);
    fragment.querySelector(".search-item").setAttribute("id", "search-item-" + hit.ref);
    fragment.querySelector(".url").setAttribute("href", "/" + doc.canonicalUrl);
    fragment.querySelector(".url").textContent = doc.name;
    fragment.querySelector(".base-path").textContent = doc.base + "/";

    let contentHit = fragment.querySelector(".content-hit-lines");
    let fields = document.createElement("dl");
    for(let [key, value] of Object.entries(hit.matchData.metadata)){
      let startAt = 0;
      let total = "";
      if(value.content){
        let lines = doc.content.split("\n");
        let accLength = lines.map((l,i) => lines.slice(0,i).map(t => t.length).reduce((a,b) => a+b, 0) + i);
        let matchMap = new Map();
        for(let position of value.content.position){
          let [from, len] = position;
          let lineIndex = lines.findIndex((l, i) => accLength[i] + l.length > from);
          if(lineIndex < 0){
            continue;
          }
          let line = lines[lineIndex];
          let lineFrom = from - accLength[lineIndex];
          const contentLineElm = contentLineTemplate.content.cloneNode(true);
          let lineNumElm = contentLineElm.querySelector("td.line-number a");
          lineNumElm.setAttribute("href", "/" + doc.canonicalUrl + "#L" + lineIndex);
          lineNumElm.textContent = lineIndex;
          let lineElm = contentLineElm.querySelector("td.line-content");
          const pre = line.slice(0, lineFrom);
          const match = line.slice(lineFrom, lineFrom + len);
          const post = line.slice(lineFrom + len);
          lineElm.appendChild(new Text(pre));
          let mark = document.createElement("b");
          mark.className="selected";
          mark.style.backgroundColor = "var(--fg)"
          mark.style.color = "var(--bg)"
          mark.textContent = match;
          lineElm.appendChild(mark);
          lineElm.appendChild(new Text(post));
          matchMap.set(lineIndex, contentLineElm);
        }
        let focusIndex = Math.min(...matchMap.keys());
        let firstIndex = Math.max(0, focusIndex - 2);
        for(let i = 0; i < 5; i++){
          let lineIndex = firstIndex + i;
          let line = matchMap.get(lineIndex) || lines[lineIndex];
          if(typeof line === "string"){
            const contentLineElm = contentLineTemplate.content.cloneNode(true);
            let lineNumElm = contentLineElm.querySelector("td.line-number a");
            lineNumElm.setAttribute("href", "/" + doc.canonicalUrl + "#L" + lineIndex);
            lineNumElm.textContent = lineIndex;
            let lineElm = contentLineElm.querySelector("td.line-content");
            lineElm.appendChild(new Text(line));
            contentHit.appendChild(contentLineElm);
          } else if(line instanceof Node) {
            contentHit.appendChild(line);
          }
        }
      } else {
        for(let [field, hit] of Object.entries(value)){
          let fieldHit = document.createElement("field-hit");
          let fieldElm = document.createElement("dt");
          let valueElm = document.createElement("dd");
          fieldHit.appendChild(fieldElm);
          fieldHit.appendChild(valueElm);
          fieldElm.textContent = field;
          let [from, len] = hit.position[0];
          const pre = doc[field].slice(0, from);
          const match = doc[field].slice(from, from + len);
          const post = doc[field].slice(from + len);
          valueElm.appendChild(new Text(pre));
          let mark = document.createElement("b");
          mark.className="selected";
          mark.style.backgroundColor = "var(--fg)"
          mark.style.color = "var(--bg)"
          mark.textContent = match;
          valueElm.appendChild(mark);
          valueElm.appendChild(new Text(post));
          fields.appendChild(fieldHit);
        }
      }
    }
    if(contentHit.textContent.trim().length == 0) {
      contentHit.remove();
    }
    fragment.querySelector(".field-hits").appendChild(fields);
    let debug = fragment.querySelector(".debug");
    if(debug){
      debug.textContent = JSON.stringify(doc, null, 2)
    }
    searchResults.appendChild(fragment);
  }
}

searchOnSubmit(displaySearchResult)