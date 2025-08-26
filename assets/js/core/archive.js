// assets/js/core/archive.js
// Minimal, iPad-safe export helpers (ASCII only).

export function downloadBlob(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 300);
}

export function saveJSON(obj, filename = "codex_export.json") {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  downloadBlob(blob, filename);
}

export function savePNGFromCanvas(canvas, filename = "codex_art.png") {
  const dataURL = canvas.toDataURL("image/png");
  // Convert dataURL to blob
  const bytes = atob(dataURL.split(",")[1]);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  const blob = new Blob([arr], { type: "image/png" });
  downloadBlob(blob, filename);
  return dataURL;
}

// Local index (for a simple user "grimoire" in the browser)
export function registerExport(meta) {
  try {
    const key = "codex_exports";
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    list.unshift({ ...meta, at: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(list));
  } catch (e) {
    // No-op if private mode blocks localStorage
  }
}

export function buildProvenance({
  angel = null,
  realm = "Temple",
  room = "72-ladder",
  stylepack = null,
  toneHz = null,
  userNote = ""
} = {}) {
  return {
    _provenance: {
      project: "Cathedral of Circuits / Codex 144:99",
      license: "CC-BY 4.0 (app code), user art as noted",
      curator: "bekalah",
      realm,
      room,
      updated: new Date().toISOString()
    },
    angel,
    stylepack,
    toneHz,
    userNote
  };
}