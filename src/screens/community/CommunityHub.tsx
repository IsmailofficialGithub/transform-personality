// Mock data for community features
// In production, this would come from a backend API

export interface Post {
  id: string;
  author: string;
  verified: boolean;
  isPremium: boolean;
  timeAgo: string;
  category: string;
  title: string;
  content: string;
  likes: number;
  liked: boolean;
  comments: number;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  memberCount: number;
  postsToday: number;
  isPremium: boolean;
  isMember: boolean;
}

export interface Story {
  id: string;
  author: string;
  timeAgo: string;
  daysClean: number;
  title: string;
  story: string;
  gradient: string[];
  emoji: string;
  likes: number;
  comments: number;
}

export interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
}

export const communityData = {
  posts: [
    {
      id: '1',
      author: 'Anonymous Warrior',
      verified: false,
      isPremium: false,
      timeAgo: '2h ago',
      category: 'Success',
      title: 'Finally hit 30 days! 🎉',
      content: 'I never thought I could make it this far. The first week was brutal, but the community support kept me going. To anyone struggling right now - it gets easier, I promise.',
      likes: 47,
      liked: false,
      comments: 12,
    },
    {
      id: '2',
      author: 'RecoveryChampion',
      verified: true,
      isPremium: true,
      timeAgo: '4h ago',
      category: 'Tips',
      title: 'My top 5 strategies that actually work',
      content: '1. Delete all social media apps 2. Start exercising daily 3. Find an accountability partner 4. Keep a journal 5. Use cold showers when urges hit. These have been game-changers for me.',
      likes: 156,
      liked: true,
      comments: 34,
    },
    {
      id: '3',
      author: 'DailyWarrior',
      verified: false,
      isPremium: false,
      timeAgo: '6h ago',
      category: 'Questions',
      title: 'How do you deal with triggers at night?',
      content: 'I always seem to struggle more in the evening. During the day I\'m fine, but once I\'m alone at night the urges get intense. Any advice?',
      likes: 23,
      liked: false,
      comments: 18,
    },
    {
      id: '4',
      author: 'MindfulJourney',
      verified: true,
      isPremium: true,
      timeAgo: '8h ago',
      category: 'Motivation',
      title: 'Remember why you started',
      content: 'On tough days, I look back at my journal from day 1. Reading about how miserable I was reminds me never to go back. You\'re not just quitting a habit - you\'re reclaiming your life.',
      likes: 89,
      liked: true,
      comments: 15,
    },
    {
      id: '5',
      author: 'NewBeginning2024',
      verified: false,
      isPremium: false,
      timeAgo: '10h ago',
      category: 'Struggles',
      title: 'Relapsed after 45 days... feeling defeated',
      content: 'I thought I had it under control. One moment of weakness and now I\'m back to day 0. Not giving up though. Starting again today.',
      likes: 67,
      liked: false,
      comments: 42,
    },
  ] as Post[],

  groups: [
    {
      id: '1',
      name: '90-Day Challenge',
      description: 'Join others committed to 90 days of freedom',
      emoji: '🎯',
      color: '#6C5CE7',
      memberCount: 1247,
      postsToday: 38,
      isPremium: false,
      isMember: true,
    },
    {
      id: '2',
      name: 'Night Owls Support',
      description: 'For those who struggle most at night',
      emoji: '🦉',
      color: '#FF9800',
      memberCount: 543,
      postsToday: 15,
      isPremium: false,
      isMember: false,
    },
    {
      id: '3',
      name: 'Elite Recovery Circle',
      description: 'Premium group with verified mentors',
      emoji: '👑',
      color: '#FFD700',
      memberCount: 89,
      postsToday: 7,
      isPremium: true,
      isMember: false,
    },
    {
      id: '4',
      name: 'Fitness Warriors',
      description: 'Replace bad habits with healthy ones',
      emoji: '💪',
      color: '#00E676',
      memberCount: 892,
      postsToday: 24,
      isPremium: false,
      isMember: true,
    },
    {
      id: '5',
      name: 'Meditation & Mindfulness',
      description: 'Learn to control your mind through meditation',
      emoji: '🧘',
      color: '#9C27B0',
      memberCount: 654,
      postsToday: 12,
      isPremium: false,
      isMember: false,
    },
    {
      id: '6',
      name: 'Anonymous Accountability',
      description: 'Private group for those who want complete anonymity',
      emoji: '🎭',
      color: '#607D8B',
      memberCount: 234,
      postsToday: 18,
      isPremium: true,
      isMember: false,
    },
  ] as Group[],

  stories: [
    {
      id: '1',
      author: 'FreedomSeeker',
      timeAgo: '1 day ago',
      daysClean: 365,
      title: 'One Year Free: My Complete Journey',
      story: 'A year ago today, I was at rock bottom. Lost my job, almost lost my relationship. Today? I got promoted, my relationship is stronger than ever, and I finally feel like myself again. If you\'re reading this on day 1, just know that future you will thank present you for not giving up.',
      gradient: ['#667EEA', '#764BA2'],
      emoji: '🎊',
      likes: 342,
      comments: 67,
    },
    {
      id: '2',
      author: 'ThePhoenix',
      timeAgo: '2 days ago',
      daysClean: 180,
      title: '6 Months Clean: The Fog is Lifting',
      story: 'For the first time in years, I can think clearly. My energy is back, my confidence has returned, and I\'m finally pursuing my dreams. The first 3 months were hell, but month 4-6? Pure transformation.',
      gradient: ['#FF6B6B', '#FFE66D'],
      emoji: '🔥',
      likes: 189,
      comments: 34,
    },
    {
      id: '3',
      author: 'RisingStrong',
      timeAgo: '3 days ago',
      daysClean: 90,
      title: '90 Days: I Finally Believe in Myself',
      story: 'Three months felt impossible when I started. Now I\'m here and I can\'t believe the person I\'ve become. My family noticed the change, my friends noticed, but most importantly - I noticed. This is just the beginning.',
      gradient: ['#00E676', '#00C853'],
      emoji: '💚',
      likes: 234,
      comments: 45,
    },
    {
      id: '4',
      author: 'NeverGiveUp',
      timeAgo: '5 days ago',
      daysClean: 30,
      title: 'One Month Milestone: Small Wins Matter',
      story: 'They say it takes 21 days to form a habit. Well, I\'m at 30 days of breaking one. Every day gets a little easier. Every urge I overcome makes me stronger. To everyone starting out - you can do this.',
      gradient: ['#667EEA', '#764BA2'],
      emoji: '⭐',
      likes: 156,
      comments: 28,
    },
  ] as Story[],

  chats: [
    {
      id: '1',
      name: 'Alex (Accountability Buddy)',
      lastMessage: 'Hey! How are you holding up today?',
      lastMessageTime: '2m ago',
      unreadCount: 2,
      online: true,
    },
    {
      id: '2',
      name: 'Sarah (Mentor)',
      lastMessage: 'That\'s a great strategy! Keep it up 💪',
      lastMessageTime: '1h ago',
      unreadCount: 0,
      online: true,
    },
    {
      id: '3',
      name: 'Mike (90-Day Challenge)',
      lastMessage: 'Just completed day 45! You?',
      lastMessageTime: '3h ago',
      unreadCount: 1,
      online: false,
    },
    {
      id: '4',
      name: 'Anonymous User',
      lastMessage: 'Thanks for the support yesterday',
      lastMessageTime: '1d ago',
      unreadCount: 0,
      online: false,
    },
    {
      id: '5',
      name: 'Recovery Coach',
      lastMessage: 'Remember: progress, not perfection 🌟',
      lastMessageTime: '2d ago',
      unreadCount: 0,
      online: false,
    },
  ] as Chat[],
};