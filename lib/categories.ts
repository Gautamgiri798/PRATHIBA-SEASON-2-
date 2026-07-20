export type Nominee = {
  id: string;
  name: string;
  subtitle?: string;
  imageUrl?: string;
};

export type Category = {
  id: string;
  title: string;
  group: "Music Awards" | "Film Production Awards";
  description: string;
  nominees: Nominee[];
  thumbnailUrl?: string;
};

export const CATEGORIES: Category[] = [
  {
    id: "best-actor-music",
    title: "Best Actor Male(Music Album)",
    group: "Music Awards",
    description: "Lead performance in a Sambalpuri music album.",
    thumbnailUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&h=160&q=70",
    nominees: [
      {
        id: "n1",
        name: "Ankit Pattnaik",
        imageUrl: "/nominees/Best Actor Male/Ankit Pattnaik.jpeg",
      },
      {
        id: "n2",
        name: "Jeet Suna",
        imageUrl: "/nominees/Best Actor Male/Jeet Suna.jpeg",
      },
      {
        id: "n3",
        name: "Pradeep Bhoi",
        imageUrl: "/nominees/Best Actor Male/Pradeep Bhoi.jpeg",
      },
      {
        id: "n4",
        name: "Bikash Gosain",
        imageUrl: "/nominees/Best Actor Male/Bikash Gosain.jpeg",
      },
      {
        id: "n5",
        name: "Pinku",
        imageUrl: "/nominees/Best Actor Male/Pinku.jpeg",
      },
    ],
  },
  {
    id: "best-actress-music",
    title: "Best Actress (Music Album)",
    group: "Music Awards",
    description: "Lead performance in a Sambalpuri music album.",
    thumbnailUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=160&q=70",
    nominees: [
      {
        id: "n1",
        name: "Nominee 1",
        imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n2",
        name: "Nominee 2",
        imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n3",
        name: "Nominee 3",
        imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n4",
        name: "Nominee 4",
        imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n5",
        name: "Nominee 5",
        imageUrl: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&h=150&q=80",
      },
    ],
  },
  {
    id: "viral-song-of-the-year",
    title: "Viral Song of the Year",
    group: "Music Awards",
    description: "The track that defined the year on every playlist.",
    thumbnailUrl: "https://images.unsplash.com/photo-1487180142328-054b783fc471?auto=format&fit=crop&w=120&h=160&q=70",
    nominees: [
      {
        id: "n1",
        name: "Nominee 1",
        imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n2",
        name: "Nominee 2",
        imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n3",
        name: "Nominee 3",
        imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n4",
        name: "Nominee 4",
        imageUrl: "https://images.unsplash.com/photo-1487180142328-054b783fc471?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n5",
        name: "Nominee 5",
        imageUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=150&h=150&q=80",
      },
    ],
  },
  {
    id: "best-lyrics",
    title: "Best Lyrics",
    group: "Music Awards",
    description: "Writing that gave a song its soul.",
    thumbnailUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=120&h=160&q=70",
    nominees: [
      {
        id: "n1",
        name: "Nominee 1",
        imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n2",
        name: "Nominee 2",
        imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n3",
        name: "Nominee 3",
        imageUrl: "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n4",
        name: "Nominee 4",
        imageUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n5",
        name: "Nominee 5",
        imageUrl: "https://images.unsplash.com/photo-1516414447565-b14be0adf13e?auto=format&fit=crop&w=150&h=150&q=80",
      },
    ],
  },
  {
    id: "best-singer-male",
    title: "Best Singer — Male",
    group: "Music Awards",
    description: "Outstanding male vocal performance.",
    thumbnailUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&h=160&q=70",
    nominees: [
      {
        id: "n1",
        name: "Nominee 1",
        imageUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n2",
        name: "Nominee 2",
        imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n3",
        name: "Nominee 3",
        imageUrl: "https://images.unsplash.com/photo-1489980508314-941910ded1f4?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n4",
        name: "Nominee 4",
        imageUrl: "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n5",
        name: "Nominee 5",
        imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80",
      },
    ],
  },
  {
    id: "best-singer-female",
    title: "Best Singer — Female",
    group: "Music Awards",
    description: "Outstanding female vocal performance.",
    thumbnailUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=120&h=160&q=70",
    nominees: [
      {
        id: "n1",
        name: "Nominee 1",
        imageUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n2",
        name: "Nominee 2",
        imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n3",
        name: "Nominee 3",
        imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n4",
        name: "Nominee 4",
        imageUrl: "https://images.unsplash.com/photo-1491349174775-aa7edd81094a?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n5",
        name: "Nominee 5",
        imageUrl: "https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?auto=format&fit=crop&w=150&h=150&q=80",
      },
    ],
  },
  {
    id: "best-director",
    title: "Best Director",
    group: "Film Production Awards",
    description: "Vision and command behind the camera.",
    thumbnailUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=120&h=160&q=70",
    nominees: [
      {
        id: "n1",
        name: "Nominee 1",
        imageUrl: "https://images.unsplash.com/photo-1542206395-9feb3edaa68d?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n2",
        name: "Nominee 2",
        imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n3",
        name: "Nominee 3",
        imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n4",
        name: "Nominee 4",
        imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n5",
        name: "Nominee 5",
        imageUrl: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=150&h=150&q=80",
      },
    ],
  },
  {
    id: "best-dop",
    title: "Best DOP",
    group: "Film Production Awards",
    description: "Director of Photography — the eye behind the frame.",
    thumbnailUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=120&h=160&q=70",
    nominees: [
      {
        id: "n1",
        name: "Nominee 1",
        imageUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n2",
        name: "Nominee 2",
        imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n3",
        name: "Nominee 3",
        imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n4",
        name: "Nominee 4",
        imageUrl: "https://images.unsplash.com/photo-1481026380173-c33863b7b935?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n5",
        name: "Nominee 5",
        imageUrl: "https://images.unsplash.com/photo-1501183007986-d0d080b147f9?auto=format&fit=crop&w=150&h=150&q=80",
      },
    ],
  },
  {
    id: "promising-face-of-the-year",
    title: "Promising Face of the Year",
    group: "Film Production Awards",
    description: "A newcomer announcing themselves to the industry.",
    thumbnailUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=120&h=160&q=70",
    nominees: [
      {
        id: "n1",
        name: "Nominee 1",
        imageUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n2",
        name: "Nominee 2",
        imageUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n3",
        name: "Nominee 3",
        imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n4",
        name: "Nominee 4",
        imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n5",
        name: "Nominee 5",
        imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80",
      },
    ],
  },
  {
    id: "content-creator-of-the-year",
    title: "Content Creator of the Year",
    group: "Film Production Awards",
    description: "Digital storytelling that carried Sambalpuri culture online.",
    thumbnailUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=120&h=160&q=70",
    nominees: [
      {
        id: "n1",
        name: "Nominee 1",
        imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n2",
        name: "Nominee 2",
        imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n3",
        name: "Nominee 3",
        imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n4",
        name: "Nominee 4",
        imageUrl: "https://images.unsplash.com/photo-1530893609608-32a9af3aa95c?auto=format&fit=crop&w=150&h=150&q=80",
      },
      {
        id: "n5",
        name: "Nominee 5",
        imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=150&h=150&q=80",
      },
    ],
  },
];
