import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// Minimal bootstrap: keep logic tiny and deterministic for ND-safe rendering.
const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
