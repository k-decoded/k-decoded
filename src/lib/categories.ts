// categories.ts
// The site's fixed top-level content categories, shown as links in the
// header and used to guarantee every category has a working tag page —
// even before any post has been tagged with it yet (see
// src/pages/tags/[tag].astro, which unions this list with whatever tags
// actually appear on posts).
//
// To add a new top-level category later, just add an entry here — no
// other file needs to change.

export interface Category {
  slug: string;
  label: string;
}

export const CATEGORIES: Category[] = [
  { slug: "makeup", label: "Makeup" },
  { slug: "fashion", label: "Fashion" },
  { slug: "skincare", label: "Skincare" },
  { slug: "snacks", label: "Snacks" },
  { slug: "media", label: "Media" },
  { slug: "travel", label: "Travel" },
];
