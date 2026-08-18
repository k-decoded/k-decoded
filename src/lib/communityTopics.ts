// communityTopics.ts
// Topic boards for /community/[topic]. These match the seeded Supabase forum
// categories in supabase/forum_schema.sql; keep slugs aligned when editing.

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
