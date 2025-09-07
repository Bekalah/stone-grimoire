import {loadRegistry} from "./engines/registry-loader.js";
import {loadFromRepo} from "./engines/cross-fetch.js";
import {validateInterface} from "./engines/interface-guard.js";
import {composeView} from "./engines/merge-view.js";
import {Safety} from "./ui/safety.js";

Safety.apply();

const controls = {
  motion: document.getElementById('motion'),
  autoplay: document.getElementById('autoplay'),
  contrast: document.getElementById('contrast')
};
if(controls.motion && controls.autoplay && controls.contrast){
  controls.motion.addEventListener('change', e=>{Safety.state.motion=e.target.value; Safety.apply();});
  controls.autoplay.addEventListener('change', e=>{Safety.state.autoplay=e.target.checked; Safety.apply();});
  controls.contrast.addEventListener('change', e=>{Safety.state.contrast=e.target.value; Safety.apply();});
}

(async ()=>{
  const registry = await loadRegistry();

  const codexNodes = await loadFromRepo(registry, "cosmogenesis-learning-engine", "assets/data/codex144.json").catch(()=>[]);
  const spine33    = await loadFromRepo(registry, "circuitum99", "assets/data/spine33.json").catch(()=>[]);
  const rooms144   = await loadFromRepo(registry, "stone-grimoire", "assets/data/rooms144.json").catch(()=>[]);

  const shared = {version:"1.0.0", palettes:[], geometry_layers:[], narrative_nodes:[...codexNodes, ...spine33]};
  const guard = await validateInterface(shared);
  if(!guard.valid){ console.warn("Interface warnings:", guard.errors); }

  const view = composeView(shared, {});
  window.__CATHEDRAL_VIEW__ = {...view, rooms:rooms144};

  // Adapter hooks: each repo may expose an adapter module with init(view).
  for(const repo of registry.repos){
    if(!repo.adapter) continue;
    try{
      const mod = await loadFromRepo(registry, repo.name, repo.adapter, "module");
      if(mod && typeof mod.init === "function"){
        mod.init(window.__CATHEDRAL_VIEW__);
      }
    }catch(err){
      console.warn("Adapter load failed for", repo.name, err.message);
    }
  }
})();
