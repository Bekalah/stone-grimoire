// ND-safe loader: fetch manifest without caching and mount hero art when available.
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
