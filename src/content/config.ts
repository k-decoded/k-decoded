import { defineCollection, z } from "astro:content";

// A single vocab entry, e.g. { hangul: "선크림", romanization: "seonkeurim",
// meaning: "sunscreen" }. Reused by the VocabCard component and by the
// Vocab Glossary page, which scans every post for these.
const vocabEntry = z.object({
  hangul: z.string(),
  romanization: z.string(),
  meaning: z.string(),
});

// A product's price in each currency the audience shops in. Strings, not
// numbers, so you can write "$18", "£14", "¥2,800", "₩24,000" with
// symbols/commas already formatted the way they should display. KRW is
// included alongside USD/GBP/JPY since it's the price actually printed
// on the product when shopping the Korean site directly.
const price = z.object({
  usd: z.string(),
  gbp: z.string(),
  jpy: z.string(),
  krw: z.string(),
});

// Product-review-only fields. Optional because not every post is a review
// (some are pure language/culture posts) — when a post IS a review, fill
// these in and set isReview: true.
const productInfo = z.object({
  name: z.string(),
  brand: z.string(),
  // Optional — skip it on a post rather than guess at a price you can't
  // confirm (e.g. a regional/limited-edition item with no listed price).
  price: price.optional(),
  affiliateLink: z.string().url().optional(),
  rating: z.number().min(0).max(5),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
});

// Overrides the Quick Decode card on the post page. Only needed for
// "roundup" posts covering many unrelated things, where showing a single
// vocab word (the default) wouldn't represent the post as a whole.
const quickDecode = z.object({
  title: z.string(),
  summary: z.string(),
});

const posts = defineCollection({
  // "content" tells Astro these are Markdown/MDX files with a body,
  // not just data files.
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(), // used for the post excerpt AND the SEO meta description
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    heroImage: z.string().optional(), // optional thumbnail, e.g. "/images/posts/my-post.jpg"
    draft: z.boolean().default(false), // set true to hide a post from all listings while you draft it
    vocab: z.array(vocabEntry).default([]),
    quickDecode: quickDecode.optional(),
    isReview: z.boolean().default(false),
    product: productInfo.optional(),
  }),
});

// Every top-level key here becomes a folder Astro expects under
// src/content/ — so "posts" maps to src/content/posts/*.md
export const collections = { posts };
