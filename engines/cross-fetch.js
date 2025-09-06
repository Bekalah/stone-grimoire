// Safe loader for foreign repo JSON by path hints in registry; forbids writing.
export async function loadFromRepo(registry, repoName, relPath){
  const repo = registry.repos.find(r=>r.name===repoName);
  if(!repo) throw new Error("Unknown repo: "+repoName);
  const url = repo.path.replace(/\/$/,"") + "/" + relPath.replace(/^\//,"");
  const res = await fetch(url, {cache:"no-store"});
  if(!res.ok) throw new Error("Missing: "+url);
  return await res.json();
}
