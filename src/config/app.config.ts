export const APP_CONFIG = {
  // App Info
  APP_NAME: 'Transform',
  APP_VERSION: '1.0.0',
  
  // API Config
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.transform.app',
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  
  // Feature Flags
  ENABLE_ANALYTICS: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_PREMIUM: true,
  
  // Limits
  MAX_HABITS: 10,
  MAX_URGE_LOGS_PER_DAY: 50,
  
  // Notification Times
  DAILY_REMINDER_HOUR: 9,
  EVENING_CHECKIN_HOUR: 21,
  
  // Support
  SUPPORT_EMAIL: 'support@transform.app',
  PRIVACY_POLICY_URL: 'https://transform.app/privacy',
  TERMS_URL: 'https://transform.app/terms',
};