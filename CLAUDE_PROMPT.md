# Codebase Overview Prompt for Claude

## Project: Transformer - Mental Health & Wellness Mobile App

This is a React Native mobile application built with Expo Router, Supabase backend, and NativeWind (Tailwind CSS) for styling. The app appears to be a mental health/wellness platform with community features, daily check-ins, and distraction games.

---

## Tech Stack & Architecture

### Core Technologies
- **Framework**: React Native 0.81.5 with Expo SDK ~54.0.25
- **Navigation**: Expo Router v6.0.15 (file-based routing)
- **Backend**: Supabase (PostgreSQL database with real-time capabilities)
- **State Management**: Zustand v5.0.9
- **Styling**: NativeWind v4.2.1 (Tailwind CSS for React Native)
- **UI Components**: 
  - Lucide React Native (icons)
  - @shopify/flash-list (performant list rendering)
  - React Native Reanimated
- **Data Fetching**: @tanstack/react-query v5.90.11
- **Notifications**: Expo Notifications
- **Storage**: Expo Secure Store (for auth tokens)

### Project Structure
```
app/
├── _layout.tsx              # Root layout with auth protection
├── (auth)/                  # Auth group (login, signup)
│   ├── _layout.tsx
│   ├── login.tsx
│   └── signup.tsx
├── (tabs)/                  # Main app tabs
│   ├── _layout.tsx
│   ├── index.tsx            # Dashboard
│   ├── feed.tsx             # Community feed
│   └── games.tsx            # Games/Distraction tab
├── modal.tsx                # Modal screen
├── +html.tsx                # HTML wrapper
└── +not-found.tsx           # 404 page

components/
├── CheckIn.tsx              # Daily mood check-in component
├── feed/
│   └── PostItem.tsx         # Post display component
├── games/
│   └── MemoryMatch.tsx      # Memory matching game
└── [other utility components]

services/
├── supabase.ts              # Supabase client configuration
└── notification.ts          # Push notification setup

stores/
└── useAuthStore.ts          # Zustand auth state store

types/
└── index.ts                 # TypeScript type definitions
```

---

## Authentication System

### Supabase Integration (`services/supabase.ts`)
- Uses Expo Secure Store as the storage adapter for auth tokens
- Auto-refreshes tokens when app becomes active
- Configured with environment variables:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Handles session persistence across app restarts

### Auth Store (`stores/useAuthStore.ts`)
Zustand store managing:
- `session`: Current Supabase session
- `user`: Current user object
- `profile`: User profile from `profiles` table
- `loading`: Initial auth loading state
- `setSession()`: Updates session and automatically fetches profile
- `fetchProfile()`: Fetches user profile from `profiles` table
- `signOut()`: Signs out user and clears state

### Auth Flow (`app/_layout.tsx`)
1. On app start, checks for existing session via `supabase.auth.getSession()`
2. Sets up auth state change listener
3. Protected routing logic:
   - If no session and not in auth group → redirect to `/login`
   - If session exists and in auth group → redirect to `/(tabs)`
4. Shows loading spinner during initial auth check

### Auth Screens
- **Login** (`app/(auth)/login.tsx`): Email/password sign-in
- **Signup** (`app/(auth)/signup.tsx`): Email/password registration with email verification

---

## Database Schema (Inferred from Types)

### Tables:

1. **profiles**
   - `id` (string, UUID) - Primary key, matches auth.users
   - `username` (string)
   - `avatar_url` (string, optional)
   - `bio` (string, optional)
   - `days_clean` (number) - Track sobriety/clean days
   - `streak` (number) - Current streak
   - `created_at` (timestamp)

2. **posts**
   - `id` (string, UUID)
   - `user_id` (string, FK to profiles)
   - `content` (string)
   - `image_url` (string, optional)
   - `created_at` (timestamp)
   - `likes_count` (number)
   - `comments_count` (number)

3. **comments**
   - `id` (string, UUID)
   - `post_id` (string, FK to posts)
   - `user_id` (string, FK to profiles)
   - `content` (string)
   - `created_at` (timestamp)

4. **likes**
   - `id` (string, UUID)
   - `post_id` (string, FK to posts)
   - `user_id` (string, FK to profiles)
   - `created_at` (timestamp)

5. **checkins**
   - `user_id` (string, FK to profiles)
   - `mood` (string) - User's mood/feeling text

6. **game_scores**
   - `id` (string, UUID)
   - `user_id` (string, FK to profiles)
   - `game_type` ('memory' | 'breathing' | 'zen')
   - `score` (number, optional)
   - `duration_seconds` (number, optional)
   - `created_at` (timestamp)

---

## Main Features

### 1. Dashboard (`app/(tabs)/index.tsx`)
- Welcome message with user email
- **CheckIn Component**: Daily mood check-in form
  - Text input for mood/feeling
  - Saves to `checkins` table
  - Success/error alerts
- Sign out button

