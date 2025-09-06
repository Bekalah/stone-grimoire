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
    const AjvMod = await import("https://cdn.skypack.dev/ajv@8?min");
    const ajv = new AjvMod.default({allErrors:true, strict:false});
    const valid = ajv.validate(schema, payload);
    return {valid, errors: ajv.errors||[]};
  }catch(e){ return {valid:false, errors:[{message:e.message}]}; }
}
