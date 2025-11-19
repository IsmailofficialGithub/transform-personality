# Folder Structure Reorganization Plan

## Current Issues:
1. Duplicate files (supabase.ts in config and services)
2. Data folder contains screen components (CommunityHub.tsx)
3. Root-level screens not organized
4. Duplicate components (ProgressRing.tsx)
5. Theme folder only has one file

## New Structure:

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common/shared components
│   │   ├── Button.tsx
│   │   └── Card.tsx
│   ├── habit/          # Habit-related components
│   │   └── HabitCard.tsx
│   ├── gamification/   # Gamification components
│   │   ├── AchievementBadge.tsx
│   │   ├── ConfettiCelebration.tsx
│   │   ├── GamificationProvider.tsx
│   │   ├── ProgressRing.tsx
│   │   └── index.ts
│   ├── premium/        # Premium-related components
│   │   ├── PremiumBadge.tsx
│   │   ├── PremiumLockedScreen.tsx
│   │   └── PremiumTestPanel.tsx
│   └── ErrorBoundary.tsx
│
├── config/             # App configuration
│   ├── app.config.ts
│   └── supabase.ts     # Supabase client (single source)
│
├── constants/          # Constants and static data
│   ├── habits.ts       # Habit-related constants
│   ├── community.ts    # Community-related constants
│   └── index.ts        # Re-exports
│
├── hooks/              # Custom React hooks
│   ├── useAnimatedValue.ts
│   ├── useKeyboard.ts
│   ├── useNotifications.ts
│   └── usePremium.ts
│
├── navigation/         # Navigation setup
│   ├── AppNavigator.tsx
│   └── BottomNavigation.tsx
│
├── screens/            # All screen components
│   ├── auth/           # Authentication screens
│   │   ├── AuthNavigator.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   └── ForgotPasswordScreen.tsx
│   ├── dashboard/      # Dashboard screens
│   │   └── DashboardScreen.tsx
│   ├── habits/         # Habit tracking screens
│   │   └── LogUrgeScreen.tsx
│   ├── community/      # Community features
│   │   ├── CommunityFeedScreen.tsx
│   │   ├── CommunityHub.tsx
│   │   ├── CommunitySettingsScreen.tsx
│   │   ├── CreatePostScreen.tsx
│   │   ├── GroupChallenges.tsx
│   │   ├── MyCommunityPost.tsx
│   │   ├── PostDetailScreen.tsx
│   │   ├── SuccessStoriesScreen.tsx
│   │   ├── UserProfileScreen.tsx
│   │   └── CommunityTestScreen.tsx
│   ├── games/          # Game screens
│   │   ├── GamesHubScreen.tsx
│   │   ├── MemoryMatchGame.tsx
│   │   ├── BreathPacerGame.tsx
│   │   ├── ReactionTimeGame.tsx
│   │   ├── UrgeFighterGame.tsx
│   │   ├── FocusMasterGame.tsx
│   │   ├── ZenGardenGame.tsx
│   │   ├── PatternMasterGame.tsx
│   │   └── GamePlayScreen.tsx
│   ├── analytics/     # Analytics & statistics
│   │   ├── StatisticsScreen.tsx
│   │   ├── AdvancedAnalyticsScreen.tsx
│   │   ├── DeepInsights.tsx
│   │   └── TrackingDashboard.tsx
│   ├── gamification/   # Gamification screens
│   │   ├── AchievementsScreen.tsx
│   │   ├── ChallengesScreen.tsx
│   │   ├── LeaderboardScreen.tsx
│   │   ├── LevelsScreen.tsx
│   │   └── RewardsShop.tsx
│   ├── progress/       # Progress tracking
│   │   ├── ProgressHubScreen.tsx
│   │   ├── AIAnalysisScreen.tsx
│   │   ├── ExercisesScreen.tsx
│   │   └── SelfieProgressScreen.tsx
│   ├── ai/             # AI features
│   │   ├── AIPhotoAnalysisScreen.tsx
│   │   └── TransformationPredictionScreen.tsx
│   ├── profile/        # Profile screens
│   │   └── ProfileScreen.tsx
│   ├── tools/          # Utility/tool screens
│   │   └── PanicButtonScreen.tsx
│   ├── onboarding/     # Onboarding flow
│   │   ├── OnboardingController.tsx
│   │   ├── WelcomeScreen.tsx
│   │   ├── HabitSelectionModal.tsx
│   │   ├── HabitSelectionScreen.tsx
│   │   ├── PersonalityQuizScreen.tsx
│   │   └── QuizResultsScreen.tsx
│   └── [other feature folders...]
│
├── services/           # Business logic & API services
│   ├── CommunityService.ts
│   ├── AIAnalysisService.ts
│   ├── AIPhotoAnalysisService.ts
│   ├── AIService.ts
│   ├── AnalyticsService.ts
│   ├── NotificationService.ts
│   ├── PaymentService.ts
│   ├── ScreenTimeService.ts
│   ├── SocialSharingService.ts
│   └── StorageService.ts
│
├── store/              # State management (Zustand)
│   ├── authStore.ts
│   ├── communityStore.ts
│   ├── habitStore.ts
│   ├── themeStore.ts
│   └── trackingStore.ts
│
├── types/              # TypeScript type definitions
│   ├── habit.types.ts
│   └── index.ts
│
└── utils/              # Utility functions
    ├── theme.ts        # Theme utilities (includes colors)
    ├── constants.ts   # General constants
    ├── exercises.ts
    └── games.ts
```

## Migration Steps:
1. Remove duplicate files
2. Move files to new locations
3. Update all import paths
4. Test to ensure nothing breaks

