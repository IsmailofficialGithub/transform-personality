import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🎮 Game Session Tracking
export interface GameSession {
  id: string;
  gameId: string;
  gameName: string;
  startTime: string;
  endTime: string;
  duration: number; // seconds
  score: number;
  completed: boolean;
  timestamp: string;
}

// 📊 Activity Tracking
export interface ActivityLog {
  id: string;
  type: 'screen_view' | 'button_click' | 'feature_use' | 'game_play' | 'urge_log' | 'check_in' | 'achievement_unlock' | 'share' | 'notification_interact';
  screen?: string;
  action?: string;
  metadata?: any;
  timestamp: string;
}

// 📈 Session Tracking
export interface AppSession {
  id: string;
  startTime: string;
  endTime?: string;
  duration?: number; // seconds
  screensVisited: string[];
  actionsPerformed: number;
  gamesPlayed: number;
}

// 🏆 Achievement Tracking
export interface AchievementProgress {
  achievementId: string;
  progress: number;
  maxProgress: number;
  unlockedAt?: string;
  isUnlocked: boolean;
}

// 📸 Selfie Tracking
export interface SelfieRecord {
  id: string;
  imageUri: string;
  timestamp: string;
  daysClean: number;
  notes?: string;
}

// 🎯 Goal Tracking
export interface GoalProgress {
  goalId: string;
  goalName: string;
  targetValue: number;
  currentValue: number;
  startDate: string;
  targetDate: string;
  completed: boolean;
  completedAt?: string;
}

// 📱 App Usage Stats
export interface UsageStats {
  totalSessions: number;
  totalTimeSpent: number; // seconds
  averageSessionLength: number;
  lastActiveDate: string;
  daysActive: number;
  longestStreak: number;
  currentStreak: number;
  featuresUsed: { [key: string]: number };
  gamesPlayed: { [key: string]: number };
  screenViews: { [key: string]: number };
}

interface TrackingStore {
  // Game Sessions
  gameSessions: GameSession[];
  currentGameSession: GameSession | null;
  
  // Activity Logs
  activityLogs: ActivityLog[];
  
  // App Sessions
  appSessions: AppSession[];
  currentAppSession: AppSession | null;
  
  // Achievements
  achievementProgress: { [key: string]: AchievementProgress };
  
  // Selfies
  selfieRecords: SelfieRecord[];
  
  // Goals
  goalProgress: { [key: string]: GoalProgress };
  
  // Usage Stats
  usageStats: UsageStats;
  
  // Actions
  startGameSession: (gameId: string, gameName: string) => string;
  endGameSession: (sessionId: string, score: number, completed: boolean) => void;
  logActivity: (type: ActivityLog['type'], data?: Partial<ActivityLog>) => void;
  startAppSession: () => void;
  endAppSession: () => void;
  trackScreenView: (screenName: string) => void;
  trackButtonClick: (buttonName: string, screen: string) => void;
  trackFeatureUse: (featureName: string) => void;
  updateAchievementProgress: (achievementId: string, progress: number) => void;
  unlockAchievement: (achievementId: string) => void;
  addSelfieRecord: (imageUri: string, daysClean: number, notes?: string) => void;
  updateGoalProgress: (goalId: string, progress: number) => void;
  completeGoal: (goalId: string) => void;
  getGameStats: (gameId: string) => { played: number; avgScore: number; bestScore: number; totalTime: number };
  getUsageStats: () => UsageStats;
  loadTracking: () => Promise<void>;
  saveTracking: () => Promise<void>;
  clearAllTracking: () => Promise<void>;
}

