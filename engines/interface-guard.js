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
  }
}
