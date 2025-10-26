// Minimal schema validator avoiding external dependencies.
// Fetches schema from local JSON or remote URL.
// Motto: Per Texturas Numerorum, Spira Loquitur.

export async function validateInterface(
  payload,
  schemaUrl = "/assets/data/interface.schema.json",
) {

  try {
    let schema;
    if (schemaUrl.startsWith("http")) {
      schema = await fetch(schemaUrl).then((r) => r.json());
    } else {
      const { readFile } = await import("node:fs/promises");
      const p = schemaUrl.replace(/^\//, "");
      schema = JSON.parse(await readFile(p, "utf8"));
    }

    const errors = validateAgainstSchema(payload, schema);
    return { valid: errors.length === 0, errors };
  } catch (e) {
    return { valid: false, errors: [{ message: e.message }] };
  }
}

function validateAgainstSchema(data, schema, path = "") {
  const errors = [];

  // Check required fields
  if (schema.required) {
    for (const field of schema.required) {
      if (!(field in data)) {
        errors.push({ message: `missing required field`, path: `${path}/${field}` });
      }
    }
  }

  // Check properties
  if (schema.properties) {
    for (const [prop, propSchema] of Object.entries(schema.properties)) {
      if (prop in data) {
        const value = data[prop];
        const propPath = `${path}/${prop}`;
        errors.push(...validateValue(value, propSchema, propPath));
      }
    }
  }

  return errors;
}

function validateValue(value, schema, path) {
  const errors = [];

  // Type validation
  if (schema.type) {
    if (schema.type === "string" && typeof value !== "string") {
      errors.push({ message: `${path} should be string`, path });
    } else if (schema.type === "integer" && !Number.isInteger(value)) {
      errors.push({ message: `${path} should be integer`, path });
    } else if (schema.type === "boolean" && typeof value !== "boolean") {
      errors.push({ message: `${path} should be boolean`, path });
    } else if (schema.type === "array" && !Array.isArray(value)) {
      errors.push({ message: `${path} should be array`, path });
    } else if (schema.type === "object" && (typeof value !== "object" || value === null || Array.isArray(value))) {
      errors.push({ message: `${path} should be object`, path });
    }
  }

  // Pattern validation for strings
  if (schema.type === "string" && schema.pattern && typeof value === "string") {
    const regex = new RegExp(schema.pattern);
    if (!regex.test(value)) {
      errors.push({ message: `${path} format invalid`, path });
    }
  }

  // Enum validation
  if (schema.enum && !schema.enum.includes(value)) {
    errors.push({ message: `${path} should be one of: ${schema.enum.join(", ")}`, path });
  }

  // Array item validation
  if (schema.type === "array" && schema.items && Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const itemPath = `${path}/${i}`;
      if (typeof schema.items === "object") {
        errors.push(...validateValue(value[i], schema.items, itemPath));
      }
    }
  }

  // Object property validation
  if (schema.type === "object" && typeof value === "object" && value !== null && !Array.isArray(value)) {
    errors.push(...validateAgainstSchema(value, schema, path));
  }

  return errors;
}
