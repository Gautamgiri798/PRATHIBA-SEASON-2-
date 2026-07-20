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
    title: "Best Actor (Music Album)",
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
        name: "Meenakshi",
        imageUrl: "/nominees/Best Actress Female/Meenakshi.jpeg",
      },
      {
        id: "n2",
        name: "Monika Upadhyay",
        imageUrl: "/nominees/Best Actress Female/Monika Upadhyay.jpeg",
      },
      {
        id: "n3",
        name: "Lakita",
        imageUrl: "/nominees/Best Actress Female/Lakita.jpeg",
      },
      {
        id: "n4",
        name: "Riya Thakre",
        imageUrl: "/nominees/Best Actress Female/Riya Thakre.jpeg",
      },
      {
        id: "n5",
        name: "Kalpita Singh",
        imageUrl: "/nominees/Best Actress Female/Kalpita Singh.jpeg",
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
        name: "Pratap Sahu",
        imageUrl: "/nominees/Best Singer Male/Pratap Sahu.jpeg",
      },
      {
        id: "n2",
        name: "Amar Dash",
        imageUrl: "/nominees/Best Singer Male/Amar Dash.jpeg",
      },
      {
        id: "n3",
        name: "Remish Kumar",
        imageUrl: "/nominees/Best Singer Male/Remish Kumar.jpeg",
      },
      {
        id: "n4",
        name: "Ankit Raj",
        imageUrl: "/nominees/Best Singer Male/Ankit Raj.jpeg",
      },
      {
        id: "n5",
        name: "Pratham Kumbhar",
        imageUrl: "/nominees/Best Singer Male/Pratham Kumbhar.jpeg",
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
        name: "Soubhagyalaxmi Dash",
        imageUrl: "/nominees/Best Singer Female/Soubhagyalaxmi Dash.jpeg",
      },
      {
        id: "n2",
        name: "Kiran Dash",
        imageUrl: "/nominees/Best Singer Female/Kiran Dash.jpeg",
      },
      {
        id: "n3",
        name: "Monika Sahu",
        imageUrl: "/nominees/Best Singer Female/Monika Sahu.jpeg",
      },
      {
        id: "n4",
        name: "Sonam Rani",
        imageUrl: "/nominees/Best Singer Female/Sonam Rani.jpeg",
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

 {
    id: "best-actor/actress-in-comedy",
    title: "Best Actor/Actress In Comedy",
    group: "Film Production Awards",
    description: "Digital storytelling that carried Sambalpuri culture online.",
    thumbnailUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=120&h=160&q=70",
    nominees: [
      {
        id: "n1",
        name: "Chandni Suna",
        imageUrl: "/nominees/Best Actor,Actress in Comedy/Chandni Suna.jpeg",
      },
      {
        id: "n2",
        name: "Sumit",
        imageUrl: "/nominees/Best Actor,Actress in Comedy/Sumit.jpeg",
      },
      {
        id: "n3",
        name: "Lokesh",
        imageUrl: "/nominees/Best Actor,Actress in Comedy/Lokesh.jpeg",
      },
      {
        id: "n4",
        name: "Tankadhar",
        imageUrl: "/nominees/Best Actor,Actress in Comedy/Tankadhar.jpeg",
      },
      {
        id: "n5",
        name: "Riya",
        imageUrl: "/nominees/Best Actor,Actress in Comedy/Riya.jpeg",
      },
    ],
  },
];
