export type Nominee = {
  id: string;
  name: string;
  subtitle?: string;
};

export type Category = {
  id: string;
  title: string;
  group: "Music Awards" | "Film Production Awards";
  description: string;
  nominees: Nominee[];
};

// EDIT ME: replace placeholder nominee names with real entries once finalized.
// Each category needs exactly 5 nominees. Keep `id` values stable once voting
// has started — changing an id after votes exist will orphan those votes.
export const CATEGORIES: Category[] = [
  {
    id: "best-actor-music",
    title: "Best Actor (Music Album)",
    group: "Music Awards",
    description: "Lead performance in a Sambalpuri music album.",
    nominees: [
      { id: "n1", name: "Nominee 1" },
      { id: "n2", name: "Nominee 2" },
      { id: "n3", name: "Nominee 3" },
      { id: "n4", name: "Nominee 4" },
      { id: "n5", name: "Nominee 5" },
    ],
  },
  {
    id: "best-actress-music",
    title: "Best Actress (Music Album)",
    group: "Music Awards",
    description: "Lead performance in a Sambalpuri music album.",
    nominees: [
      { id: "n1", name: "Nominee 1" },
      { id: "n2", name: "Nominee 2" },
      { id: "n3", name: "Nominee 3" },
      { id: "n4", name: "Nominee 4" },
      { id: "n5", name: "Nominee 5" },
    ],
  },
  {
    id: "viral-song-of-the-year",
    title: "Viral Song of the Year",
    group: "Music Awards",
    description: "The track that defined the year on every playlist.",
    nominees: [
      { id: "n1", name: "Nominee 1" },
      { id: "n2", name: "Nominee 2" },
      { id: "n3", name: "Nominee 3" },
      { id: "n4", name: "Nominee 4" },
      { id: "n5", name: "Nominee 5" },
    ],
  },
  {
    id: "best-lyrics",
    title: "Best Lyrics",
    group: "Music Awards",
    description: "Writing that gave a song its soul.",
    nominees: [
      { id: "n1", name: "Nominee 1" },
      { id: "n2", name: "Nominee 2" },
      { id: "n3", name: "Nominee 3" },
      { id: "n4", name: "Nominee 4" },
      { id: "n5", name: "Nominee 5" },
    ],
  },
  {
    id: "best-singer-male",
    title: "Best Singer — Male",
    group: "Music Awards",
    description: "Outstanding male vocal performance.",
    nominees: [
      { id: "n1", name: "Nominee 1" },
      { id: "n2", name: "Nominee 2" },
      { id: "n3", name: "Nominee 3" },
      { id: "n4", name: "Nominee 4" },
      { id: "n5", name: "Nominee 5" },
    ],
  },
  {
    id: "best-singer-female",
    title: "Best Singer — Female",
    group: "Music Awards",
    description: "Outstanding female vocal performance.",
    nominees: [
      { id: "n1", name: "Nominee 1" },
      { id: "n2", name: "Nominee 2" },
      { id: "n3", name: "Nominee 3" },
      { id: "n4", name: "Nominee 4" },
      { id: "n5", name: "Nominee 5" },
    ],
  },
  {
    id: "best-director",
    title: "Best Director",
    group: "Film Production Awards",
    description: "Vision and command behind the camera.",
    nominees: [
      { id: "n1", name: "Nominee 1" },
      { id: "n2", name: "Nominee 2" },
      { id: "n3", name: "Nominee 3" },
      { id: "n4", name: "Nominee 4" },
      { id: "n5", name: "Nominee 5" },
    ],
  },
  {
    id: "best-dop",
    title: "Best DOP",
    group: "Film Production Awards",
    description: "Director of Photography — the eye behind the frame.",
    nominees: [
      { id: "n1", name: "Nominee 1" },
      { id: "n2", name: "Nominee 2" },
      { id: "n3", name: "Nominee 3" },
      { id: "n4", name: "Nominee 4" },
      { id: "n5", name: "Nominee 5" },
    ],
  },
  {
    id: "promising-face-of-the-year",
    title: "Promising Face of the Year",
    group: "Film Production Awards",
    description: "A newcomer announcing themselves to the industry.",
    nominees: [
      { id: "n1", name: "Nominee 1" },
      { id: "n2", name: "Nominee 2" },
      { id: "n3", name: "Nominee 3" },
      { id: "n4", name: "Nominee 4" },
      { id: "n5", name: "Nominee 5" },
    ],
  },
  {
    id: "content-creator-of-the-year",
    title: "Content Creator of the Year",
    group: "Film Production Awards",
    description: "Digital storytelling that carried Sambalpuri culture online.",
    nominees: [
      { id: "n1", name: "Nominee 1" },
      { id: "n2", name: "Nominee 2" },
      { id: "n3", name: "Nominee 3" },
      { id: "n4", name: "Nominee 4" },
      { id: "n5", name: "Nominee 5" },
    ],
  },
];
