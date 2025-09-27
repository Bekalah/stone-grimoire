import React, { useEffect, useState } from "react";

// Trauma-informed palette: soft contrast, no motion.
const NOTICE_STYLE = {
  fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
  lineHeight: 1.5,
  padding: "1.5rem",
  maxWidth: "720px",
  margin: "0 auto",
  color: "#e8e8f0",
  background: "#10101a",
  borderRadius: "18px",
  border: "1px solid #1e1e2b"
};

// Pure functional component so rendering stays predictable.
function NativeStatus({ wasmReady }) {
  return (
    <section style={{ marginTop: "1rem" }}>
      <h2 style={{ fontSize: "1rem", letterSpacing: "0.08em" }}>Native Bridge</h2>
      <p style={{ marginTop: "0.5rem", color: wasmReady ? "#a0ffa1" : "#f2c27d" }}>
        {wasmReady ? "C++ module attached." : "Waiting for optional helix.wasm module."}
      </p>
    </section>
  );
}

// Mirrors the offline renderer's tone order (layers 1–6).
const palettePreview = ["#b1c7ff", "#89f7fe", "#a0ffa1", "#ffd27f", "#f5a3ff", "#d0d0e6"];

function PaletteSwatch() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "0.5rem", marginTop: "1rem" }}>
      {palettePreview.map((tone, index) => (
        <div key={tone} style={{ background: tone, padding: "1.75rem 0", borderRadius: "12px" }}>
          <span style={{ display: "block", textAlign: "center", color: "#10101a", fontSize: "0.75rem" }}>
            Layer {index + 1}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [wasmReady, setWasmReady] = useState(false);

  useEffect(() => {
    async function loadNativeModule() {
      try {
        const wasmPath = import.meta.env.HELIX_WASM_PATH || "/helix.wasm";
        const response = await fetch(wasmPath);
        if (!response.ok) {
          return;
        }
        await response.arrayBuffer();
        setWasmReady(true);
      } catch (error) {
        console.warn("WASM module not available yet", error);
      }
    }

    loadNativeModule();
  }, []);

  return (
    <main style={NOTICE_STYLE}>
      <header>
        <h1 style={{ margin: 0, fontSize: "1.25rem", letterSpacing: "0.05em" }}>Cloudflare Bridge Shell</h1>
        <p style={{ marginTop: "0.5rem", color: "#a6a6c1" }}>
          React hosts the Cosmic Helix renderer in Cloudflare. The offline canvas in `apps/renderer` remains the source of truth;
          this bridge simply prepares edge delivery and optional C++ helpers.
        </p>
      </header>

      <section style={{ marginTop: "1.5rem" }}>
        <h2 style={{ fontSize: "1rem", letterSpacing: "0.08em" }}>Renderer Sync</h2>
        <p style={{ marginTop: "0.5rem" }}>
          Drop the generated canvas PNG or raw render data here once the offline renderer exports it. React components can then
          layer UI or metadata around the sacred geometry without altering the ND-safe drawing core.
        </p>
        <PaletteSwatch />
      </section>

      <NativeStatus wasmReady={wasmReady} />
    </main>
  );
}
