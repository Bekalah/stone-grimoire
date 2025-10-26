
// Safe loader for foreign repo resources by path hints in registry; forbids writing.
// By default it fetches JSON, but it can also import ES modules when kind="module".

export async function loadFromRepo(registry, repoName, relPath, kind="json"){
  const repo = registry.repos.find(r=>r.name===repoName);
  if(!repo) throw new Error("Unknown repo: "+repoName);
  const url = repo.path.replace(/\/$/,"") + "/" + relPath.replace(/^\//,"");

  // Module loading avoids fetch to leverage native import handling.
  if(kind === "module") return import(url);

  const res = await fetch(url, {cache:"no-store"});
  if(!res.ok) throw new Error("Missing: "+url);

  // Text responses can be requested but default to JSON.
  if(kind === "text") return await res.text();
  return await res.json();
}
