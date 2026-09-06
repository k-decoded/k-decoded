// vocabGlossary.ts
// Build-time aggregation of every post's `vocab` frontmatter array into
// one deduplicated (by hangul) glossary. Originally lived inline in
// src/pages/vocab.astro; pulled out here so /my-korea can look up a
// saved word's romanization/meaning without re-implementing the same
// aggregation a second time.

import { getCollection } from "astro:content";

export interface GlossaryEntry {
  hangul: string;
  romanization: string;
  meaning: string;
  tags: Set<string>;
  sources: { title: string; slug: string }[];
}

export async function getVocabGlossary(): Promise<GlossaryEntry[]> {
  const posts = await getCollection("posts", ({ data }) => data.draft !== true);
  const glossaryMap = new Map<string, GlossaryEntry>();

  for (const post of posts) {
    for (const entry of post.data.vocab) {
      const existing = glossaryMap.get(entry.hangul);
      if (existing) {
        existing.sources.push({ title: post.data.title, slug: post.slug });
        post.data.tags.forEach((tag) => existing.tags.add(tag));
      } else {
        glossaryMap.set(entry.hangul, {
          ...entry,
          tags: new Set(post.data.tags),
          sources: [{ title: post.data.title, slug: post.slug }],
        });
      }
    }
  }

  return Array.from(glossaryMap.values()).sort((a, b) => a.romanization.localeCompare(b.romanization));
}

// Turns a romanization like "jaoeseon chadanje" into the URL-safe anchor
// id used by both /vocab and inline post links (/vocab#<this>).
export function slugifyRomanization(romanization: string) {
  return romanization.trim().toLowerCase().replace(/\s+/g, "-");
}
