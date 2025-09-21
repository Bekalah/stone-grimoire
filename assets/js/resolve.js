/*
  resolve.js
  Bridge from Stone Grimoire pages to the Cosmogenesis Learning Engine resolver.

  ND-safe stance: single fetch, no polling, no motion. Called on demand to tag pages
  with a worker identifier so visitors know which guardian oversees the content.
*/

const RESOLVE_ENDPOINT = "https://cosmogenesis-learning-engine.fly.io/resolve";

export async function resolveWorker(profile = {}) {
  const payload = normalizeProfile(profile);
  const response = await fetch(RESOLVE_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = new Error("resolver error");
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export function normalizeProfile(profile = {}) {
  const seedValue = sanitizeSeed(profile.seed);
  return {
    title: typeof profile.title === "string" ? profile.title : "",
    arcana: typeof profile.arcana === "string" ? profile.arcana : String(profile.arcana ?? "0"),
    seed: seedValue,
    timestamp: typeof profile.timestamp === "string" && profile.timestamp
      ? profile.timestamp
      : new Date().toISOString()
  };
}

function sanitizeSeed(seed) {
  if (typeof seed === "number" && Number.isFinite(seed)) return Math.trunc(seed);
  if (typeof seed === "string" && seed.trim()) {
    const parsed = Number.parseInt(seed.trim(), 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 33; // Canonical default seed keeps resonance with resolver spec.
}

export { RESOLVE_ENDPOINT };
