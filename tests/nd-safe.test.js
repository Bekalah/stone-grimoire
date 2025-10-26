import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const loadTokens = async () => JSON.parse(await readFile("assets/tokens/perm-style.json", "utf8"));

const normalize = (str) => str.replace(/\s+/g, " ");

test("perm-style tokens enforce ND-safe accessibility flags", async () => {
  const tokens = await loadTokens();
  const a11y = tokens.a11y ?? {};
  assert.equal(a11y.strobe, false, "a11y.strobe must remain false");
  assert.equal(a11y.autoplay, false, "a11y.autoplay must remain false");
  assert.ok(a11y.motion === "reduce" || a11y.motion === "opt-in", "motion must default to reduce or opt-in");
  assert.ok(Number(a11y.min_contrast) >= 4.5, "min_contrast must be ≥ 4.5");

  const effects = tokens.effects ?? {};
  for (const [name, info] of Object.entries(effects)) {
    if (info && typeof info === "object" && Object.prototype.hasOwnProperty.call(info, "nd_safe")) {
      assert.equal(info.nd_safe, true, `effect ${name} must declare nd_safe true`);
    }
  }
});

test("perm-style CSS gates any motion behind explicit opt-in", async () => {
  const css = normalize(await readFile("assets/css/perm-style.css", "utf8"));
  assert.ok(css.includes("prefers-reduced-motion"), "prefers-reduced-motion safeguard missing");
  assert.ok(/body\.allow-motion[^}]*between-narthex\[data-drift="on"\]/.test(css), "between-narthex drift must require allow-motion opt-in");
  assert.ok(/body\.allow-motion[^}]*violet-flame\[data-wave="on"\]/.test(css), "violet flame pulse must require allow-motion opt-in");
  assert.ok(!/strobe/i.test(css), "CSS must not reference strobe effects");
});
