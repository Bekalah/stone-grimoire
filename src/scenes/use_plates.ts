export const PLATES = [
  { id:"scribal",   title:"Raphael",   src:"/assets/ateliers/atelier_scribal_raphael.png"   },
  { id:"pigment",   title:"Haniel",    src:"/assets/ateliers/atelier_pigment_haniel.png"    },
  { id:"geometry",  title:"Michael",   src:"/assets/ateliers/atelier_geometry_michael.png"  },
  { id:"harmonic",  title:"Gabriel",   src:"/assets/ateliers/atelier_harmonic_gabriel.png"  },
  { id:"architecture", title:"Uriel",  src:"/assets/ateliers/atelier_architecture_uriel.png"},
  { id:"psyche",    title:"Tzaphkiel", src:"/assets/ateliers/atelier_psyche_tzaphkiel.png"  }
];

export async function drawPlate(ctx:CanvasRenderingContext2D, w:number, h:number, id:string){
  const p = PLATES.find(x=>x.id===id) || PLATES[0];
  const img = new Image(); img.src = p.src; await img.decode();
  const s = Math.min(w, h); const x=(w-s)/2, y=(h-s)/2;
  ctx.drawImage(img, x, y, s, s);
  ctx.fillStyle="#e8e9f0"; ctx.font="20px system-ui"; ctx.textAlign="center";
  ctx.fillText(`${p.title} — ${p.id}`, w/2, y + s + 28);
}
