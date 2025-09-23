// Lightweight overlay dock controlling panels for: Circuitum, Tarot, Fractal, Corpus.
(function(){
  const dock = document.createElement('div'); dock.id = 'overlayDock';
  dock.innerHTML = `
    <header><strong>Cathedral Overlay</strong>
      <button class="secondary outline" id="closeDock">Close</button>
    </header>
    <div class="tabbar">
      <button id="tab-circuitum">Circuitum99</button>
      <button id="tab-tarot">Tarot</button>
      <button id="tab-fractal">Fractal</button>
      <button id="tab-corpus">Corpus</button>
    </div>
    <section id="panel-circuitum" class="panel"><div id="cyoa"></div></section>
    <section id="panel-tarot" class="panel"><div id="tarotUI"></div></section>
    <section id="panel-fractal" class="panel">
      <p>Select a node from the scene or choose:</p>
      <button id="fractalFool">Rebecca Respawn (Fool)</button>
      <div id="fractalWrap"></div>
    </section>
    <section id="panel-corpus" class="panel">
      <input id="search" placeholder="Search grimoires, Hermetica, symbols..." aria-label="Search">
      <div id="searchResults"></div>
    </section>
  `;
  document.body.appendChild(dock);

  const openBtn = document.getElementById('openOverlay');
  const closeBtn = dock.querySelector('#closeDock');
  const tabs = {
    circuitum: dock.querySelector('#panel-circuitum'),
    tarot: dock.querySelector('#panel-tarot'),
    fractal: dock.querySelector('#panel-fractal'),
    corpus: dock.querySelector('#panel-corpus')
  };
  function show(which){
    for(const k in tabs){ tabs[k].classList.toggle('active', k===which); }
    dock.style.display = 'block';
  }
  document.getElementById('tab-circuitum').onclick = ()=>{ show('circuitum'); window.loadCircuitum?.(tabs.circuitum); };
  document.getElementById('tab-tarot').onclick = ()=>{ show('tarot'); window.loadTarotUI?.(tabs.tarot); };
  document.getElementById('tab-fractal').onclick = ()=>{ show('fractal'); document.getElementById('fractalFool').onclick = ()=>{
    window.openFractal?.({ id:'C144N-000', label:'Rebecca Respawn - The Fool', path:'Aleph-Air', numerology:0 });
  }; };
  document.getElementById('tab-corpus').onclick = ()=>{ show('corpus'); }; // corpus.js bootstraps itself

  openBtn.onclick = (e)=>{ e.preventDefault(); show('circuitum'); };
  closeBtn.onclick = ()=> dock.style.display = 'none';

  // keyboard toggle
  window.addEventListener('keydown', (e)=>{ if(e.key==='Tab'){ e.preventDefault(); dock.style.display = (dock.style.display==='block')?'none':'block'; }});
})();
