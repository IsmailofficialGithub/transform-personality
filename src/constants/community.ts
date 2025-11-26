/**
 * Community Data Types & Utilities
 * This file provides type definitions and helper functions for community data
 * All data comes from Supabase in real-time
 */

// Re-export types from CommunityService for convenience
export type {
  UserProfile,
  CommunityPost,
  PostComment,
  SuccessStory,
} from '../services/CommunityService';

// Category configuration
export const POST_CATEGORIES = [
  { id: 'success', label: 'Success', emoji: '🎉', icon: 'PartyPopper', color: '#4CAF50' },
  { id: 'support', label: 'Support', emoji: '💪', icon: 'HeartHandshake', color: '#2196F3' },
  { id: 'question', label: 'Question', emoji: '❓', icon: 'HelpCircle', color: '#FF9800' },
  { id: 'motivation', label: 'Motivation', emoji: '🔥', icon: 'Flame', color: '#F44336' },
  { id: 'general', label: 'General', emoji: '💬', icon: 'MessageCircle', color: '#9C27B0' },
] as const;

// Report reasons
export const REPORT_REASONS = [
  { id: 'spam', label: 'Spam', description: 'Repetitive or unwanted content' },
  { id: 'harassment', label: 'Harassment', description: 'Bullying or targeting individuals' },
  { id: 'inappropriate', label: 'Inappropriate Content', description: 'Offensive or explicit content' },
  { id: 'misinformation', label: 'Misinformation', description: 'False or misleading information' },
  { id: 'other', label: 'Other', description: 'Other violation not listed above' },
] as const;

// Community guidelines
export const COMMUNITY_GUIDELINES = [
  {
    title: 'Be Respectful',
    description: 'Treat all members with kindness and respect. We\'re all on a journey together.',
    emoji: '🤝',
    icon: 'Handshake',
  },
  {
    title: 'Stay Anonymous',
    description: 'Protect your privacy and that of others. Don\'t share personal identifying information.',
    emoji: '🔒',
    icon: 'Lock',
  },
  {
    title: 'Be Supportive',
    description: 'Offer encouragement and constructive feedback. Avoid judgment.',
    emoji: '💝',
    icon: 'Heart',
  },
  {
    title: 'No Triggers',
    description: 'Avoid sharing explicit content or triggers that might harm others\' recovery.',
    emoji: '⚠️',
    icon: 'AlertTriangle',
  },
  {
    title: 'Stay Safe',
    description: 'Report any concerning content. If you\'re in crisis, seek professional help immediately.',
    emoji: '🆘',
    icon: 'ShieldAlert',
  },
];

// Badge system
export const COMMUNITY_BADGES = [
  { id: 'first_post', name: 'First Post', emoji: '📝', icon: 'PenTool', description: 'Created your first post' },
  { id: 'helpful', name: 'Helpful', emoji: '🌟', icon: 'Star', description: 'Received 50+ likes on comments' },
  { id: 'supporter', name: 'Supporter', emoji: '💪', icon: 'ThumbsUp', description: 'Commented on 20+ posts' },
  { id: 'storyteller', name: 'Storyteller', emoji: '📖', icon: 'BookOpen', description: 'Shared your success story' },
  { id: 'mentor', name: 'Mentor', emoji: '🎓', icon: 'GraduationCap', description: 'Helped 10+ members' },
  { id: 'streak_30', name: '30 Day Warrior', emoji: '🔥', icon: 'Flame', description: '30 days clean' },
  { id: 'streak_90', name: '90 Day Champion', emoji: '🏆', icon: 'Trophy', description: '90 days clean' },
  { id: 'streak_365', name: 'Year Legend', emoji: '👑', icon: 'Crown', description: '365 days clean' },
];

// Level system configuration
export const LEVEL_CONFIG = {
  xpPerLevel: 100,
  maxLevel: 50,
  xpRewards: {
    createPost: 10,
    receiveComment: 2,
    receiveLike: 1,
    createComment: 5,
    dailyLogin: 5,
    shareStory: 25,
    achieveMilestone: 50,
  },
};

// Helper function to get category info
export const getCategoryInfo = (categoryId: string) => {
  return POST_CATEGORIES.find(c => c.id === categoryId) || POST_CATEGORIES[4]; // Default to general
};

// Helper function to format user level
export const formatUserLevel = (level: number) => {
  if (level < 5) return { title: 'Beginner', color: '#9E9E9E' };
  if (level < 10) return { title: 'Apprentice', color: '#4CAF50' };
  if (level < 20) return { title: 'Warrior', color: '#2196F3' };
  if (level < 30) return { title: 'Champion', color: '#FF9800' };
  if (level < 40) return { title: 'Master', color: '#9C27B0' };
  return { title: 'Legend', color: '#FFD700' };
};