export const useTrackingStore = create<TrackingStore>((set, get) => ({
  gameSessions: [],
  currentGameSession: null,
  activityLogs: [],
  appSessions: [],
  currentAppSession: null,
  achievementProgress: {},
  selfieRecords: [],
  goalProgress: {},
  usageStats: {
    totalSessions: 0,
    totalTimeSpent: 0,
    averageSessionLength: 0,
    lastActiveDate: new Date().toISOString(),
    daysActive: 0,
    longestStreak: 0,
    currentStreak: 0,
    featuresUsed: {},
    gamesPlayed: {},
    screenViews: {},
  },

  // 🎮 Start Game Session
  startGameSession: (gameId: string, gameName: string) => {
    const sessionId = `game_${Date.now()}`;
    const session: GameSession = {
      id: sessionId,
      gameId,
      gameName,
      startTime: new Date().toISOString(),
      endTime: '',
      duration: 0,
      score: 0,
      completed: false,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      currentGameSession: session,
      gameSessions: [...state.gameSessions, session],
    }));

    get().logActivity('game_play', { 
      action: 'game_started',
      metadata: { gameId, gameName },
    });

    get().saveTracking();
    return sessionId;
  },

  // 🎮 End Game Session
  endGameSession: (sessionId: string, score: number, completed: boolean) => {
    const now = new Date().toISOString();
    
    set((state) => {
      const updatedSessions = state.gameSessions.map((session) => {
        if (session.id === sessionId) {
          const duration = Math.floor(
            (new Date(now).getTime() - new Date(session.startTime).getTime()) / 1000
          );
          return {
            ...session,
            endTime: now,
            duration,
            score,
            completed,
          };
        }
        return session;
      });

      return {
        gameSessions: updatedSessions,
        currentGameSession: null,
      };
    });

    get().logActivity('game_play', {
      action: 'game_completed',
      metadata: { sessionId, score, completed },
    });

    get().saveTracking();
  },

  // 📊 Log Activity
  logActivity: (type: ActivityLog['type'], data?: Partial<ActivityLog>) => {
    const activity: ActivityLog = {
      id: `activity_${Date.now()}`,
      type,
      timestamp: new Date().toISOString(),
      ...data,
    };

    set((state) => ({
      activityLogs: [...state.activityLogs, activity],
    }));

    // Don't save immediately for performance - save on app session end
  },

  // 📱 Start App Session
  startAppSession: () => {
    const sessionId = `session_${Date.now()}`;
    const session: AppSession = {
      id: sessionId,
      startTime: new Date().toISOString(),
      screensVisited: ['dashboard'],
      actionsPerformed: 0,
      gamesPlayed: 0,
    };

    set({
      currentAppSession: session,
    });

    get().logActivity('screen_view', { screen: 'dashboard' });
  },

  // 📱 End App Session
  endAppSession: () => {
    const current = get().currentAppSession;
    if (!current) return;

    const now = new Date().toISOString();
    const duration = Math.floor(
      (new Date(now).getTime() - new Date(current.startTime).getTime()) / 1000
    );

    const completedSession: AppSession = {
      ...current,
      endTime: now,
      duration,
    };

    set((state) => {
      const newStats = { ...state.usageStats };
      newStats.totalSessions += 1;
      newStats.totalTimeSpent += duration;
      newStats.averageSessionLength = newStats.totalTimeSpent / newStats.totalSessions;
      newStats.lastActiveDate = now;

      return {
        appSessions: [...state.appSessions, completedSession],
        currentAppSession: null,
        usageStats: newStats,
      };
    });

    get().saveTracking();
  },

  // 👁️ Track Screen View
  trackScreenView: (screenName: string) => {
    const current = get().currentAppSession;
    if (current) {
      set((state) => ({
        currentAppSession: {
          ...current,
          screensVisited: [...current.screensVisited, screenName],
        },
      }));
    }

    set((state) => {
      const newStats = { ...state.usageStats };
      newStats.screenViews[screenName] = (newStats.screenViews[screenName] || 0) + 1;
      return { usageStats: newStats };
    });

    get().logActivity('screen_view', { screen: screenName });
  },

  // 🖱️ Track Button Click
  trackButtonClick: (buttonName: string, screen: string) => {
    const current = get().currentAppSession;
    if (current) {
      set({
        currentAppSession: {
          ...current,
          actionsPerformed: current.actionsPerformed + 1,
        },
      });
    }

    get().logActivity('button_click', {
      action: buttonName,
      screen,
    });
  },

  // 🎯 Track Feature Use
  trackFeatureUse: (featureName: string) => {
    set((state) => {
      const newStats = { ...state.usageStats };
      newStats.featuresUsed[featureName] = (newStats.featuresUsed[featureName] || 0) + 1;
      return { usageStats: newStats };
    });

    get().logActivity('feature_use', {
      action: featureName,
    });
  },

  // 🏆 Update Achievement Progress
  updateAchievementProgress: (achievementId: string, progress: number) => {
    set((state) => {
      const current = state.achievementProgress[achievementId] || {
        achievementId,
        progress: 0,
        maxProgress: 100,
        isUnlocked: false,
      };

      return {
        achievementProgress: {
          ...state.achievementProgress,
          [achievementId]: {
            ...current,
            progress: Math.min(progress, current.maxProgress),
          },
        },
      };
    });

    get().saveTracking();
  },

  // 🏆 Unlock Achievement
  unlockAchievement: (achievementId: string) => {
    set((state) => {
      const current = state.achievementProgress[achievementId];
      if (!current) return state;

      return {
        achievementProgress: {
          ...state.achievementProgress,
          [achievementId]: {
            ...current,
            isUnlocked: true,
            unlockedAt: new Date().toISOString(),
          },
        },
      };
    });

    get().logActivity('achievement_unlock', {
      action: 'achievement_unlocked',
      metadata: { achievementId },
    });

    get().saveTracking();
  },

  // 📸 Add Selfie Record
  addSelfieRecord: (imageUri: string, daysClean: number, notes?: string) => {
    const record: SelfieRecord = {
      id: `selfie_${Date.now()}`,
      imageUri,
      timestamp: new Date().toISOString(),
      daysClean,
      notes,
    };

    set((state) => ({
      selfieRecords: [...state.selfieRecords, record],
    }));

    get().trackFeatureUse('selfie_upload');
    get().saveTracking();
  },

  // 🎯 Update Goal Progress
  updateGoalProgress: (goalId: string, progress: number) => {
    set((state) => {
      const goal = state.goalProgress[goalId];
      if (!goal) return state;

      const completed = progress >= goal.targetValue;

      return {
        goalProgress: {
          ...state.goalProgress,
          [goalId]: {
            ...goal,
            currentValue: progress,
            completed,
            completedAt: completed ? new Date().toISOString() : undefined,
          },
        },
      };
    });

    get().saveTracking();
  },

  // 🎯 Complete Goal
  completeGoal: (goalId: string) => {
    set((state) => {
      const goal = state.goalProgress[goalId];
      if (!goal) return state;

      return {
        goalProgress: {
          ...state.goalProgress,
          [goalId]: {
            ...goal,
            completed: true,
            completedAt: new Date().toISOString(),
          },
        },
      };
    });

    get().logActivity('feature_use', {
      action: 'goal_completed',
      metadata: { goalId },
    });

    get().saveTracking();
  },

  // 📊 Get Game Stats
  getGameStats: (gameId: string) => {
    const sessions = get().gameSessions.filter((s) => s.gameId === gameId && s.completed);
    
    if (sessions.length === 0) {
      return { played: 0, avgScore: 0, bestScore: 0, totalTime: 0 };
    }

    const played = sessions.length;
    const totalScore = sessions.reduce((sum, s) => sum + s.score, 0);
    const avgScore = totalScore / played;
    const bestScore = Math.max(...sessions.map((s) => s.score));
    const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);

    return { played, avgScore, bestScore, totalTime };
  },

  // 📈 Get Usage Stats
  getUsageStats: () => {
    return get().usageStats;
  },

  // 💾 Load Tracking Data
  loadTracking: async () => {
    try {
      const [
        gameSessions,
        activityLogs,
        appSessions,
        achievementProgress,
        selfieRecords,
        goalProgress,
        usageStats,
      ] = await Promise.all([
        AsyncStorage.getItem('tracking_gameSessions'),
        AsyncStorage.getItem('tracking_activityLogs'),
        AsyncStorage.getItem('tracking_appSessions'),
        AsyncStorage.getItem('tracking_achievementProgress'),
        AsyncStorage.getItem('tracking_selfieRecords'),
        AsyncStorage.getItem('tracking_goalProgress'),
        AsyncStorage.getItem('tracking_usageStats'),
      ]);

      set({
        gameSessions: gameSessions ? JSON.parse(gameSessions) : [],
        activityLogs: activityLogs ? JSON.parse(activityLogs) : [],
        appSessions: appSessions ? JSON.parse(appSessions) : [],
        achievementProgress: achievementProgress ? JSON.parse(achievementProgress) : {},
        selfieRecords: selfieRecords ? JSON.parse(selfieRecords) : [],
        goalProgress: goalProgress ? JSON.parse(goalProgress) : {},
        usageStats: usageStats ? JSON.parse(usageStats) : get().usageStats,
      });

      console.log('✅ Tracking data loaded');
    } catch (error) {
      console.error('Error loading tracking data:', error);
    }
  },

  // 💾 Save Tracking Data
  saveTracking: async () => {
    try {
      const state = get();
      await Promise.all([
        AsyncStorage.setItem('tracking_gameSessions', JSON.stringify(state.gameSessions)),
        AsyncStorage.setItem('tracking_activityLogs', JSON.stringify(state.activityLogs)),
        AsyncStorage.setItem('tracking_appSessions', JSON.stringify(state.appSessions)),
        AsyncStorage.setItem('tracking_achievementProgress', JSON.stringify(state.achievementProgress)),
        AsyncStorage.setItem('tracking_selfieRecords', JSON.stringify(state.selfieRecords)),
        AsyncStorage.setItem('tracking_goalProgress', JSON.stringify(state.goalProgress)),
        AsyncStorage.setItem('tracking_usageStats', JSON.stringify(state.usageStats)),
      ]);
    } catch (error) {
      console.error('Error saving tracking data:', error);
    }
  },

  // 🗑️ Clear All Tracking
  clearAllTracking: async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('tracking_gameSessions'),
        AsyncStorage.removeItem('tracking_activityLogs'),
        AsyncStorage.removeItem('tracking_appSessions'),
        AsyncStorage.removeItem('tracking_achievementProgress'),
        AsyncStorage.removeItem('tracking_selfieRecords'),
        AsyncStorage.removeItem('tracking_goalProgress'),
        AsyncStorage.removeItem('tracking_usageStats'),
      ]);

      set({
        gameSessions: [],
        currentGameSession: null,
        activityLogs: [],
        appSessions: [],
        currentAppSession: null,
        achievementProgress: {},
        selfieRecords: [],
        goalProgress: {},
        usageStats: {
          totalSessions: 0,
          totalTimeSpent: 0,
          averageSessionLength: 0,
          lastActiveDate: new Date().toISOString(),
          daysActive: 0,
          longestStreak: 0,
          currentStreak: 0,
          featuresUsed: {},
          gamesPlayed: {},
          screenViews: {},
        },
      });

      console.log('✅ All tracking data cleared');
    } catch (error) {
      console.error('Error clearing tracking data:', error);
    }
  },
}));