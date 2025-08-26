<!-- File: assets/js/ui/room-plaque.js -->
<script type="module">
import { applyRoom } from "../engines/cathedral-engine.js";

export async function mountRoomPlaque(targetOrId){
  const target = typeof targetOrId === "string" ? document.querySelector(targetOrId) : targetOrId;
  const room   = await applyRoom(); // resolve by current route
  if (!target) return room;
  target.innerHTML =
    "<div class='controls'>"
    + "<strong>"+(room.title||"Room")+"</strong><br>"
    + "<small>"+(room.element||"")+" · "+(room.toneHz||"")+" Hz · "+(room.stylepack||"")+"</small>"
    + "</div>";
  return room;
}
</script>