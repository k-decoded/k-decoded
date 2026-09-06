// categoryBuckets.ts
// Maps the site's real, granular post tags onto small, human-facing
// content buckets. There's no single "beauty" or "korean" tag in use
// across posts — these arrays are how "Beauty"/"Food"/"Culture" nav
// items and landing pages (src/pages/category/[bucket].astro) know
// which tagged posts belong to them.
//
// Plain data, safe to import both server-side (Astro frontmatter) and
// client-side (myKorea.client.ts, for the My Korea Seoul List filter
// chips) — no browser APIs here.

export const BEAUTY_TAGS = ["skincare", "makeup", "haircare"];
export const FOOD_TAGS = ["food", "snacks"];
export const CULTURE_TAGS = ["culture", "media", "fashion"];

export const CATEGORY_BUCKETS: Record<string, string[]> = {
  beauty: BEAUTY_TAGS,
  food: FOOD_TAGS,
  culture: CULTURE_TAGS,
};
