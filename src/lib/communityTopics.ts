// communityTopics.ts
// Topic boards for /community/[topic] — each renders its own GitHub
// Discussions thread (see components/Discussion.astro), all filed under
// the repo's existing "General" discussion category. Add a topic here to
// get a new board; no other file needs to change.

export interface CommunityTopic {
  slug: string;
  label: string;
  emoji: string;
  description: string;
}

export const COMMUNITY_TOPICS: CommunityTopic[] = [
  {
    slug: "beauty",
    label: "K-Beauty",
    emoji: "💄",
    description: "Skincare routines, dupes, product recs, what's actually worth the hype.",
  },
  {
    slug: "travel",
    label: "Travel",
    emoji: "✈️",
    description: "Itineraries, transit questions, neighborhood recs, trip planning.",
  },
  {
    slug: "language",
    label: "Language Exchange",
    emoji: "🗣️",
    description: "Practice Korean, ask about phrases from a post, swap study tips.",
  },
  {
    slug: "general",
    label: "General Chat",
    emoji: "💬",
    description: "Anything Korea-related that doesn't fit the other boards — friendship, culture, random finds.",
  },
];
