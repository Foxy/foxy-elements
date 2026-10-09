// The design system's type is Albert Sans (and Inter). Checkout loads it with
// the DS <FontFaces /> component; the portal renders in a shadow root, where an
// @font-face rule does not register, so the stylesheet has to go into the host
// page's <head>. Same URL as the DS, added once per document, and left in place
// on disconnect: other portals or the host page may use it.
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap";

export function ensureBrandFonts(doc: Document): void {
  if (doc.head.querySelector(`link[rel="stylesheet"][href="${FONTS_HREF}"]`)) return;

  const link = doc.createElement("link");
  link.rel = "stylesheet";
  link.href = FONTS_HREF;
  doc.head.append(link);
}
