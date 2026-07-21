export type Nominee = {
  id: string;
  name: string;
  subtitle?: string;
  song?: string;
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
        song:"Lal Sadhi Thi Mana",
        imageUrl: "/nominees/Best Actor Male/Ankit Pattnaik.jpeg",
      },
      {
        id: "n2",
        name: "Jeet Suna",
        song:"Janiya",
        imageUrl: "/nominees/Best Actor Male/Jeet Suna.jpeg",
      },
      {
        id: "n3",
        name: "Pradeep Bhoi",
        song:"Sundri Nani",
        imageUrl: "/nominees/Best Actor Male/Pradeep Bhoi.jpeg",
      },
      {
        id: "n4",
        name: "Bikash Gosain",
        song:"Pyaari Sajani",
        imageUrl: "/nominees/Best Actor Male/Bikash Gosain.jpeg",
      },
      {
        id: "n5",
        name: "Pinku",
        song: "Baby",
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
        song: "Kamaal",
        imageUrl: "/nominees/Best Actress Female/Meenakshi.jpeg",
      },
      {
        id: "n2",
        name: "Monika Upadhyay",
        song: "Sundri Chakhi",
        imageUrl: "/nominees/Best Actress Female/Monika Upadhyay.jpeg",
      },
      {
        id: "n3",
        name: "Lakita",
        song: "Labanga Lata",
        imageUrl: "/nominees/Best Actress Female/Lakita.jpeg",
      },
      {
        id: "n4",
        name: "Riya Thakre",
        song: "Sundri Nani",
        imageUrl: "/nominees/Best Actress Female/Riya Thakre.jpeg",
      },
      {
        id: "n5",
        name: "Kalpita Singh",
        song: "Janiya",
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
        song: "Sundri Dewani",
        imageUrl: "/nominees/Best Singer Male/Pratap Sahu.jpeg",
      },
      {
        id: "n2",
        name: "Amar Dash",
        song: "Maejhi",
        imageUrl: "/nominees/Best Singer Male/Amar Dash.jpeg",
      },
      {
        id: "n3",
        name: "Remish Kumar",
        song: "Janiya",
        imageUrl: "/nominees/Best Singer Male/Remish Kumar.jpeg",
      },
      {
        id: "n4",
        name: "Ankit Raaj",
        song: "Julumi Radha",
        imageUrl: "/nominees/Best Singer Male/Ankit Raj.jpeg",
      },
      {
        id: "n5",
        name: "Pratham Kumbhar",
        song: "Pyaari Sajani",
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
        song: "Suru Nani",
        imageUrl: "/nominees/Best Singer Female/Soubhagyalaxmi Dash.jpeg",
      },
      {
        id: "n2",
        name: "Kiran Dash",
        song:"Gulap Phool",
        imageUrl: "/nominees/Best Singer Female/Kiran Dash.jpeg",
      },
      {
        id: "n3",
        name: "Monika Sahu",
        song:"Rasia Giri",
        imageUrl: "/nominees/Best Singer Female/Monika Sahu.jpeg",
      },
      {
        id: "n4",
        name: "Sonam Rani",
        song: "Dhol Baja",
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
        song: "Sundri Nani",
        imageUrl: "/nominees/Best Director/Chinmaya Kumar Sahu.jpeg",
      },
      {
        id: "n2",
        name: "Raja Bagh",
        song: "Paschim",
        imageUrl: "/nominees/Best Director/Raja Bagh.jpeg",
      },
      {
        id: "n3",
        name: "Karan Kumar",
        song: "Shilabati",
        imageUrl: "/nominees/Best Director/Karan Kumar.jpeg",
      },
      {
        id: "n4",
        name: "Raju Bhai",
        song: "Janiya",
        imageUrl: "/nominees/Best Director/Raju Bhai.jpeg",
      },
      {
        id: "n5",
        name: "Shikun Singh",
        song: "Kamaal",
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
        song: "Suru Nani",
        imageUrl: "/nominees/Best Choreographer/Aryan.jpeg",
      },
      {
        id: "n2",
        name: "Charan",
        song: "Janiya",
        imageUrl: "/nominees/Best Choreographer/Charan.jpeg",
      },
      {
        id: "n3",
        name: "Kanheya",
        song: "Pardesia Raja",
        imageUrl: "/nominees/Best Choreographer/Kanheya.jpeg",
      },
      {
        id: "n4",
        name: "Raju",
        song: "Baby",
        imageUrl: "/nominees/Best Choreographer/Raju.jpeg",
      },
      {
        id: "n5",
        name: "Karan",
        song: "Lal saree",
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
        song: "Janiya",
        imageUrl: "/nominees/Best DOP/Raju Bhai.jpeg",
      },
      {
        id: "n2",
        name: "Raja Bagh",
        song: "Paschim",
        imageUrl: "/nominees/Best DOP/Raja Bagh.jpeg",
      },
      {
        id: "n3",
        name: "Tinku Chelak",
        song: "Labanga Lata",
        imageUrl: "/nominees/Best DOP/Tinku Chelak.jpeg",
      },
      {
        id: "n4",
        name: "Tubul Singh",
        song: "Kamaal",
        imageUrl: "/nominees/Best DOP/Tubul Singh.jpeg",
      },
      {
        id: "n5",
        name: "Sujit Sahoo",
        song: "Sundri Nani",
        imageUrl: "/nominees/Best DOP/Sujit Sahoo.jpeg",
      },
    ],
  },
{
    id: "best-music",
    title: "Best Music",
    group: "Film Production Awards",
    description: "The soul of every story, brought to life through music.",
    thumbnailUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=120&h=160&q=70",
    nominees: [
      {
        id: "n1",
        name: "Remish Kumar",
        song: "Janiya",
        imageUrl: "/nominees/Best Music/Remish Kumar.jpeg",
      },
      {
        id: "n2",
        name: "Moksh Rachit",
        song: "Gulap Phool",
        imageUrl: "/nominees/Best Music/Moksh Rachit.jpeg",
      },
      {
        id: "n3",
        name: "Priyan Priyadarshan",
        song : "Labanga Lata",
        imageUrl: "/nominees/Best Music/Priyan Priyadarshan.jpeg",
      },
      {
        id: "n4",
        name: "DJ Udaya Sahu",
        song: "Julumi Radha",
        imageUrl: "/nominees/Best Music/DJ Udaya Sahu.jpeg",
      },
      {
        id: "n5",
        name: "Rohit Patra",
        song: "Pyari Sajani",
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
