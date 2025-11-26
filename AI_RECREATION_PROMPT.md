# Complete AI Prompt to Recreate Transform App

## 🎯 APP OVERVIEW

Create a **React Native mobile app** called "Transform App" - a comprehensive addiction recovery and habit-breaking application. The app helps users overcome addictive behaviors (pornography, smoking, alcohol, gaming, social media, junk food, gambling, shopping, procrastination) through tracking, community support, gamification, and wellness tools.

**Core Purpose**: Help users break free from addictive behaviors through daily tracking, accountability, community support, distraction games, progress visualization, and AI-powered insights.

---

## 🛠 TECHNOLOGY STACK

### Core Framework
- **React Native**: 0.81.5
- **Expo**: ^54.0.23 (with Expo Dev Client)
- **TypeScript**: ~5.9.2
- **React**: 19.1.0

### State Management
- **Zustand**: ^5.0.8 (with AsyncStorage persistence)

### Backend & Database
- **Supabase**: ^2.81.1
  - PostgreSQL database
  - Authentication (email/password)
  - Storage (for images)
  - Row Level Security (RLS) enabled

### UI Libraries
- **expo-linear-gradient**: ~15.0.7 (for gradient backgrounds)
- **react-native-root-toast**: ^4.0.1 (for toast notifications)
- **expo-image-picker**: ~17.0.8 (for image selection)
- **lucide-react-native**: ^0.553.0 (for icons)
- **@expo/vector-icons**: ^15.0.3 (additional icons)

### Navigation
- **Custom Navigation**: Built-in AppNavigator (no React Navigation)
- Uses state-based screen switching with animated transitions

### Animations
- **react-native-reanimated**: ^4.1.5
- **react-native-animatable**: ^1.4.0

### Utilities
- **date-fns**: ^4.1.0 (date formatting)
- **uuid**: ^13.0.0 (ID generation)
- **@react-native-async-storage/async-storage**: ^2.2.0 (local storage)

---

## 📱 CORE FEATURES

### 1. Authentication System
- Email/password signup and login
- Password reset functionality
- Session persistence with Zustand
- Toast notifications for all auth actions
- Onboarding flow for new users

### 2. Habit Management
- Add/remove multiple habits
- Track current streak and longest streak
- Calculate days clean from quit date
- Log urges with:
  - Intensity (1-10 scale)
  - Trigger (what caused the urge)
  - Notes (additional context)
  - Overcome status (did user resist?)
- Local storage + Supabase sync
- Offline support

### 3. Community Features
- **Post Creation**:
  - Title (3-200 characters)
  - Content (min 10 characters)
  - Category selection (success, support, question, motivation, general)
  - Multiple image uploads (up to 5 images)
  - Image upload to Supabase Storage
- **Post Feed**:
  - Infinite scroll with pagination
  - Category filtering
  - Like/unlike posts (with duplicate prevention)
  - View post details
  - Post deletion (soft delete)
- **Comments**:
  - Add comments to posts
  - Like/unlike comments
  - View comment counts
- **User Profiles**:
  - Public/private profiles
  - Display name, bio, avatar
  - Show/hide streaks and success stories
  - View user's posts
- **Success Stories**:
  - Before/after images
  - Story sharing
  - Featured stories
- **Community Settings**:
  - Privacy controls
  - Notification preferences

### 4. Dashboard
- Modern, production-ready UI with gradients
- Stats cards showing:
  - Total habits count
  - Total days clean
  - Best streak
- Quick action buttons:
  - Log Urge
  - Games
  - Community
  - Progress
- Motivational quotes (randomized)
- Habit cards with gradient backgrounds
- Notification icon with badge

### 5. Games (7 Total - All Free)
- **Memory Match**: Card matching game
- **Breath Pacer**: Breathing exercise game
- **Reaction Time**: Reaction speed test
- **Urge Fighter**: Combat-style urge distraction
- **Focus Master**: Focus training game
- **Zen Garden**: Relaxation game
- **Pattern Master**: Pattern recognition game
- Game session tracking
- All games accessible without premium

