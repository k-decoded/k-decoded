// tagColors.ts
// Deterministically assigns each tag name a color pair from a small
// vibrant palette, so the same tag (e.g. "skincare") always renders in
// the same color everywhere it appears — post cards, post headers, tag
// pages — instead of shifting depending on where it happens to sit in an
// array.

const PALETTE = [
  "bg-brand-50 text-brand-700",
  "bg-orange-50 text-orange-700",
  "bg-teal-50 text-teal-700",
  "bg-amber-50 text-amber-700",
];

// A simple string hash (djb2-style) turns the tag name into a number,
// then modulo picks a consistent palette entry for that exact string.
export function getTagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = (hash * 31 + tag.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
