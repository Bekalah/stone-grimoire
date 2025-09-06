export const Safety = {
  state:{motion:"reduced", autoplay:false, strobe:false, contrast:"balanced"},
  apply(doc=document){
    doc.documentElement.dataset.motion=this.state.motion;
    doc.documentElement.dataset.autoplay=String(this.state.autoplay);
    doc.documentElement.dataset.strobe=String(this.state.strobe);
    doc.documentElement.dataset.contrast=this.state.contrast;
  }
};
