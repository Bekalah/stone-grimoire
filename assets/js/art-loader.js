/**
 * Fetches an art manifest (no-cache) and mounts the hero image into the page if available.
 *
 * Attempts to GET "/assets/art/manifest.json" with cache mode "no-store". If a valid manifest
 * containing `hero.src` is found and an element with id "hero-art" exists, creates an <img>
 * (eager loading, async decoding) with the manifest values and appends it to that element.
 * Logs warnings and exits early when the manifest is missing, incomplete, or the target container
 * cannot be found.
 *
 * @returns {Promise<void>} Resolves after attempting to fetch the manifest and mount the image.
 */
export async function mountArt(){
  const res = await fetch("/assets/art/manifest.json", { cache: "no-store" });
  if (!res.ok) {
    console.warn("Art manifest missing; skipping hero mount.");
    return;
  }
  const manifest = await res.json();
  if (!manifest || !manifest.hero || !manifest.hero.src) {
    console.warn("Art manifest incomplete; skipping hero mount.");
    return;
  }
  const img = new Image();
  img.loading = "eager";
  img.decoding = "async";
  img.src = manifest.hero.src;
  img.alt = manifest.hero.alt || "";
  const target = document.getElementById("hero-art");
  if (!target) {
    console.warn("Hero art container missing.");
    return;
  }
  target.append(img);
}
