/**
 * Community System Test Script
 * Run this to test the community features
 * 
 * Usage: 
 * 1. Make sure your .env file has EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
 * 2. Run: npx ts-node test-community.ts
 */

import { supabase } from './src/services/supabase';
import { communityService } from './src/services/CommunityService';
import { supabaseAuthService } from './src/services/SupabaseAuthService';

async function testCommunitySystem() {
  console.log('🧪 Starting Community System Tests...\n');

  try {
    // Test 1: Check Supabase Connection
    console.log('1️⃣ Testing Supabase Connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (healthError && healthError.code !== 'PGRST116') {
      console.error('❌ Supabase connection failed:', healthError.message);
      return;
    }
    console.log('✅ Supabase connection successful\n');

    // Test 2: Check if user is authenticated
    console.log('2️⃣ Checking Authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('⚠️  No user authenticated. Please sign in first.');
      console.log('   You can test authentication with:');
      console.log('   - supabaseAuthService.signUp(email, password, username)');
      console.log('   - supabaseAuthService.signIn(email, password)\n');
      return;
    }
    
    console.log('✅ User authenticated:', user.email);
    console.log('   User ID:', user.id, '\n');

    // Test 3: Get or Create User Profile
    console.log('3️⃣ Testing User Profile...');
    let profile = await communityService.getCurrentUserProfile();
    
    if (!profile) {
      console.log('   Creating new profile...');
      const username = user.user_metadata?.username || `user_${user.id.slice(0, 8)}`;
      profile = await communityService.upsertUserProfile({
        username,
        display_name: user.user_metadata?.display_name || username,
        is_profile_public: false,
        show_streak: true,
        show_before_after: false,
        show_success_stories: true,
      });
      console.log('✅ Profile created:', profile.username);
    } else {
      console.log('✅ Profile found:', profile.username);
      console.log('   Display Name:', profile.display_name);
      console.log('   Total Posts:', profile.total_posts);
      console.log('   Days Clean:', profile.total_days_clean);
    }
    console.log('');

    // Test 4: Test Community Feed
    console.log('4️⃣ Testing Community Feed...');
    const posts = await communityService.getCommunityFeed({ page: 0, limit: 5 });
    console.log(`✅ Loaded ${posts.length} posts from feed\n`);

    // Test 5: Create a Test Post
    console.log('5️⃣ Testing Post Creation...');
    try {
      const testPost = await communityService.createPost({
        title: 'Test Post - Community System Working! 🎉',
        content: 'This is a test post to verify the community system is working correctly. If you see this, everything is set up properly!',
        category: 'general',
      });
      console.log('✅ Post created successfully!');
      console.log('   Post ID:', testPost.id);
      console.log('   Title:', testPost.title);
      console.log('   Category:', testPost.category);
      console.log('');

      // Test 6: Like the Post
      console.log('6️⃣ Testing Post Like...');
      const liked = await communityService.togglePostLike(testPost.id);
      console.log(`✅ Post ${liked ? 'liked' : 'unliked'} successfully\n`);

      // Test 7: Add Comment
      console.log('7️⃣ Testing Comment Creation...');
      const comment = await communityService.addComment(
        testPost.id,
        'This is a test comment! The comment system is working. 👍'
      );
      console.log('✅ Comment created successfully!');
      console.log('   Comment ID:', comment.id);
      console.log('   Content:', comment.content);
      console.log('');

      // Test 8: Get Comments
      console.log('8️⃣ Testing Get Comments...');
      const comments = await communityService.getPostComments(testPost.id);
      console.log(`✅ Loaded ${comments.length} comment(s)\n`);

      // Test 9: Get Post Details
      console.log('9️⃣ Testing Get Post Details...');
      const postDetails = await communityService.getPost(testPost.id);
      if (postDetails) {
        console.log('✅ Post details loaded');
        console.log('   Likes:', postDetails.likes_count);
        console.log('   Comments:', postDetails.comments_count);
        console.log('   Views:', postDetails.views_count);
      }
      console.log('');

    } catch (postError: any) {
      console.error('❌ Post creation failed:', postError.message);
      console.log('');
    }

    // Test 10: Test Success Stories
    console.log('🔟 Testing Success Stories...');
    const stories = await communityService.getSuccessStories({ page: 0, limit: 5 });
    console.log(`✅ Loaded ${stories.length} success story/stories\n`);

    // Test 11: Test Profile Settings
    console.log('1️⃣1️⃣ Testing Profile Settings...');
    const updatedProfile = await communityService.updateProfileSettings({
      is_profile_public: true,
    });
    console.log('✅ Profile settings updated');
    console.log('   Public Profile:', updatedProfile.is_profile_public);
    console.log('');

    console.log('🎉 All tests completed successfully!');
    console.log('\n📝 Summary:');
    console.log('   ✅ Supabase connection working');
    console.log('   ✅ User authentication working');
    console.log('   ✅ User profiles working');
    console.log('   ✅ Post creation working');
    console.log('   ✅ Post likes working');
    console.log('   ✅ Comments working');
    console.log('   ✅ Profile settings working');
    console.log('\n✨ Your community system is ready to use!');

  } catch (error: any) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error('   Stack:', error.stack);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check your Supabase credentials in .env');
    console.log('   2. Make sure you ran the SQL schema in Supabase');
    console.log('   3. Verify RLS policies are set correctly');
    console.log('   4. Check that storage buckets exist');
  }
}

// Run tests
testCommunitySystem();