// Helper function to calculate level from XP
export const calculateLevel = (xp: number): number => {
  return Math.floor(xp / LEVEL_CONFIG.xpPerLevel);
};

// Helper function to calculate XP for next level
export const xpForNextLevel = (currentXp: number): number => {
  const currentLevel = calculateLevel(currentXp);
  return (currentLevel + 1) * LEVEL_CONFIG.xpPerLevel;
};

// Helper function to calculate XP progress percentage
export const xpProgressPercentage = (currentXp: number): number => {
  const currentLevel = calculateLevel(currentXp);
  const xpInCurrentLevel = currentXp - (currentLevel * LEVEL_CONFIG.xpPerLevel);
  const xpNeededForLevel = LEVEL_CONFIG.xpPerLevel;
  return (xpInCurrentLevel / xpNeededForLevel) * 100;
};

// Helper function to format time ago
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  return `${Math.floor(seconds / 2592000)}mo ago`;
};

// Helper function to format numbers (1.2k, 1.2M, etc.)
export const formatNumber = (num: number): string => {
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}k`;
  return `${(num / 1000000).toFixed(1)}M`;
};

// Validation helpers
export const validatePostTitle = (title: string): { valid: boolean; error?: string } => {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: 'Title is required' };
  }
  if (title.length < 3) {
    return { valid: false, error: 'Title must be at least 3 characters' };
  }
  if (title.length > 200) {
    return { valid: false, error: 'Title must be less than 200 characters' };
  }
  return { valid: true };
};

export const validatePostContent = (content: string): { valid: boolean; error?: string } => {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'Content is required' };
  }
  if (content.length < 10) {
    return { valid: false, error: 'Content must be at least 10 characters' };
  }
  if (content.length > 5000) {
    return { valid: false, error: 'Content must be less than 5000 characters' };
  }
  return { valid: true };
};

export const validateUsername = (username: string): { valid: boolean; error?: string } => {
  if (!username || username.trim().length === 0) {
    return { valid: false, error: 'Username is required' };
  }
  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }
  if (username.length > 30) {
    return { valid: false, error: 'Username must be less than 30 characters' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  return { valid: true };
};

// Content moderation helpers
export const containsTriggers = (text: string): boolean => {
  // List of trigger words/phrases that should be avoided
  const triggers = [
    // Add appropriate trigger words based on your app's context
    // Keep this list private and secure
  ];

  const lowerText = text.toLowerCase();
  return triggers.some(trigger => lowerText.includes(trigger.toLowerCase()));
};

export const sanitizeContent = (content: string): string => {
  // Remove potentially harmful content
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .trim();
};

// Engagement thresholds for notifications
export const ENGAGEMENT_THRESHOLDS = {
  viral: 100, // Post gets 100+ likes
  popular: 50, // Post gets 50+ likes
  trending: 20, // Post gets 20+ comments in 24h
};

// Milestone days for success stories
export const MILESTONE_DAYS = [7, 14, 30, 60, 90, 180, 365, 730, 1095];

// Check if a day count is a milestone
export const isMilestone = (days: number): boolean => {
  return MILESTONE_DAYS.includes(days);
};

// Get next milestone
export const getNextMilestone = (currentDays: number): number | null => {
  const next = MILESTONE_DAYS.find(m => m > currentDays);
  return next || null;
};

// Get milestone info
export const getMilestoneInfo = (days: number) => {
  if (days >= 1095) return { emoji: '👑', icon: 'Crown', color: '#FFD700', title: '3 Year Legend' };
  if (days >= 730) return { emoji: '💎', icon: 'Gem', color: '#E91E63', title: '2 Year Champion' };
  if (days >= 365) return { emoji: '🏆', icon: 'Trophy', color: '#9C27B0', title: '1 Year Warrior' };
  if (days >= 180) return { emoji: '⭐', icon: 'Award', color: '#FF9800', title: '6 Month Hero' };
  if (days >= 90) return { emoji: '🔥', icon: 'Flame', color: '#F44336', title: '90 Day Victor' };
  if (days >= 60) return { emoji: '💪', icon: 'Dumbbell', color: '#2196F3', title: '60 Day Fighter' };
  if (days >= 30) return { emoji: '🌟', icon: 'Star', color: '#4CAF50', title: '30 Day Achiever' };
  if (days >= 14) return { emoji: '✨', icon: 'Sparkles', color: '#00BCD4', title: '2 Week Starter' };
  if (days >= 7) return { emoji: '🎯', icon: 'Target', color: '#607D8B', title: '1 Week Beginner' };
  return { emoji: '🌱', icon: 'Sprout', color: '#8BC34A', title: 'Fresh Start' };
};