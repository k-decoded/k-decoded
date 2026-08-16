// tagColors.ts
// Deterministically assigns each tag name a color pair from a small
// vibrant palette, so the same tag (e.g. "skincare") always renders in
// the same color everywhere it appears — post cards, post headers, tag
// pages — instead of shifting depending on where it happens to sit in an
// array.

const CATEGORY_COLORS: Record<string, string> = {
  skincare: "bg-teal-50 text-teal-700 ring-1 ring-teal-100",
  makeup: "bg-brand-50 text-brand-700 ring-1 ring-brand-100",
  fashion: "bg-violet-50 text-violet-700 ring-1 ring-violet-100",
  snacks: "bg-orange-50 text-orange-700 ring-1 ring-orange-100",
  media: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  travel: "bg-sky-50 text-sky-700 ring-1 ring-sky-100",
  language: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
};

const PALETTE = [
  "bg-brand-50 text-brand-700 ring-1 ring-brand-100",
  "bg-orange-50 text-orange-700 ring-1 ring-orange-100",
  "bg-teal-50 text-teal-700 ring-1 ring-teal-100",
  "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
];

// A simple string hash (djb2-style) turns the tag name into a number,
// then modulo picks a consistent palette entry for that exact string.
export function getTagColor(tag: string): string {
  const categoryColor = CATEGORY_COLORS[tag.toLowerCase()];
  if (categoryColor) return categoryColor;

  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = (hash * 31 + tag.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
