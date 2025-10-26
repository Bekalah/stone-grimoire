import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateInterface } from "../engines/interface-guard.js";

/*
Testing library/framework: node:test fallback used (no Jest/Mocha/Vitest found).
*/

const loadSample = async () =>
  JSON.parse(await readFile("assets/data/sample_interface.json", "utf8"));

test("validateInterface: validates the provided sample_interface.json (happy path)", async () => {
  const sample = await loadSample();
  const res = await validateInterface(sample);
  assert.equal(res.valid, true);
  assert.equal((res.errors ?? []).length, 0);
});

test("validateInterface: rejects non-object payloads", async () => {
  const cases = [null, undefined, 42, "str", true, [], () => {}];
  for (const c of cases) {
    // @ts-ignore
    const res = await validateInterface(c);
    assert.equal(res.valid, false);
    assert.ok(Array.isArray(res.errors));
    assert.ok(res.errors.length >= 1);
  }
});

test("validateInterface: flags missing required fields with paths", async () => {
  const base = await loadSample();
  for (const key of ["version", "palettes", "geometry_layers", "narrative_nodes"]) {
    const clone = structuredClone(base);
    delete clone[key];
    const res = await validateInterface(clone);
    assert.equal(res.valid, false);
    const paths = res.errors.map(e => e.path);
    assert.ok(paths.includes(`/${key}`), `Expected error path /${key} in ${paths}`);
  }
});

test("validateInterface: flags wrong types for fields", async () => {
  const base = await loadSample();
  const wrongs = [
    [{ ...base, version: 100 }, "/version"],
    [{ ...base, palettes: "not-array" }, "/palettes"],
    [{ ...base, geometry_layers: "not-array" }, "/geometry_layers"],
    [{ ...base, narrative_nodes: "not-array" }, "/narrative_nodes"]
  ];
  for (const [payload, path] of wrongs) {
    const res = await validateInterface(payload);
    assert.equal(res.valid, false);
    assert.ok(res.errors.map(e => e.path).includes(path));
  }
});

test("validateInterface: validates narrative_nodes array entries with detailed path errors", async () => {
  const base = await loadSample();

  const p1 = { ...base, narrative_nodes: [ { node_id: 1, name: "test", locked: false, egregore_id: "test" }, "invalid" ] };
  const r1 = await validateInterface(p1);
  assert.equal(r1.valid, false);
  assert.ok(r1.errors.map(e => e.path).includes("/narrative_nodes/1"));

  const p2 = { ...base, narrative_nodes: [ { node_id: 1, name: "test", locked: false, egregore_id: "test" }, { node_id: "invalid", name: "test", locked: false, egregore_id: "test" } ] };
  const r2 = await validateInterface(p2);
  assert.equal(r2.valid, false);
  const paths2 = r2.errors.map(e => e.path);
  assert.ok(paths2.includes("/narrative_nodes/1/node_id"));
});

test("validateInterface: accepts additional unknown fields without failing (if allowed)", async () => {
  const base = await loadSample();
  const augmented = { ...base, extra: { note: "ignored" } };
  const res = await validateInterface(augmented);
  if (res.valid) {
    assert.equal((res.errors ?? []).length, 0);
  } else {
    assert.ok(res.errors.map(e => e.path).includes("/extra"));
  }
});
