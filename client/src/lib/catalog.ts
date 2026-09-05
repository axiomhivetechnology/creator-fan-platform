export type CreatorPreview = {
  handle: string;
  displayName: string;
  initials: string;
  category: string;
  tagline: string;
  accent: string;
  imageUrl?: string;
  instagramHandle?: string;
  membershipPrice: string;
  status: "Live now" | "Next session" | "New drop";
  nextEvent: string;
};

export const creators: CreatorPreview[] = [
  {
    handle: "kaden-mccullen",
    displayName: "Kaden McCullen",
    initials: "KM",
    category: "Featured creator",
    tagline: "A private creator space for live rooms, premium posts, gifting, and member access.",
    accent: "from-fuchsia-500 via-rose-400 to-indigo-500",
    imageUrl: "/manus-storage/kaden-mccullen_560fb805.jpeg",
    instagramHandle: "@itskadenbro",
    membershipPrice: "$9 / month",
    status: "Live now",
    nextEvent: "Open studio session",
  },
  {
    handle: "openframe",
    displayName: "Open Frame",
    initials: "OF",
    category: "Visual diary",
    tagline: "Process-led photography, field notes, and limited collections.",
    accent: "from-sky-400 via-cyan-300 to-emerald-200",
    membershipPrice: "$12 / month",
    status: "New drop",
    nextEvent: "Field notes: Vol. 04",
  },
  {
    handle: "papertrail",
    displayName: "Paper Trail",
    initials: "PT",
    category: "Writing & ideas",
    tagline: "A quiet corner for letters, drafts, and creative experiments.",
    accent: "from-amber-300 via-orange-300 to-rose-300",
    membershipPrice: "$7 / month",
    status: "Next session",
    nextEvent: "Members’ reading room",
  },
  {
    handle: "nightgarden",
    displayName: "Night Garden",
    initials: "NG",
    category: "Wellness & movement",
    tagline: "Night rituals, movement studies, and members-only check-ins.",
    accent: "from-violet-500 via-indigo-400 to-sky-300",
    membershipPrice: "$11 / month",
    status: "New drop",
    nextEvent: "Sunday reset",
  },
];

export const categories = ["All creators", "Music & culture", "Visual diary", "Writing & ideas", "Wellness & movement"];
