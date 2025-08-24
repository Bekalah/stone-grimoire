// assets/js/folio-ornaments.js
export function applyFolioOrnaments(containerSel=".folio") {
  const folio = document.querySelector(containerSel);
  if (!folio) return;

  // Dropcap first paragraph if not already done
  const firstP = folio.querySelector("p");
  if (firstP && !firstP.classList.contains("dropcap")) {
    firstP.classList.add("dropcap");
  }

  // Wrap any [*X*] pattern in illuminated span (optional)
  folio.innerHTML = folio.innerHTML.replace(
    /\[\*([A-Za-z])\*\]/g,
    '<span class="illuminated">$1</span>'
  );

  // Add aria-labels for decorative marginalia
  const marg = folio.querySelector(".marginalia");
  if (marg && !marg.getAttribute("aria-label")) {
    marg.setAttribute("aria-label", "decorative vine ornament");
  }
}