// Loads registry.json from current repo, then resolves relative repo paths.
// On iPad/Safari: use fetch for local paths served by dev server.
export async function loadRegistry(url="/assets/data/registry.json"){
  const res = await fetch(url, {cache:"no-store"});
  if(!res.ok) throw new Error("Registry not found: "+url);
  const reg = await res.json();
  return reg;
}
