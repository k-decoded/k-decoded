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
    label: "Korea Trip Help",
    emoji: "✈️",
    description: "Itineraries, transit questions, neighbourhood recs, and trip planning.",
  },
];
