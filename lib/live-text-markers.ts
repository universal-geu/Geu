// Live text editing ("Editar textos en tiempo real" in the admin): while an
// admin has the mode on, every editable site text is rendered with an
// invisible zero-width marker carrying its slot key in front of it. The
// on-page editor finds those markers in the DOM to know exactly which
// element shows which text — no per-page wiring needed. Normal visitors
// never get markers.

export const LIVE_TEXT_EDIT_COOKIE = "geu_live_text_edit";

// Set on the SiteTexts map (by getSiteTexts) to the admin's division when the
// mode is on; resolveText only adds markers when it's present.
export const LIVE_TEXT_EDIT_FLAG = "__liveTextEditDivision";

const MARKER_EDGE = "⁣";
const BIT_ZERO = "​";
const BIT_ONE = "‌";

export const LIVE_TEXT_MARKER_SOURCE = "⁣([​‌]+)⁣";

export function encodeLiveTextMarker(key: string) {
  const bits = Array.from(key)
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
    .join("");
  return `${MARKER_EDGE}${bits.replace(/0/g, BIT_ZERO).replace(/1/g, BIT_ONE)}${MARKER_EDGE}`;
}

export function decodeLiveTextMarker(encodedBits: string) {
  const bits = encodedBits.replace(new RegExp(BIT_ZERO, "g"), "0").replace(new RegExp(BIT_ONE, "g"), "1");
  let key = "";
  for (let index = 0; index + 8 <= bits.length; index += 8) {
    key += String.fromCharCode(parseInt(bits.slice(index, index + 8), 2));
  }
  return key;
}

export function findLiveTextKeys(text: string) {
  return Array.from(text.matchAll(new RegExp(LIVE_TEXT_MARKER_SOURCE, "g")), (match) =>
    decodeLiveTextMarker(match[1]),
  );
}

export function stripLiveTextMarkers(text: string) {
  return text.replace(new RegExp(LIVE_TEXT_MARKER_SOURCE, "g"), "");
}