### 6. Progress Tracking
- **AI Analysis**: AI-powered progress insights
- **Exercise Recommendations**: Suggested exercises
- **Photo Tracking**: Before/after photo comparison
- **Analytics Dashboard**: Charts and statistics
- **Transformation Prediction**: AI prediction of future progress

### 7. Wellness Tools
- **Panic Button**: Emergency support with breathing exercises
- **Mood Tracker**: Track daily mood
- **Meditation**: Guided meditation sessions
- **Breathing Exercises**: Various breathing techniques

### 8. Gamification
- **Achievements**: Unlock achievements for milestones
- **Levels**: XP-based leveling system
- **Challenges**: Community challenges
- **Leaderboard**: Rankings and competition
- **Rewards Shop**: Virtual rewards (all free)

### 9. Analytics & Insights
- **Statistics Screen**: Visual charts and graphs
- **Advanced Analytics**: Detailed progress analysis
- **Deep Insights**: AI-generated insights
- **Tracking Dashboard**: Comprehensive tracking view

### 10. Additional Features
- **Screen Time Tracking**: Monitor app usage
- **Notifications**: Motivational messages and reminders
- **Social Sharing**: Share progress externally
- **Emergency Resources**: Professional help resources
- **Learning Hub**: Educational content
- **Video Library**: Instructional videos
- **Guided Programs**: Step-by-step programs

---

## 🗄 DATABASE SCHEMA (Supabase PostgreSQL)

### Core Tables

#### `habits`
```sql
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- type (text) - habit type
- custom_name (text, nullable)
- quit_date (timestamp)
- current_streak (integer)
- longest_streak (integer)
- total_relapses (integer)
- severity (text) - 'mild' | 'moderate' | 'severe'
- created_at (timestamp)
- updated_at (timestamp)
```

#### `urges`
```sql
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- habit_id (uuid, FK → habits)
- timestamp (timestamp)
- intensity (integer) - 1-10
- trigger (text)
- notes (text)
- overcome (boolean)
- created_at (timestamp)
```

#### `achievements`
```sql
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- habit_id (uuid, FK → habits, nullable)
- achievement_type (text)
- unlocked_at (timestamp)
```

### Community Tables

#### `user_profiles`
```sql
- id (uuid, PK)
- user_id (uuid, FK → auth.users, unique)
- username (text, unique, 3-30 chars)
- display_name (text, nullable)
- bio (text, nullable)
- avatar_url (text, nullable)
- is_profile_public (boolean)
- show_streak (boolean)
- show_before_after (boolean)
- show_success_stories (boolean)
- total_days_clean (integer)
- current_streak (integer)
- longest_streak (integer)
- total_posts (integer)
- total_likes_received (integer)
- level (integer)
- xp (integer)
- badges (jsonb)
- joined_at (timestamp)
- last_active (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `community_posts`
```sql
- id (uuid, PK)
- author_id (uuid, FK → user_profiles)
- title (text, 3-200 chars)
- content (text, min 10 chars)
- category (text) - 'success' | 'support' | 'question' | 'motivation' | 'general'
- images (text[], nullable)
- likes_count (integer, default 0)
- comments_count (integer, default 0)
- views_count (integer, default 0)
- is_pinned (boolean, default false)
- is_reported (boolean, default false)
- is_deleted (boolean, default false)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `post_likes`
```sql
- id (uuid, PK)
- post_id (uuid, FK → community_posts)
- user_id (uuid, FK → user_profiles)
- created_at (timestamp)
- UNIQUE(post_id, user_id) - prevents duplicate likes
```

#### `post_comments`
```sql
- id (uuid, PK)
- post_id (uuid, FK → community_posts)
- author_id (uuid, FK → user_profiles)
- content (text, min 1 char)
- likes_count (integer, default 0)
- is_deleted (boolean, default false)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `comment_likes`
```sql
- id (uuid, PK)
- comment_id (uuid, FK → post_comments)
- user_id (uuid, FK → user_profiles)
- created_at (timestamp)
```

#### `success_stories`
```sql
- id (uuid, PK)
- author_id (uuid, FK → user_profiles)
- title (text)
- story (text)
- days_clean (integer)
- before_image_url (text, nullable)
- after_image_url (text, nullable)
- additional_images (text[], nullable)
- likes_count (integer, default 0)
- views_count (integer, default 0)
- is_featured (boolean, default false)
- is_verified (boolean, default false)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `user_notifications`
```sql
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- type (text) - 'like' | 'comment' | 'follow' | 'mention' | 'achievement' | 'system'
- title (text)
- message (text)
- related_user_id (uuid, nullable, FK → user_profiles)
- related_post_id (uuid, nullable, FK → community_posts)
- related_comment_id (uuid, nullable, FK → post_comments)
- is_read (boolean, default false)
- created_at (timestamp)
```

