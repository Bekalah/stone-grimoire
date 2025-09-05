# Visionary World Builder Demo

Generate museum-quality visionary art with configurable patterns and palettes.

## Usage

```bash
python visionary_world_builder.py --pattern fractal --palette alex_grey \
  --width 3840 --height 2160 --output Visionary_Dream.png
```

## Options

- `--pattern {fractal, radial}`: choose the rendering algorithm.
- `--palette {alex_grey, hilma_af_klint, surrealism}`: select a color scheme.
- `--width`, `--height`: set image resolution.
- `--seed`: provide a random seed for reproducible results.
- `--output`: name of the saved image file.
- `--show`: display the image after generation.

