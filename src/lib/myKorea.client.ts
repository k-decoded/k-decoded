// myKorea.client.ts
// Shared client-side data layer for "My Korea" — the save/trip-planning
// hub at /my-korea. Every function here just reads/writes localStorage
// directly (no class, no singleton, no event emitter). Centralized here
// because the same handful of keys are read and written from several
// files (PostEngagement.astro, vocab.astro, Nav.astro, my-korea.astro)
// and hand-rolling `JSON.parse(localStorage.getItem(k) ?? "[]")` in each
// of them risks one copy drifting out of sync with the shape.
//
// Existing keys (k-decoded:saved-reads, k-decoded:seoul-list,
// k-decoded:known-words, and their -title companions) are read/written
// with the exact same names and shapes they already had before this
// file existed — nothing here changes what a returning visitor's
// existing saved data looks like.

export type TripDay = "day1" | "day2" | "day3" | "day4" | "day5" | "unscheduled";

export const TRIP_DAYS: TripDay[] = ["day1", "day2", "day3", "day4", "day5", "unscheduled"];

export interface SeoulListMeta {
  image?: string;
  description: string;
  categories: string[];
}

export interface ChecklistItem {
  id: string;
  label: string;
}

function readArray(key: string): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeArray(key: string, values: string[]) {
  localStorage.setItem(key, JSON.stringify(values));
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

// ---- Saved reads (existing keys, untouched shape) ----

export function getSavedReads(): string[] {
  return readArray("k-decoded:saved-reads");
}

export function getReadTitle(slug: string): string {
  return localStorage.getItem(`k-decoded:read-title:${slug}`) ?? slug.replace(/-/g, " ");
}

export function isReadSaved(slug: string): boolean {
  return getSavedReads().includes(slug);
}

export function toggleSavedRead(slug: string, title: string): boolean {
  const reads = new Set(getSavedReads());
  const nowSaved = !reads.has(slug);
  nowSaved ? reads.add(slug) : reads.delete(slug);
  writeArray("k-decoded:saved-reads", [...reads]);
  localStorage.setItem(`k-decoded:read-title:${slug}`, title);
  return nowSaved;
}

export function removeSavedRead(slug: string) {
  const reads = new Set(getSavedReads());
  reads.delete(slug);
  writeArray("k-decoded:saved-reads", [...reads]);
}

// Maps a post's existing frontmatter tags onto the Seoul List's fixed
// filter chips (All/Places/Food/Cafés/Beauty/Shopping). No post is
// tagged "beauty" or "cafes" today, so those buckets stay empty until a
// post exists for them — the chips still render either way. "travel" is
// the fallback bucket, matching how the Seoul-list button itself is
// already gated on `tags.includes("travel")`.
const CATEGORY_TAG_MAP: Record<string, string> = {
  food: "food",
  snacks: "food",
  skincare: "beauty",
  makeup: "beauty",
  haircare: "beauty",
  shopping: "shopping",
};

export function bucketCategories(tags: string[]): string[] {
  const buckets = new Set(tags.map((tag) => CATEGORY_TAG_MAP[tag]).filter((b): b is string => !!b));
  if (buckets.size === 0 && tags.includes("travel")) buckets.add("places");
  return [...buckets];
}

// ---- Seoul list (existing keys, plus new -meta enrichment) ----

export function getSeoulList(): string[] {
  return readArray("k-decoded:seoul-list");
}

export function getSeoulTitle(slug: string): string {
  return localStorage.getItem(`k-decoded:seoul-title:${slug}`) ?? slug.replace(/-/g, " ");
}

export function getSeoulListMeta(slug: string): SeoulListMeta | null {
  return readJSON<SeoulListMeta | null>(`k-decoded:seoul-list-meta:${slug}`, null);
}

export function isOnSeoulList(slug: string): boolean {
  return getSeoulList().includes(slug);
}

export function toggleSeoulList(slug: string, title: string, meta: SeoulListMeta): boolean {
  const list = new Set(getSeoulList());
  const nowSaved = !list.has(slug);
  nowSaved ? list.add(slug) : list.delete(slug);
  writeArray("k-decoded:seoul-list", [...list]);
  localStorage.setItem(`k-decoded:seoul-title:${slug}`, title);
  if (nowSaved) {
    localStorage.setItem(`k-decoded:seoul-list-meta:${slug}`, JSON.stringify(meta));
  }
  return nowSaved;
}

export function removeFromSeoulList(slug: string) {
  const list = new Set(getSeoulList());
  list.delete(slug);
  writeArray("k-decoded:seoul-list", [...list]);
}

// ---- Trip planner (new — independent of Seoul list membership) ----

export function getTripDay(slug: string): TripDay {
  const days = readJSON<Record<string, TripDay>>("k-decoded:trip-days", {});
  return days[slug] ?? "unscheduled";
}

export function getTripOrder(day: TripDay): string[] {
  return readArray(`k-decoded:trip-order:${day}`);
}

export function setTripDay(slug: string, day: TripDay) {
  const days = readJSON<Record<string, TripDay>>("k-decoded:trip-days", {});
  const previousDay = days[slug];
  days[slug] = day;
  localStorage.setItem("k-decoded:trip-days", JSON.stringify(days));

  if (previousDay && previousDay !== day) {
    writeArray(
      `k-decoded:trip-order:${previousDay}`,
      getTripOrder(previousDay).filter((s) => s !== slug)
    );
  }
  const order = getTripOrder(day);
  if (!order.includes(slug)) writeArray(`k-decoded:trip-order:${day}`, [...order, slug]);
}

export function setTripOrder(day: TripDay, slugs: string[]) {
  writeArray(`k-decoded:trip-order:${day}`, slugs);
}

export function removeFromTrip(slug: string) {
  const days = readJSON<Record<string, TripDay>>("k-decoded:trip-days", {});
  const day = days[slug];
  delete days[slug];
  localStorage.setItem("k-decoded:trip-days", JSON.stringify(days));
  if (day) {
    writeArray(`k-decoded:trip-order:${day}`, getTripOrder(day).filter((s) => s !== slug));
  }
}

// ---- Vocab: known (existing, untouched) + saved (new, separate) ----

export function getKnownWords(): string[] {
  return readArray("k-decoded:known-words");
}

export function isWordKnown(hangul: string): boolean {
  return getKnownWords().includes(hangul);
}

export function toggleKnownWord(hangul: string): boolean {
  const known = new Set(getKnownWords());
  const nowKnown = !known.has(hangul);
  nowKnown ? known.add(hangul) : known.delete(hangul);
  writeArray("k-decoded:known-words", [...known]);
  return nowKnown;
}

export function getSavedWords(): string[] {
  return readArray("k-decoded:saved-words");
}

export function isWordSaved(hangul: string): boolean {
  return getSavedWords().includes(hangul);
}

export function toggleSavedWord(hangul: string): boolean {
  const words = new Set(getSavedWords());
  const nowSaved = !words.has(hangul);
  nowSaved ? words.add(hangul) : words.delete(hangul);
  writeArray("k-decoded:saved-words", [...words]);
  if (nowSaved) {
    localStorage.setItem(`k-decoded:word-saved-at:${hangul}`, new Date().toISOString());
  }
  return nowSaved;
}

export function getWordSavedAt(hangul: string): string | null {
  return localStorage.getItem(`k-decoded:word-saved-at:${hangul}`);
}

// ---- Trip checklist ----

export const DEFAULT_CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: "passport", label: "Passport" },
  { id: "flights", label: "Flights" },
  { id: "accommodation", label: "Accommodation" },
  { id: "travel-insurance", label: "Travel insurance" },
  { id: "esim", label: "eSIM / SIM" },
  { id: "tmoney", label: "T-money card" },
  { id: "airport-transfer", label: "Airport transfer" },
  { id: "currency", label: "Currency / payment setup" },
  { id: "entry-requirements", label: "Korea entry requirements checked" },
  { id: "apps", label: "Essential apps downloaded" },
];

export function getChecklistChecked(): string[] {
  return readArray("k-decoded:checklist-checked");
}

export function getChecklistCustomItems(): ChecklistItem[] {
  return readJSON<ChecklistItem[]>("k-decoded:checklist-custom", []);
}

export function getAllChecklistItems(): ChecklistItem[] {
  return [...DEFAULT_CHECKLIST_ITEMS, ...getChecklistCustomItems()];
}

export function toggleChecklistItem(id: string): boolean {
  const checked = new Set(getChecklistChecked());
  const nowChecked = !checked.has(id);
  nowChecked ? checked.add(id) : checked.delete(id);
  writeArray("k-decoded:checklist-checked", [...checked]);
  return nowChecked;
}

export function addChecklistItem(label: string): ChecklistItem {
  const item: ChecklistItem = { id: `custom-${Date.now()}`, label };
  const items = getChecklistCustomItems();
  items.push(item);
  localStorage.setItem("k-decoded:checklist-custom", JSON.stringify(items));
  return item;
}

// ---- Overview ----

export function getTotalSavedCount(): number {
  return getSavedReads().length + getSeoulList().length;
}