#### `content_reports`
```sql
- id (uuid, PK)
- reporter_id (uuid, FK → user_profiles)
- content_type (text) - 'post' | 'comment' | 'user'
- content_id (uuid)
- reason (text) - 'spam' | 'harassment' | 'inappropriate' | 'misinformation' | 'other'
- description (text, nullable)
- status (text) - 'pending' | 'reviewed' | 'resolved' | 'dismissed'
- created_at (timestamp)
- reviewed_at (timestamp, nullable)
- reviewed_by (uuid, nullable, FK → user_profiles)
```

### Database Relationships
- `user_profiles.user_id` → `auth.users.id` (one-to-one)
- `habits.user_id` → `auth.users.id` (many-to-one)
- `urges.habit_id` → `habits.id` (many-to-one)
- `community_posts.author_id` → `user_profiles.id` (many-to-one)
- `post_comments.post_id` → `community_posts.id` (many-to-one)
- `post_comments.author_id` → `user_profiles.id` (many-to-one)
- `post_likes.post_id` → `community_posts.id` (many-to-one)
- `post_likes.user_id` → `user_profiles.id` (many-to-one)

**Important**: Enable Row Level Security (RLS) on all tables. Users should only access their own data or public data.

---

## 📁 PROJECT STRUCTURE

```
transform-app/
├── App.tsx                          # Main entry, handles auth/onboarding/app state
├── index.ts                         # Expo entry point
├── package.json
├── tsconfig.json                    # TypeScript with path aliases
├── babel.config.js                  # Babel with module resolver
├── app.json                         # Expo configuration
│
├── src/
│   ├── config/
│   │   └── supabase.ts             # Supabase client & Database types
│   │
│   ├── navigation/
│   │   ├── AppNavigator.tsx        # Main navigation (state-based, no React Navigation)
│   │   └── BottomNavigation.tsx    # Bottom tab bar
│   │
│   ├── screens/
│   │   ├── auth/                    # Authentication
│   │   │   ├── AuthNavigator.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SignupScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   │
│   │   ├── onboarding/             # Onboarding flow
│   │   │   ├── OnboardingController.tsx
│   │   │   ├── WelcomeScreen.tsx
│   │   │   ├── HabitSelectionScreen.tsx
│   │   │   ├── HabitSelectionModal.tsx
│   │   │   ├── PersonalityQuizScreen.tsx
│   │   │   └── QuizResultsScreen.tsx
│   │   │
│   │   ├── dashboard/              # Main dashboard
│   │   │   └── DashboardScreen.tsx
│   │   │
│   │   ├── habits/                 # Habit tracking
│   │   │   └── LogUrgeScreen.tsx
│   │   │
│   │   ├── community/              # Community features
│   │   │   ├── CommunityHub.tsx
│   │   │   ├── CommunityFeedScreen.tsx
│   │   │   ├── CreatePostScreen.tsx
│   │   │   ├── PostDetailScreen.tsx
│   │   │   ├── MyCommunityPost.tsx
│   │   │   ├── UserProfileScreen.tsx
│   │   │   ├── SuccessStoriesScreen.tsx
│   │   │   └── CommunitySettingsScreen.tsx
│   │   │
│   │   ├── games/                  # Games
│   │   │   ├── GamesHubScreen.tsx
│   │   │   ├── MemoryMatchGame.tsx
│   │   │   ├── BreathPacerGame.tsx
│   │   │   ├── ReactionTimeGame.tsx
│   │   │   ├── UrgeFighterGame.tsx
│   │   │   ├── FocusMasterGame.tsx
│   │   │   ├── ZenGardenGame.tsx
│   │   │   └── PatternMasterGame.tsx
│   │   │
│   │   ├── progress/               # Progress tracking
│   │   │   ├── ProgressHubScreen.tsx
│   │   │   ├── AIAnalysisScreen.tsx
│   │   │   ├── ExercisesScreen.tsx
│   │   │   └── SelfieProgressScreen.tsx
│   │   │
│   │   ├── analytics/              # Analytics
│   │   │   ├── StatisticsScreen.tsx
│   │   │   ├── AdvancedAnalyticsScreen.tsx
│   │   │   └── TrackingDashboard.tsx
│   │   │
│   │   ├── gamification/           # Gamification
│   │   │   ├── AchievementsScreen.tsx
│   │   │   ├── LevelsScreen.tsx
│   │   │   ├── ChallengesScreen.tsx
│   │   │   ├── LeaderboardScreen.tsx
│   │   │   └── RewardsShop.tsx
│   │   │
│   │   ├── tools/                 # Wellness tools
│   │   │   └── PanicButtonScreen.tsx
│   │   │
│   │   ├── profile/               # Profile
│   │   │   └── ProfileScreen.tsx
│   │   │
│   │   └── [other feature folders...]
│   │
│   ├── store/                     # Zustand state management
│   │   ├── authStore.ts           # Authentication state
│   │   ├── habitStore.ts          # Habits & urges
│   │   ├── communityStore.ts     # Community posts/comments
│   │   ├── themeStore.ts         # Theme (dark/light mode)
│   │   └── trackingStore.ts       # Tracking data
│   │
│   ├── services/                  # Business logic & API
│   │   ├── CommunityService.ts   # Community API calls
│   │   ├── AIAnalysisService.ts  # AI analysis
│   │   ├── NotificationService.ts # Notifications
│   │   └── [other services...]
│   │
│   ├── components/                # Reusable components
│   │   └── [shared components...]
│   │
│   ├── constants/                 # Constants
│   │   ├── community.ts          # POST_CATEGORIES, validation
│   │   └── habits.ts             # Habit constants
│   │
│   ├── hooks/                     # Custom hooks
│   │   └── usePremium.ts         # Premium check (always returns true)
│   │
│   ├── types/                     # TypeScript types
│   │   └── [type definitions...]
│   │
│   └── utils/                     # Utilities
│       ├── theme.ts               # SIZES, COLORS, FONTS, SHADOWS
│       └── constants.ts          # General constants
```

