# Community System Testing Guide

## ✅ Setup Complete!

Your community system has been set up and is ready to test. Here's how to test it:

## 🧪 Testing Steps

### 1. **Start the App**
```bash
npm start
```

### 2. **Access the Test Screen**

You can access the test screen by navigating to it in your app. The test screen is available at:
- Screen name: `communityTest`
- You can add a button in your app to navigate to it, or use the navigation directly

### 3. **Manual Testing via Community Feed**

1. **Sign In/Sign Up**
   - Make sure you're authenticated in the app
   - The community system requires authentication

2. **Navigate to Community Tab**
   - Tap the "Community" tab in the bottom navigation
   - You should see the Community Feed screen

3. **Test Features:**
   - ✅ **View Feed**: See all community posts
   - ✅ **Create Post**: Tap the "+ Create Post" button
   - ✅ **Like Posts**: Tap the heart icon on any post
   - ✅ **View Post Details**: Tap on any post to see details and comments
   - ✅ **Add Comments**: Add comments to posts
   - ✅ **View Profiles**: Tap on user avatars to see profiles
   - ✅ **Filter by Category**: Use category filters at the top

## 🧪 Test Screen Features

The `CommunityTestScreen` includes buttons to test:

1. **Run All Tests** - Runs all tests automatically
2. **Test Connection** - Tests Supabase connection
3. **Test Auth** - Checks if user is authenticated
4. **Test Profile** - Tests user profile creation/loading
5. **Test Feed** - Tests loading community feed
6. **Create Test Post** - Creates a test post

## 📋 What to Check

### ✅ Database Connection
- App should connect to Supabase without errors
- Check console for any connection warnings

### ✅ User Profile
- Profile should be created automatically on first use
- Profile settings should be accessible

### ✅ Posts
- Can create new posts
- Posts appear in feed
- Can like/unlike posts
- Can view post details

### ✅ Comments
- Can add comments to posts
- Comments appear in post details
- Can like comments

### ✅ Images
- Can upload images when creating posts
- Images display correctly in posts

## 🐛 Troubleshooting

### Issue: "Not authenticated"
**Solution**: Sign in to your app first. The community system requires authentication.

### Issue: "Profile not found"
**Solution**: The profile will be created automatically. If it fails, check:
- RLS policies are set correctly
- User has permission to create profiles

### Issue: "Failed to load feed"
**Solution**: Check:
- Supabase credentials in `.env` file
- Database tables exist (run the SQL script)
- RLS policies allow reading posts

### Issue: "Image upload failed"
**Solution**: Check:
- Storage buckets exist (`avatars`, `post-images`, `success-stories`)
- Storage policies allow uploads
- File size is reasonable

## 📝 Environment Variables

Make sure you have these in your `.env` file:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🎯 Quick Test Checklist

- [ ] App starts without errors
- [ ] Can navigate to Community tab
- [ ] Feed loads (even if empty)
- [ ] Can create a post
- [ ] Can like a post
- [ ] Can add a comment
- [ ] Can view post details
- [ ] Can view user profile
- [ ] Images upload (if tested)

## 🚀 Next Steps

Once testing is complete:

1. **Remove Test Screen** (optional)
   - The test screen is in `src/screens/community/CommunityTestScreen.tsx`
   - You can remove it or keep it for future testing

2. **Customize**
   - Adjust styling to match your app
   - Add more features as needed
   - Configure notifications

3. **Production Ready**
   - Test with real users
   - Monitor performance
   - Set up error tracking

## 📞 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify Supabase setup
3. Check RLS policies
4. Ensure all tables exist

---

**Happy Testing! 🎉**

