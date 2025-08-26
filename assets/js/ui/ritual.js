// UI: Ritual Hygiene (Banish, Center, License to Depart)
// Pairs with ambient-engine and stylepacks to keep sessions clean.

import { stopTone, setTone, startTone } from "../engines/ambient-engine.js";

// Small helpers ------------------------------------------------------
function el(tag, attrs = {}, html = "") {
  const n = document.createElement(tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (html) n.innerHTML = html;
  return n;
}
function applyBanishTheme() {
  // Neutral white reset (matches your "neutral_white" stylepack intent)
  document.documentElement.style.setProperty("--accent", "#888888");
  document.documentElement.style.setProperty("--accent-2", "#dcdcdc");
  document.body.classList.add("banish-on");
}
function clearBanishTheme() {
  document.body.classList.remove("banish-on");
}

// Public mount -------------------------------------------------------
/**
 * mountRitualControls(container, opts)
 * opts: { centerHz?: number, onCenter?: fn, onDepart?: fn }
 */
export function mountRitualControls(container, opts = {}) {
  const centerHz = Number(opts.centerHz || 528);

  const bar = el("div", { class: "c-ritual" });
  const title = el("div", { class: "c-ritual__title" }, "Ritual Controls");
  const btnBanish = el("button", { type: "button", class: "btn btn-ritual" }, "Banish");
  const btnCenter = el("button", { type: "button", class: "btn btn-ritual" }, "Center");
  const btnDepart = el("button", { type: "button", class: "btn btn-ritual" }, "License to Depart");

  bar.appendChild(title);
  bar.appendChild(btnBanish);
  bar.appendChild(btnCenter);
  bar.appendChild(btnDepart);
  container.appendChild(bar);

  // Actions
  btnBanish.addEventListener("click", () => {
    // Silence and neutralize visuals
    stopTone();
    applyBanishTheme();
    // Optionally dim overlays you may have
    const ov = document.querySelector(".overlay-vitrail");
    if (ov) ov.style.opacity = "0.15";
  });

  btnCenter.addEventListener("click", async () => {
    // Gentle reset to center tone, clear banish skin
    clearBanishTheme();
    const ov = document.querySelector(".overlay-vitrail");
    if (ov) ov.style.opacity = "";
    setTone(centerHz);
    await startTone(centerHz);
    if (typeof opts.onCenter === "function") opts.onCenter(centerHz);
  });

  btnDepart.addEventListener("click", () => {
    // Fade down, clear states, ready to leave page
    stopTone();
    clearBanishTheme();
    const ov = document.querySelector(".overlay-vitrail");
    if (ov) ov.style.opacity = "";
    if (typeof opts.onDepart === "function") opts.onDepart();
  });

  // Tiny API back to caller
  return {
    setCenterHz(hz) { /* live update center frequency */ },
    destroy() { bar.remove(); }
  };
}