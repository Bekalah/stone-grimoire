/* Titania Helper -- Avalon art realm (Dion Fortune)
   ND-safe utilities for the Chapel of Psychic Pattern.
   Uses helix renderer to lay a static geometric shield.
*/

import { renderHelix } from "../helix-renderer/js/helix-renderer.mjs";

export const TitaniaHelper = (() => {
  // Dion Fortune quotes for gentle prompts
  const quotes = [
    "Magic is the art of causing changes to occur in consciousness in accordance with will.",
    "Every thought is a link in a chain of power. Guard them, and you guard your temple.",
  ];

  // Default Avalon palette (calm mist + night tones)
  const defaultPalette = {
    bg: "#1a1a2e", // avalon_night
    ink: "#e8e8f0",
    layers: ["#ccd6d9", "#89f7fe", "#a0ffa1", "#ffd27f", "#f5a3ff", "#d0d0e6"],
  };

  // Render the psychic pattern shield onto a canvas
  function renderChapel(canvas, palette = defaultPalette) {
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext("2d");
    const NUM = {
      THREE: 3,
      SEVEN: 7,
      NINE: 9,
      ELEVEN: 11,
      TWENTYTWO: 22,
      THIRTYTHREE: 33,
      NINETYNINE: 99,
      ONEFORTYFOUR: 144,
    };
    renderHelix(ctx, {
      width: canvas.width,
      height: canvas.height,
      palette,
      NUM,
    });
  }

  // Retrieve a random Dion Fortune quote
  function fortuneQuote() {
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  return { renderChapel, fortuneQuote };
})();
