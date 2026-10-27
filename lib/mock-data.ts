
export type PostTheme = "programming" | "cat" | "student" | "football" | "anime";

export interface MockComment {
  id: string;
  user: string;
  text: string;
}

export interface MockPost {
  id: string;
  displayName: string;
  handle: string;
  timeAgo: string;
  caption: string;
  theme?: PostTheme;
  imageUrl?: string;
  likeCount: number;
  commentCount: number;
  comments: MockComment[];
}

export const MOCK_POSTS: MockPost[] = [
  {
    id: "post-1",
    displayName: "Arjun Mehta",
    handle: "arjun.codes",
    timeAgo: "2h",
    caption: "When the bug disappears as soon as your professor arrives 😂",
    theme: "programming",
    imageUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    likeCount: 342,
    commentCount: 28,
    comments: [
      { id: "c1", user: "priya.codes", text: "the most consistent bug in software history" },
      { id: "c2", user: "sam_k", text: "happens literally every demo" },
    ],
  },
  {
    id: "post-2",
    displayName: "Sofia Rossi",
    handle: "sofia.rossi",
    timeAgo: "3h",
    caption: "My debugging partner. 🐱",
    theme: "cat",
    imageUrl:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80",
    likeCount: 518,
    commentCount: 41,
    comments: [
      { id: "c3", user: "diego.a", text: "10x more effective than Stack Overflow" },
    ],
  },
  {
    id: "post-3",
    displayName: "Zainab Ali",
    handle: "zainab.study",
    timeAgo: "5h",
    caption: "Studying one night before finals. ☕📚",
    theme: "student",
    imageUrl:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=80",
    likeCount: 276,
    commentCount: 19,
    comments: [
      { id: "c4", user: "leo.m", text: "this is a documentary, not a meme" },
      { id: "c5", user: "aiko.t", text: "the fourth coffee is doing all the work" },
    ],
  },
  {
    id: "post-4",
    displayName: "Marco Silva",
    handle: "marco.footy",
    timeAgo: "7h",
    caption: "Weekend football with friends. ⚽",
    theme: "football",
    imageUrl:
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=80",
    likeCount: 189,
    commentCount: 12,
    comments: [
      { id: "c6", user: "noah.w", text: "count me in next weekend" },
    ],
  },
  {
    id: "post-5",
    displayName: "Kenji Watanabe",
    handle: "kenji.draws",
    timeAgo: "9h",
    caption: "The squad after finishing the final project 🎉",
    theme: "anime",
    imageUrl:
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=900&q=80",
    likeCount: 403,
    commentCount: 35,
    comments: [
      { id: "c7", user: "zainab.study", text: "the exact energy after submitting at 11:59pm" },
      { id: "c8", user: "arjun.codes", text: "we survived another semester" },
    ],
  },
];

export interface MockSuggestion {
  id: string;
  name: string;
  handle: string;
  mutual: string;
}

export const MOCK_SUGGESTIONS: MockSuggestion[] = [
  { id: "s1", name: "Priya Nair", handle: "priya.codes", mutual: "Followed by arjun.codes" },
  { id: "s2", name: "Leo Martins", handle: "leo.m", mutual: "Followed by zainab.study" },
  { id: "s3", name: "Zara Ahmed", handle: "zara.a", mutual: "New to SmartMeme" },
];

export const MOCK_TRENDING = [
  { id: "t1", tag: "#FinalsWeek", posts: "12.4k posts" },
  { id: "t2", tag: "#MemeOfTheDay", posts: "8.1k posts" },
  { id: "t3", tag: "#WeekendFooty", posts: "5.7k posts" },
];

export interface MockNotification {
  id: string;
  text: string;
  timeAgo: string;
}

export const MOCK_NOTIFICATIONS: MockNotification[] = [
  { id: "n1", text: "priya.codes liked your post", timeAgo: "10m" },
  { id: "n2", text: "leo.m started following you", timeAgo: "1h" },
  { id: "n3", text: "sofia.rossi commented on your post", timeAgo: "3h" },
];
