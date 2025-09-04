// assets/js/effects/planetary-light.js
// Adds a color wash over .overlay-vitrail using mix-blend-mode overlay

export function mountPlanetaryLight(selector = '.overlay-vitrail', color = 'rgba(255, 215, 0, 0.25)') {
  const host = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (!host) return null;
  const layer = document.createElement('div');
  layer.setAttribute('aria-hidden', 'true');
  layer.style.position = 'absolute';
  layer.style.inset = '0';
  layer.style.pointerEvents = 'none';
  layer.style.mixBlendMode = 'overlay';
  layer.style.background = color;
  host.style.position = host.style.position || 'relative';
  host.appendChild(layer);
  return layer;
}

export default mountPlanetaryLight;
