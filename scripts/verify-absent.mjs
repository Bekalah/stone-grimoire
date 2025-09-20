// ND-safe, fail-closed guard for forbidden assets returning to the tree.
import { existsSync } from "node:fs";

const tombs = ["assets/art/inbox/banner_grimoire_serious.png"];
const risen = tombs.filter(path => existsSync(path));

if (risen.length){
  console.error("PROTECT violation: undead asset(s) present:", risen);
  process.exit(1);
} else {
  console.log("Guard ok — no undead assets detected.");
}
