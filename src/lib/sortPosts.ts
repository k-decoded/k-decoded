import { execSync } from "node:child_process";
import type { CollectionEntry } from "astro:content";

// Newest first. Posts sharing a publish date are ordered by when git first
// added the file, so the post written later that day wins the homepage hero.
// ponytail: returns 0 for files older than Vercel's shallow clone, so ties
// between old posts fall back to input order; set a time in `date` if one
// of those ever needs forcing.
const addedAt = new Map<string, number>();
function gitAddedAt(post: CollectionEntry<"posts">): number {
  const path = `src/content/posts/${post.id}`;
  if (!addedAt.has(path)) {
    let t = 0;
    try {
      t = Number(execSync(`git log --diff-filter=A --format=%ct -1 -- "${path}"`, { encoding: "utf8" }).trim()) || 0;
    } catch {}
    addedAt.set(path, t);
  }
  return addedAt.get(path)!;
}

export function sortPostsNewestFirst(posts: CollectionEntry<"posts">[]) {
  return posts.sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf() || gitAddedAt(b) - gitAddedAt(a)
  );
}
