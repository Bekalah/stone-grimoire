export function applyTokenPalette(tokens) {
  const rootStyle = document.documentElement.style;
  const palette = tokens?.palette || {};

  Object.entries(palette).forEach(([key, value]) => {
    if (typeof value === 'string' && /^(#|rgb|hsl|okl)/i.test(value)) {
      rootStyle.setProperty(`--${key}`, value);
    }
  });

  const ensure = (name, fallbackKey, fallbackValue) => {
    const tone = palette[name] || palette[fallbackKey] || fallbackValue;
    if (typeof tone === 'string') {
      rootStyle.setProperty(`--${name}`, tone);
    }
  };

  ensure('violet_core', 'violet', '#7A33FF');
  ensure('violet_flare', 'violet_alt', '#B39CFF');
  ensure('pearl_white', 'bone', '#F5F2EA');
  ensure('pearl_lilac', 'rose_quartz', '#CDB8F6');
  ensure('astral_mist', 'light', '#B7C9FF');
  ensure('astral_silver', 'glint_silver', '#C9D1E7');
  ensure('astral_violet', 'violet', '#9E8BFF');
  ensure('avalon_mist', 'avalon_mist', '#CFE6F2');
  ensure('avalon_night', 'avalon_night', '#0C1521');
  ensure('gold_leaf', 'gold', '#C8A44D');
  ensure('threshold_glow', 'threshold_glow', '#98FFE2');
}