---

## 🎨 UI/UX REQUIREMENTS

### Design Principles
- **Modern & Clean**: Glassmorphic UI elements, gradients, smooth animations
- **Dark Mode Support**: Full dark/light theme support
- **Responsive**: Works on all screen sizes
- **Accessible**: Proper contrast, touch targets, readable fonts

### Color Scheme
- **Primary**: Purple gradient (#6C5CE7 to #A29BFE)
- **Success**: Green (#4CAF50)
- **Error**: Red (#FF5252)
- **Background**: Dark (#000000) or Light (#F5F5F5)
- **Surface**: Dark (#1E1E1E) or Light (#FFFFFF)
- **Text**: White (#FFFFFF) or Black (#000000)
- **Text Secondary**: Gray (#B0B0B0)

### Typography
- **Headers**: Bold, 24-28px
- **Body**: Regular, 14-16px
- **Small**: 12px
- **Tiny**: 10px

### Components Style
- **Cards**: Rounded corners (16-20px), gradient backgrounds, shadows
- **Buttons**: Rounded (12-20px), gradient or solid, with haptic feedback
- **Inputs**: Rounded, bordered, with placeholder text
- **Icons**: Lucide React Native icons, consistent sizing

### Animations
- **Screen Transitions**: Fade in/out (200-300ms)
- **Button Press**: Scale down (0.95) with haptic feedback
- **List Items**: Smooth scroll, pull-to-refresh
- **Loading**: Activity indicators with brand colors

### Toast Notifications
- Use `react-native-root-toast` for all user feedback
- Success: Green background
- Error: Red background
- Info: Blue background
- Duration: SHORT (2s) or LONG (3.5s)
- Position: TOP or BOTTOM

---

## 🔄 STATE MANAGEMENT (Zustand)

### Auth Store (`authStore.ts`)
```typescript
- user: User | null
- session: Session | null
- loading: boolean
- signIn: (email, password) => Promise<void>
- signUp: (email, password) => Promise<void>
- signOut: () => Promise<void>
- resetPassword: (email) => Promise<void>
- Persist to AsyncStorage
```

### Habit Store (`habitStore.ts`)
```typescript
- habits: Habit[]
- urgeLogs: UrgeLog[]
- addHabit: (habit) => void
- updateHabit: (id, updates) => void
- deleteHabit: (id) => void
- logUrge: (urge) => void
- loadHabits: () => Promise<void>
- saveHabits: () => Promise<void>
- Persist to AsyncStorage + Supabase
```

### Community Store (`communityStore.ts`)
```typescript
- posts: CommunityPost[]
- loading: boolean
- loadFeed: (page, category) => Promise<void>
- refreshFeed: () => Promise<void>
- createPost: (postData) => Promise<CommunityPost>
- likePost: (postId) => Promise<void>
- deletePost: (postId) => Promise<void>
- selectedPostId: string | null
- setSelectedPostId: (id) => void
```

### Theme Store (`themeStore.ts`)
```typescript
- isDark: boolean
- colors: ColorScheme
- toggleTheme: () => void
- Persist to AsyncStorage
```

---

## 🧭 NAVIGATION STRUCTURE

### AppNavigator (State-Based)
- Uses `currentScreen` state to switch screens
- Animated transitions with `react-native-reanimated`
- No React Navigation library
- Back button logic for sub-screens
- Bottom navigation for main screens

### Screen Types
```typescript
type Screen = 
  | "dashboard"
  | "community" | "communityFeed"
  | "createPost" | "postDetail"
  | "myCommunityPost"
  | "games" | "memory-match" | "breath-pacer" | ...
  | "stats" | "achievements"
  | "profile"
  | "logUrge"
  | "panic"
  | [50+ other screens]
```

### Navigation Flow
1. **Auth Flow**: Login → Onboarding → Main App
2. **Main App**: Dashboard (default) with Bottom Navigation
3. **Sub-screens**: Full-screen overlays with back buttons
4. **Community**: Feed → Post Detail → Comments
5. **Games**: Hub → Individual Game → Results

### Bottom Navigation
Always visible on main screens:
- Home (dashboard)
- Community (communityFeed)
- Stats (stats)
- Games (games)
- Profile (profile)

Hidden on sub-screens (createPost, postDetail, games, etc.)

---

## 🔑 KEY IMPLEMENTATION DETAILS

### 1. Authentication Flow
```typescript
// Login/Signup with Supabase Auth
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

// Session persistence
const session = await supabase.auth.getSession();
authStore.setState({ session, user: session.user });

// Sign out
await supabase.auth.signOut();
```

### 2. Habit Tracking
```typescript
// Calculate days clean
const daysClean = Math.floor(
  (Date.now() - new Date(habit.quitDate).getTime()) / (1000 * 60 * 60 * 24)
);

// Update streak
if (relapse) {
  currentStreak = 0;
  totalRelapses++;
} else {
  currentStreak++;
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }
}
```

### 3. Community Posts
```typescript
// Create post with images
const imageUrls = await uploadImagesToSupabase(images);
const post = await supabase
  .from('community_posts')
  .insert({
    author_id: userProfileId,
    title,
    content,
    category,
    images: imageUrls
  });

// Like post (with duplicate prevention)
const existingLike = await checkExistingLike(postId, userId);
if (!existingLike) {
  await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
  await incrementLikesCount(postId);
}
```

### 4. Image Upload
```typescript
// Upload to Supabase Storage
const fileExt = imageUri.split('.').pop();
const fileName = `${uuid()}.${fileExt}`;
const filePath = `posts/${fileName}`;

const { data, error } = await supabase.storage
  .from('community-images')
  .upload(filePath, {
    uri: imageUri,
    type: 'image/jpeg',
  });

const { data: { publicUrl } } = supabase.storage
  .from('community-images')
  .getPublicUrl(filePath);
```

### 5. Toast Notifications
```typescript
import Toast from 'react-native-root-toast';

// Success
Toast.show('Post created successfully! 🎉', {
  duration: Toast.durations.LONG,
  position: Toast.positions.TOP,
});

// Error
Toast.show('Failed to create post', {
  duration: Toast.durations.SHORT,
  backgroundColor: '#E53935',
  textColor: '#FFF',
});
```

### 6. Error Handling
- Always use try-catch for async operations
- Show toast notifications for user feedback
- Log errors to console for debugging
- Gracefully handle network errors
- Prevent duplicate actions (likes, comments)

### 7. Offline Support
- Store habits and urges in AsyncStorage
- Sync to Supabase when online
- Show offline indicator when disconnected
- Queue actions for sync when back online

### 8. Performance Optimizations
- Pagination for posts (load 20 at a time)
- Optimistic updates for likes
- Image lazy loading
- Memoize expensive calculations
- Debounce search inputs

---

## ⚠️ IMPORTANT NOTES

### Premium Features
- **All premium logic is commented out**
- `usePremium` hook always returns `isPremium: true`
- All features are free and accessible
- No payment integration needed

### Security
- Enable Row Level Security (RLS) on all Supabase tables
- Users can only access their own data
- Validate all inputs (title length, content length, etc.)
- Sanitize user-generated content
- Use soft deletes (is_deleted flag) instead of hard deletes

### Data Validation
- Post title: 3-200 characters
- Post content: minimum 10 characters
- Username: 3-30 characters, unique
- Image uploads: max 5 images per post
- Image size: compress before upload

### Duplicate Prevention
- Post likes: Unique constraint on (post_id, user_id)
- Double-check before insert to prevent race conditions
- Handle constraint violations gracefully

### Back Button Logic
- Sub-screens (createPost, postDetail) have custom back buttons in header
- Don't show global back button for these screens
- Use onBack/onClose callbacks for navigation

### Theme Support
- Full dark/light mode support
- Persist theme preference to AsyncStorage
- Use themeStore for all color references
- Test both themes thoroughly

---

## 🚀 DEVELOPMENT SETUP

1. **Initialize Expo Project**
   ```bash
   npx create-expo-app transform-app --template
   cd transform-app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # Install all packages from package.json
   ```

3. **Setup Supabase**
   - Create Supabase project
   - Run database migrations (create all tables)
   - Enable RLS on all tables
   - Create storage bucket for images
   - Set up environment variables

4. **Configure Environment**
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

5. **Run Development Server**
   ```bash
   npm start
   # or
   expo start
   ```

---

## 📝 FINAL CHECKLIST

Before considering the app complete, ensure:

- [ ] All screens implemented and functional
- [ ] Authentication flow works (signup, login, logout, password reset)
- [ ] Habit tracking works (add, update, delete, streaks)
- [ ] Urge logging works with all fields
- [ ] Community posts work (create, view, like, comment, delete)
- [ ] Image uploads work to Supabase Storage
- [ ] All 7 games are playable
- [ ] Dashboard shows correct stats
- [ ] Navigation works between all screens
- [ ] Dark/light theme works throughout
- [ ] Toast notifications show for all actions
- [ ] Error handling works gracefully
- [ ] Offline support works (habits stored locally)
- [ ] No duplicate back buttons
- [ ] All premium features are free
- [ ] Database RLS is enabled
- [ ] Image compression before upload
- [ ] Duplicate prevention for likes
- [ ] Pull-to-refresh works on feeds
- [ ] Loading states show during async operations
- [ ] Empty states show when no data

---

## 🎯 SUCCESS CRITERIA

The app is complete when:
1. Users can sign up, log in, and complete onboarding
2. Users can add habits and track streaks accurately
3. Users can log urges with all details
4. Users can create posts with images in the community
5. Users can like, comment, and interact with posts
6. All 7 games are playable and engaging
7. Dashboard shows accurate statistics
8. Navigation is smooth and intuitive
9. App works offline for basic tracking
10. All features are accessible without payment

---

**This prompt contains everything needed to recreate the Transform App from scratch. Follow it step-by-step, implement each feature, and test thoroughly. Good luck! 🚀**

