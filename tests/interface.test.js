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
  for (const key of ["id", "name", "version", "flags", "items"]) {
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
    [{ ...base, id: 123 }, "/id"],
    [{ ...base, name: 999 }, "/name"],
    [{ ...base, version: 100 }, "/version"],
    [{ ...base, flags: [] }, "/flags"],
    [{ ...base, items: {} }, "/items"]
  ];
  for (const [payload, path] of wrongs) {
    const res = await validateInterface(payload);
    assert.equal(res.valid, false);
    assert.ok(res.errors.map(e => e.path).includes(path));
  }
});

test("validateInterface: validates items array entries with detailed path errors", async () => {
  const base = await loadSample();

  const p1 = { ...base, items: [ { key: "ok", value: 1 }, 7 ] };
  const r1 = await validateInterface(p1);
  assert.equal(r1.valid, false);
  assert.ok(r1.errors.map(e => e.path).includes("/items/1"));

  const p2 = { ...base, items: [ { key: "ok", value: 1 }, { key: 9, value: "bad" } ] };
  const r2 = await validateInterface(p2);
  assert.equal(r2.valid, false);
  const paths2 = r2.errors.map(e => e.path);
  assert.ok(paths2.includes("/items/1/key"));
  assert.ok(paths2.includes("/items/1/value"));
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