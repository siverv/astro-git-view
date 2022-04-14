import lunr from 'lunr';
let idx;
export async function getIndex(){
	if(!idx){
		let response = await fetch("/lunr-index.json");
		let idxJson = await response.text();
		console.log(idxJson);
		idx = lunr.Index.load(JSON.parse(idxJson))
	}
	return idx;
}
let docs;
export async function getDocs(){
	if(!docs){
		let response = await fetch("/lunr-docs.json");
		let docsJson = await response.text();
		docs = JSON.parse(docsJson).reduce((map, doc) => map.set(doc.id, doc), new Map());
	}
	return docs;
}
export async function search(searchParams) {
	if(typeof searchParams === "string"){
		searchParams = new URLSearchParams(searchParams);
	}
	let query = searchParams.get("query");
	if(!query) {
		return [];
	}
	let idx = await getIndex();
	let result = idx.search(query);
	result.query = query;
	console.log("query", query, result);
	return result;
}

export async function searchOnLoad(useResult){
	window.addEventListener("load", async () => {
		let searchForm = document.getElementById("search-form");
		if(searchForm){
			if(window.location.search.includes("query=")){
				await search(new URLSearchParams(window.location.search)).then(useResult);
			}
		}
	})
}

export async function searchOnSubmit(useResult){
	let searchForm = document.getElementById("search-form");
	searchForm.addEventListener("submit", async ev => {
		ev.preventDefault();
		search(new URLSearchParams(new FormData(ev.target))).then(useResult);
	})
}