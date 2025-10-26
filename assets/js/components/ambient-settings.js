// Ambient Settings UI (museum corner control)
(function(){
  function mount(){
    const box = document.createElement("div");
    box.className = "ambient-panel";
    box.innerHTML = `
      <div class="ambient-title">Ambient</div>
      <label><input type="checkbox" id="ambMute"> Sound Off</label>
      <label><input type="checkbox" id="ambHighs"> Soften Highs</label>
      <label><input type="checkbox" id="ambBinaural"> Binaural (opt‑in)</label>
      <label><input type="checkbox" id="ambVizOnly"> Visualize Only</label>
      <div class="ambient-row">
        <span>Vol</span>
        <input type="range" id="ambVol" min="-48" max="-6" step="1" value="-24">
      </div>
    `;
    document.body.appendChild(box);

    const $ = id=>box.querySelector(id);
    const ambMute = $("#ambMute");
    const ambHighs = $("#ambHighs");
    const ambBinaural = $("#ambBinaural");
    const ambVizOnly = $("#ambVizOnly");
    const ambVol = $("#ambVol");

    // Restore from localStorage if available (mirrors ambient-engine)
    try {
      const prefs = JSON.parse(localStorage.getItem("ambient-prefs")||"{}");
      if (typeof prefs.muted === "boolean") ambMute.checked = prefs.muted;
      if (typeof prefs.softenHighs === "boolean") ambHighs.checked = prefs.softenHighs;
      if (typeof prefs.binauralEnabled === "boolean") ambBinaural.checked = prefs.binauralEnabled;
      if (typeof prefs.visualizeOnly === "boolean") ambVizOnly.checked = prefs.visualizeOnly;
      if (typeof prefs.volumeDb === "number") ambVol.value = prefs.volumeDb;
    } catch {}

    ambMute.addEventListener("change", () => window.Ambient?.setMuted(ambMute.checked));
    ambVizOnly.addEventListener("change", () => window.Ambient?.setVisualizeOnly(ambVizOnly.checked));
    ambBinaural.addEventListener("change", () => window.Ambient?.setBinaural(ambBinaural.checked));
    ambVol.addEventListener("input", () => window.Ambient?.setVolumeDb(parseInt(ambVol.value,10)));

    // Soften highs toggle: re-save preference; the engine reads it next boot
    ambHighs.addEventListener("change", () => {
      try {
        const prefs = JSON.parse(localStorage.getItem("ambient-prefs")||"{}");
        prefs.softenHighs = ambHighs.checked;
        localStorage.setItem("ambient-prefs", JSON.stringify(prefs));
        // live effect via CSS var (optional)
        document.documentElement.style.setProperty("--highs-soft",""+(ambHighs.checked?1:0));
      } catch {}
    });
  }
  document.addEventListener("DOMContentLoaded", mount);
})();
