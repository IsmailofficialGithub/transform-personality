export const HABIT_NAMES = {
  nofap: "NoFap (Avoid Pornography)",
  smoking: "Quit Smoking",
  alcohol: "No Alcohol",
  junkfood: "Healthy Eating",
  gaming: "Limit Gaming",
  socialmedia: "Limit Social Media",
  exercise: "Exercise Daily",
  reading: "Read 10 Pages",
  meditation: "Meditate Daily",
} as const;

export const HABIT_DESCRIPTIONS = {
  nofap: "Reclaim your focus, energy, and discipline.",
  smoking: "Break free from nicotine and breathe better.",
  alcohol: "Stay clear-minded and improve your health.",
  junkfood: "Eat mindfully — fuel your body with real food.",
  gaming: "Control your playtime and balance life.",
  socialmedia: "Be mindful of your screen time.",
  exercise: "Boost your energy and mood daily.",
  reading: "Feed your mind — grow every day.",
  meditation: "Find calm and mental clarity.",
} as const;

// ✅ Realistic, royalty-free placeholder images from Unsplash
export const HABIT_IMAGES = {
  nofap: "https://images.unsplash.com/photo-1600508775481-8e5f7c9e3b9b",
  smoking: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
  alcohol: "https://images.unsplash.com/photo-1601987077720-38e38b4b9b7e",
  junkfood: "https://images.unsplash.com/photo-1606755962773-0e69e8a99b9e",
  gaming: "https://images.unsplash.com/photo-1605902711622-cfb43c4437d3",
  socialmedia: "https://images.unsplash.com/photo-1588702547923-7093a6c3ba33",
  exercise: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
  reading: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0ea",
  meditation: "https://images.unsplash.com/photo-1519183071298-a2962be90b8e",
} as const;

export type HabitKey = keyof typeof HABIT_NAMES;
