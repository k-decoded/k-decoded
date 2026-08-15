// communityTopics.ts
// Topic boards for /community/[topic] — each links out to a Google Group
// (sign-in with a Google account, no site registration). Add a topic here
// to get a new board; no other file needs to change.
//
// groupUrl is null until the group exists at groups.google.com — the
// board page shows a "coming soon" state until it's filled in.

export interface CommunityTopic {
  slug: string;
  label: string;
  emoji: string;
  description: string;
  groupUrl: string | null;
}

export const COMMUNITY_TOPICS: CommunityTopic[] = [
  {
    slug: "beauty",
    label: "K-Beauty",
    emoji: "💄",
    description: "Skincare routines, dupes, product recs, what's actually worth the hype.",
    groupUrl: null,
  },
  {
    slug: "travel",
    label: "Travel",
    emoji: "✈️",
    description: "Itineraries, transit questions, neighborhood recs, trip planning.",
    groupUrl: null,
  },
  {
    slug: "language",
    label: "Language Exchange",
    emoji: "🗣️",
    description: "Practice Korean, ask about phrases from a post, swap study tips.",
    groupUrl: null,
  },
  {
    slug: "general",
    label: "General Chat",
    emoji: "💬",
    description: "Anything Korea-related that doesn't fit the other boards — friendship, culture, random finds.",
    groupUrl: null,
  },
];
