export const MOODS = {
  happy: { emoji: '😊', label: 'Happy', color: '#FFD700' },
  loved: { emoji: '🥰', label: 'Loved', color: '#FF69B4' },
  sad: { emoji: '😔', label: 'Sad', color: '#6495ED' },
  angry: { emoji: '😡', label: 'Angry', color: '#FF4500' },
  anxious: { emoji: '😰', label: 'Anxious', color: '#DDA0DD' },
  tired: { emoji: '😴', label: 'Tired', color: '#778899' },
  peaceful: { emoji: '🤍', label: 'Peaceful', color: '#E0E0E0' },
} as const;

export const LETTER_CATEGORIES = [
  { value: 'when-i-miss-you', label: 'When I Miss You', icon: '💭' },
  { value: 'reasons-i-love-you', label: 'Reasons I Love You', icon: '❤️' },
  { value: 'apologies', label: 'Apologies', icon: '🥺' },
  { value: 'good-morning', label: 'Good Morning', icon: '🌅' },
  { value: 'good-night', label: 'Good Night', icon: '🌙' },
  { value: 'special-occasions', label: 'Special Occasions', icon: '🎉' },
  { value: 'random-love-notes', label: 'Random Love Notes', icon: '💌' },
  { value: 'open-when', label: 'Open When...', icon: '📩' },
] as const;

export const OPEN_WHEN_TAGS = [
  "you're sad",
  "you miss me",
  "you feel alone",
  "you need a reminder of how much I love you",
  "you're having a bad day",
  "you can't sleep",
  "you need motivation",
  "you want to smile",
  "you feel overwhelmed",
  "it's our anniversary",
] as const;

export const DATE_IDEAS = [
  { title: 'Movie Night', icon: '🎬', description: 'Cozy movie night together' },
  { title: 'Dinner Date', icon: '🍽️', description: 'A romantic dinner for two' },
  { title: 'Coffee Date', icon: '☕', description: 'A warm coffee date' },
  { title: 'Motorcycle Ride', icon: '🏍️', description: 'Adventure on two wheels' },
  { title: 'Sunset Watching', icon: '🌅', description: 'Watch the sky paint itself' },
  { title: 'Stay-at-Home Date', icon: '🏠', description: 'A cozy date at home' },
  { title: 'Random Surprise Date', icon: '🎁', description: 'A surprise adventure' },
] as const;

export const DREAM_CATEGORIES = [
  'Travel',
  'Experiences',
  'Goals',
  'Home',
  'Future Plans',
  'Bucket List',
  'Things to Buy',
] as const;

export const ROMANTIC_QUOTES = [
  "In all the world, there is no heart for me like yours.",
  "I love you not only for what you are, but for what I am when I am with you.",
  "Every love story is beautiful, but ours is my favorite.",
  "You are my today and all of my tomorrows.",
  "I fell in love the way you fall asleep: slowly, and then all at once.",
  "You are the finest, loveliest, tenderest person I have ever known.",
  "If I had a flower for every time I thought of you, I could walk through my garden forever.",
  "I would rather spend one lifetime with you, than face all the ages of this world alone.",
  "You are my sun, my moon, and all my stars.",
  "Whatever our souls are made of, his and mine are the same.",
  "I knew the second I met you that there was something about you I needed.",
  "My heart is and always will be yours.",
  "To love and be loved is to feel the sun from both sides.",
  "You make me want to be a better man.",
  "I look at you and see the rest of my life in front of my eyes.",
] as const;

export const RELATIONSHIP_QUESTIONS = [
  "What's your favorite memory of us?",
  "What makes you feel most loved?",
  "What's something you want us to experience together?",
  "What is one thing I do that makes you smile?",
  "What do you love most about our relationship?",
  "What's a dream you want us to chase together?",
  "What song reminds you of us?",
  "What's the funniest moment we've shared?",
  "If we could go anywhere tomorrow, where would we go?",
  "What's something small I do that means a lot to you?",
  "What's your favorite thing about us?",
  "What do you want our future to look like?",
  "What's one thing you've never told me?",
  "What's a challenge that made us stronger?",
  "How do you know I love you?",
  "What's a tradition you want us to start?",
  "What do you admire most about me?",
  "What's the best advice you'd give to other couples?",
  "What moment made you realize you loved me?",
  "What's one thing you want me to know right now?",
] as const;

export const SURPRISE_TYPES = [
  { value: 'message', label: 'Love Message', icon: '💌' },
  { value: 'memory', label: 'Photo Memory', icon: '📸' },
  { value: 'reason', label: 'Reason I Love You', icon: '❤️' },
  { value: 'hug', label: 'Virtual Hug', icon: '🤗' },
  { value: 'letter', label: 'Love Letter', icon: '✉️' },
  { value: 'special', label: 'Special Surprise', icon: '🎁' },
] as const;

