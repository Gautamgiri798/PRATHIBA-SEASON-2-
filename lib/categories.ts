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
        name: "Chinmaya Kumar Sahu",
        imageUrl: "/nominees/Best Director/Chinmaya Kumar Sahu.jpeg",
      },
      {
        id: "n2",
        name: "Raja Bagh",
        imageUrl: "/nominees/Best Director/Raja Bagh.jpeg",
      },
      {
        id: "n3",
        name: "Karan Kumar",
        imageUrl: "/nominees/Best Director/Karan Kumar.jpeg",
      },
      {
        id: "n4",
        name: "Sujit Sahoo",
        imageUrl: "/nominees/Best Director/Sujit Sahoo.jpeg",
      },
      {
        id: "n5",
        name: "Shikun Singh",
        imageUrl: "/nominees/Best Director/Shikun Singh.jpeg",
      },
    ],
  },
  {
    id: "best-choreographer",
    title: "Best Choreographer",
    group: "Film Production Awards",
    description: "Vision and creativity behind every performance.",
    thumbnailUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=120&h=160&q=70",
    nominees: [
      {
        id: "n1",
        name: "Aryan",
        imageUrl: "/nominees/Best Choreographer/Aryan.jpeg",
      },
      {
        id: "n2",
        name: "Charan",
        imageUrl: "/nominees/Best Choreographer/Charan.jpeg",
      },
      {
        id: "n3",
        name: "Kanheya",
        imageUrl: "/nominees/Best Choreographer/Kanheya.jpeg",
      },
      {
        id: "n4",
        name: "Raju",
        imageUrl: "/nominees/Best Choreographer/Raju.jpeg",
      },
      {
        id: "n5",
        name: "Karan",
        imageUrl: "/nominees/Best Choreographer/Karan.jpeg",
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
        name: "Raju Bhai",
        imageUrl: "/nominees/Best DOP/Raju Bhai.jpeg",
      },
      {
        id: "n2",
        name: "Raja Bagh",
        imageUrl: "/nominees/Best DOP/Raja Bagh.jpeg",
      },
      {
        id: "n3",
        name: "Tinku Chelak",
        imageUrl: "/nominees/Best DOP/Tinku Chelak.jpeg",
      },
      {
        id: "n4",
        name: "Tubul Singh",
        imageUrl: "/nominees/Best DOP/Tubul Singh.jpeg",
      },
    ],
  },
{
    id: "best-music",
    title: "Best Music",
    group: "Film Production Awards",
    description: "Digital storytelling that carried Sambalpuri culture online.",
    thumbnailUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=120&h=160&q=70",
    nominees: [
      {
        id: "n1",
        name: "Remish Kumar",
        imageUrl: "/nominees/Best Music/Remish Kumar.jpeg",
      },
      {
        id: "n2",
        name: "Moksh Rachit",
        imageUrl: "/nominees/Best Music/Moksh Rachit.jpeg",
      },
      {
        id: "n3",
        name: "Priyan Priyadarshan",
        imageUrl: "/nominees/Best Music/Priyan Priyadarshan.jpeg",
      },
      {
        id: "n4",
        name: "DJ Udaya Sahu",
        imageUrl: "/nominees/Best Music/DJ Udaya Sahu.jpeg",
      },
      {
        id: "n5",
        name: "Rohit Patra",
        imageUrl: "/nominees/Best Music/Rohit Patra.jpeg",
      },
    ],
  },

 {
    id: "best-actor/actress-in-comedy",
    title: "Best Actor/Actress In Comedy",
    group: "Film Production Awards",
    description: "Bringing laughter to life with unforgettable performances.",
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
