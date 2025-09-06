export function composeView({palettes=[], geometry_layers=[], narrative_nodes=[]}, overlays={}){
  const freeze = obj => (Array.isArray(obj)?obj.map(freeze):(obj&&typeof obj==="object"?Object.freeze({...obj}):obj));
  const base = {palettes:[...palettes], geometry_layers:[...geometry_layers], narrative_nodes:[...narrative_nodes]};
  for(const key of Object.keys(overlays)){
    const layer = overlays[key];
    if(Array.isArray(layer)) base[key] = [...base[key], ...layer];
  }
  return freeze(base);
}
