// assets/js/ui/room-plaque.js
import { applyRoom } from "/assets/js/engines/cathedral-engine.js";

export async function mountRoomPlaque(targetOrSelector) {
  const target = typeof targetOrSelector === "string" ? document.querySelector(targetOrSelector) : targetOrSelector;
  const room = await applyRoom();
  if (target) {
    target.innerHTML =
      "<div class='controls'>" +
      "<strong>" + (room.title || "Room") + "</strong><br>" +
      "<small>" + (room.element || "") + " · " + (room.toneHz || "") + " Hz · " + (room.stylepack || "") + "</small>" +
      "</div>";
  }
  return room;
}

export default mountRoomPlaque;
