export async function loadRegistry(url="/assets/data/registry.json"){
  const res = await fetch(url, {cache:"no-store"});
  if(!res.ok) throw new Error("Registry not found: "+url);
  return await res.json();
}
