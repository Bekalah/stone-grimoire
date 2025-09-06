import {loadRegistry} from "../engines/registry-loader.js";
import {loadFromRepo} from "../engines/cross-fetch.js";
import {validateInterface} from "../engines/interface-guard.js";
import {composeView} from "../engines/merge-view.js";
import {Safety} from "../ui/safety.js";

Safety.apply();

const registry = await loadRegistry();
let codexNodes = [], spine33 = [];
try{ codexNodes = await loadFromRepo(registry, "cosmogenesis-learning-engine", "assets/data/codex144.json"); }catch(e){ console.warn(e.message); }
try{ spine33 = await loadFromRepo(registry, "circuitum99", "assets/data/spine33.json"); }catch(e){ console.warn(e.message); }
const shared = {version:"1.0.0", palettes:[], geometry_layers:[], narrative_nodes:[...codexNodes, ...spine33]};

const guard = await validateInterface(shared);
if(!guard.valid){ console.warn("Interface warnings:", guard.errors); }

const view = composeView(shared);
window.__CATHEDRAL_VIEW__ = view;
const out = document.getElementById("output");
out.textContent = `nodes: ${view.narrative_nodes.length}`;

const ui = {
  motion: document.getElementById('motion'),
  autoplay: document.getElementById('autoplay'),
  contrast: document.getElementById('contrast')
};
ui.motion.value = Safety.state.motion;
ui.autoplay.checked = Safety.state.autoplay;
ui.contrast.value = Safety.state.contrast;
ui.motion.addEventListener('change', e=>{ Safety.state.motion=e.target.value; Safety.apply(); });
ui.autoplay.addEventListener('change', e=>{ Safety.state.autoplay=e.target.checked; Safety.apply(); });
ui.contrast.addEventListener('change', e=>{ Safety.state.contrast=e.target.value; Safety.apply(); });
