/**
 * Fetches an art manifest and, if it contains a hero image, creates and appends that image into the DOM element with id "hero-art".
 *
 * Fetches /assets/art/manifest.json with cache: "no-store". If the manifest is missing or doesn't contain a hero.src, or if the target container is absent, the function logs a warning and exits without throwing. Created images use eager loading and async decoding; the image alt text is taken from manifest.hero.alt when available.
 * @returns {Promise<void>} Resolves when processing is complete.
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
