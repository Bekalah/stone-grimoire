// assets/js/effects/overlay-loader.js
export async function mountOverlay(containerSelector, symbolId = 'mandala-spiral') {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  const url = '/assets/overlays/spiral-mandalas.svg';
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.statusText);
    const svgText = await res.text();
    // hidden defs host
    const defsHost = document.createElement('div');
    defsHost.style.display = 'none';
    defsHost.innerHTML = svgText;
    // move <defs>/<symbol> into DOM
    document.body.appendChild(defsHost);
    // create visible instance
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox','0 0 1000 1000');
    svg.style.width = '100%';
    svg.style.height = '100%';
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttributeNS('http://www.w3.org/1999/xlink','href', `#${symbolId}`);
    svg.appendChild(use);
    container.innerHTML = '';
    container.appendChild(svg);
  } catch(e) {
    console.warn('Overlay load failed:', e);
  }
}