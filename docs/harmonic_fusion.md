# Harmonic Fusion Engines

The Cosmogenesis learning engine models the Tetragrammaton as two small pure functions. Each half returns harmonic hints that other modules can reuse without side effects.

## YH fusion — spark + vessel
_File: `cosmogenesis-learning-engine/engines/yh-fusion.js`_

`yhSignature({ seed=14499, yod=1, heh=5, tuning=432 })`

- Combines the Yod and Heh digits into a 15 seal and includes the constant motto 168.
- Returns the golden ratio `phi`, suggested spiral `turns`, a `palette_hint`, and harmonic values such as tuning, Fibonacci-based `midi`, and mode.
- Guides color selection and melodic seeds across the cathedral stack.

## VH fusion — channel + embodiment
_File: `cosmogenesis-learning-engine/engines/vh-fusion.js`_

`vhSignature({ seed=14499, vav=6, heh_final=5, base=432 })`

- Forms a grounding value of 65 with earthy resonance.
- Emits a heptatonic `scale` anchored at 432 Hz plus grounding.
- Marks the element as `earth-channel` for downstream layers.

## Full cycle
_File: `cosmogenesis-learning-engine/engines/yhvh.js`_

`yhvhFull(seed=14499)`

- Calls both fusion engines and returns `{ yh, yh_values, vh, yhvh, cycle: "complete" }`.
- The `yhvh` string (e.g., `15-65`) records the passage from spark + vessel to channel + embodiment.

## Meaning
YH sketches the idea and palette; VH nails it to the ground. Together they map the four letters into color, number, and scale, giving every artifact a traceable lineage.

