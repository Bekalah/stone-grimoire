/**
 * Apply color values from a token palette to CSS custom properties on the document root.
 *
 * Reads colors from tokens.palette and sets CSS variables (--<key>) on document.documentElement.style
 * for values that are strings and look like color values (start with `#`, `rgb`, `hsl`, or `okl`, case-insensitive).
 * Also ensures a set of normalized token names exist by resolving each name from the palette with an optional
 * fallback key and a hard-coded default when neither is present.
 *
 * Ensured tokens (with fallback keys and defaults) include:
 * violet_core (fallback: violet, default: #7A33FF),
 * violet_flare (fallback: violet_alt, default: #B39CFF),
 * pearl_white (fallback: bone, default: #F5F2EA),
 * pearl_lilac (fallback: rose_quartz, default: #CDB8F6),
 * astral_mist (fallback: light, default: #B7C9FF),
 * astral_silver (fallback: glint_silver, default: #C9D1E7),
 * astral_violet (fallback: violet, default: #9E8BFF),
 * avalon_mist (fallback: avalon_mist, default: #CFE6F2),
 * avalon_night (fallback: avalon_night, default: #0C1521),
 * gold_leaf (fallback: gold, default: #C8A44D),
 * threshold_glow (fallback: threshold_glow, default: #98FFE2).
 *
 * @param {Object} tokens - Object that may contain a `palette` object mapping token names to color strings.
 */
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
