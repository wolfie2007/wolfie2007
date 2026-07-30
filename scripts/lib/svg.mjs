import { JBM_REGULAR_B64, JBM_BOLD_B64 } from "../font-data.mjs";

export function fontFaceStyle() {
  return `
@font-face {
  font-family: 'JBM';
  src: url(data:font/woff2;base64,${JBM_REGULAR_B64}) format('woff2');
}
@font-face {
  font-family: 'JBM';
  font-weight: bold;
  src: url(data:font/woff2;base64,${JBM_BOLD_B64}) format('woff2');
}
`;
}

export function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
