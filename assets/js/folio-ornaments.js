// assets/js/folio-ornaments.js
// Small, safe ornaments for folio pages (iPad-friendly, no deps)
export function applyFolioOrnaments(containerSel = ".folio") {
  const folio = document.querySelector(containerSel);
  if (!folio) return;

  // Dropcap the first plain paragraph once
  const firstP = folio.querySelector("p");
  if (firstP && !firstP.classList.contains("dropcap")) {
    firstP.classList.add("dropcap");
  }

  // Optional illuminated initial: write [*A*] in Markdown to gild the first letter
  // Kept minimal to avoid heavy parsing on mobile
  folio.innerHTML = folio.innerHTML.replace(
    /\[\*([A-Za-z])\*\]/g,
    '<span class="illuminated">$1</span>'
  );

  // Accessibility label for decorative vine
  const marg = folio.querySelector(".marginalia");
  if (marg && !marg.getAttribute("aria-label")) {
    marg.setAttribute("aria-label", "decorative vine ornament");
  }
}