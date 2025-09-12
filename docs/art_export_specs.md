# Art Export Specs (Repo Thumbs & Pages)
**Goal:** beautiful previews under 1 MB, consistent, and safe.

- **Doc thumbnails**: 1600×1600 max, PNG-8 or JPEG quality ~80, ≤ 900 KB
- **Gallery stills**: 1920×1080 or 1920×1920, PNG-24 (matte backgrounds), aim ≤ 1 MB
- **Color**: sRGB; avoid neon clipping; keep highlights < 95% white
- **Motion previews** (if any): 6–8s, 24 fps, cross-fade only, ≤ 4 MB (optional)
- **Metadata**: add `title`, `card`, `geometry_mode`, `constants_used`, `nd_safe:true` to the gallery manifest