### 2. Community Feed (`app/(tabs)/feed.tsx`)
- Displays posts from all users
- Uses FlashList for performance
- Fetches posts with joined user profiles
- Ordered by `created_at` descending
- Pull-to-refresh functionality
- **PostItem Component**:
  - Shows user avatar placeholder, username
  - Post content and optional image
  - Like and comment counts with icons
  - Currently display-only (no interaction handlers)

### 3. Games/Distraction Tab (`app/(tabs)/games.tsx`)
- **MemoryMatch Game**:
  - 8 pairs of emoji cards (16 cards total)
  - Flip cards to find matches
  - Tracks flipped and solved cards
  - Reset game functionality
  - Visual feedback with blue background for flipped/solved cards

### 4. Tab Navigation (`app/(tabs)/_layout.tsx`)
Three tabs:
- **Dashboard** (Home icon) - `/index`
- **Community** (Users icon) - `/feed`
- **Distract** (Gamepad icon) - `/games`

---

## Styling System

### NativeWind Configuration
- Tailwind CSS v3.4.18
- Uses `className` prop on React Native components
- Content paths: `./app/**/*.{js,jsx,ts,tsx}` and `./components/**/*.{js,jsx,ts,tsx}`
- Global CSS imported in root layout

### Design Patterns
- Consistent use of Tailwind utility classes
- Color scheme: Blue primary (#2563eb), gray backgrounds
- Rounded corners (`rounded-lg`), padding (`p-3`, `p-4`)
- Flexbox layouts (`flex-1`, `flex-row`, `justify-center`, `items-center`)

---

## Notifications (`services/notification.ts`)

### Features:
- Push notification registration
- Platform-specific Android channel setup
- Daily check-in reminder notification
  - Scheduled for 9:00 AM daily
  - Title: "Daily Check-in"
  - Body: "How are you feeling today? Log your progress!"

### Implementation:
- `registerForPushNotificationsAsync()`: Requests permissions and gets Expo push token
- `scheduleDailyCheckInNotification()`: Schedules recurring daily notification

---

## Key Implementation Details

### Routing
- File-based routing with Expo Router
- Group routes: `(auth)` and `(tabs)` for organization
- Protected routes via root layout auth check
- Modal support (`modal.tsx`)

### State Management
- Zustand for global auth state
- Local component state with `useState` for UI
- Supabase real-time subscriptions (not currently implemented but supported)

### Data Fetching
- Direct Supabase client calls (not using React Query yet, though it's installed)
- Manual loading states
- Error handling with console logs and alerts

### Type Safety
- TypeScript with strict mode enabled
- Type definitions in `types/index.ts`
- Path aliases configured (`@/*` maps to root)

---

## Environment Variables Required

```
EXPO_PUBLIC_SUPABASE_URL=<your-supabase-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

---

## App Configuration (`app.json`)

- **Name**: "transformer"
- **Slug**: "transformer"
- **New Architecture**: Enabled
- **Orientation**: Portrait
- **Platforms**: iOS, Android, Web
- **Android**: Edge-to-edge enabled, predictive back gesture disabled
- **Plugins**: expo-router, expo-secure-store
- **Experiments**: Typed routes enabled

---

## Current Limitations / Areas for Enhancement

1. **Post Interactions**: Like and comment buttons in PostItem don't have handlers
2. **Image Upload**: No image upload functionality for posts/avatars
3. **Comments**: Comment system types exist but no UI implementation
4. **Game Scores**: MemoryMatch doesn't save scores to database
5. **Profile Management**: No profile editing UI
6. **Real-time Updates**: Feed doesn't use Supabase real-time subscriptions
7. **React Query**: Installed but not used for data fetching
8. **Notifications**: Service exists but not integrated into app lifecycle
9. **Error Handling**: Basic error handling, could be more robust
10. **Loading States**: Some screens lack proper loading indicators

---

## Development Commands

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
```

---

## Code Style & Patterns

- Functional components with hooks
- TypeScript for type safety
- Tailwind utility classes for styling
- Consistent file naming (camelCase for components, kebab-case for routes)
- Component co-location (components near their usage)
- Service layer separation (Supabase, notifications)

---

## Dependencies Summary

**Core**: React 19.1.0, React Native 0.81.5, Expo ~54.0.25
**Navigation**: expo-router ~6.0.15
**Backend**: @supabase/supabase-js ^2.86.0
**State**: zustand ^5.0.9
**Styling**: nativewind ^4.2.1, tailwindcss ^3.4.18
**UI**: lucide-react-native ^0.555.0, @shopify/flash-list 2.0.2
**Data**: @tanstack/react-query ^5.90.11
**Storage**: expo-secure-store ~15.0.7
**Notifications**: expo-notifications ~0.32.13

---

This codebase represents a mental health/wellness app with community features, daily check-ins, and distraction games. The architecture is modern, using Expo Router for navigation, Supabase for backend, and Zustand for state management. The app is in active development with room for feature expansion.

