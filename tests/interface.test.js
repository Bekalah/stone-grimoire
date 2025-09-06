import {validateInterface} from "../engines/interface-guard.js";
import {readFile} from "node:fs/promises";

(async ()=>{
  const sample = JSON.parse(await readFile("assets/data/sample_interface.json", "utf8"));
  const res = await validateInterface(sample);
  if(!res.valid){ throw new Error("Interface schema failed: "+JSON.stringify(res.errors)); }
  console.log("Interface schema OK");
})();
