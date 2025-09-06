// Minimal schema validator avoiding external dependencies.
export async function validateInterface(payload, schemaUrl = "/assets/data/interface.schema.json") {
  try {
    const { readFile } = await import("node:fs/promises");
    const p = schemaUrl.replace(/^\//, "");
    const schema = JSON.parse(await readFile(p, "utf8"));
    const errors = [];
    const required = schema.required || [];
    for (const key of required) {
      if (!(key in payload)) errors.push({ message: `missing ${key}` });
    }
    if (typeof payload.version !== "string") errors.push({ message: "version must be string" });
    if (!Array.isArray(payload.palettes)) errors.push({ message: "palettes must be array" });
    if (!Array.isArray(payload.geometry_layers)) errors.push({ message: "geometry_layers must be array" });
    if (!Array.isArray(payload.narrative_nodes)) errors.push({ message: "narrative_nodes must be array" });
    return { valid: errors.length === 0, errors };
  } catch (e) {
    return { valid: false, errors: [{ message: e.message }] };
export async function validateInterface(payload, schemaUrl="/assets/data/interface.schema.json"){
  try{
    let schema;
    if(schemaUrl.startsWith("http")){
      schema = await fetch(schemaUrl).then(r=>r.json());
    }else{
      const {readFile} = await import('node:fs/promises');
      const p = schemaUrl.replace(/^\//, '');
      schema = JSON.parse(await readFile(p, 'utf8'));
    }
    const required = schema.required || [];
    const errors = [];
    for(const key of required){
      if(!(key in payload)){ errors.push({message:`missing ${key}`}); }
    }
    if('version' in payload && !/^\d+\.\d+\.\d+$/.test(payload.version)){
      errors.push({message:"version format invalid"});
    }
    if('palettes' in payload && !Array.isArray(payload.palettes)){
      errors.push({message:"palettes should be array"});
    }
    if('geometry_layers' in payload && !Array.isArray(payload.geometry_layers)){
      errors.push({message:"geometry_layers should be array"});
    }
    if('narrative_nodes' in payload && !Array.isArray(payload.narrative_nodes)){
      errors.push({message:"narrative_nodes should be array"});
    }
    return {valid:errors.length===0, errors};
  }catch(e){
    return {valid:false, errors:[{message:e.message}]};
  }
}
