import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { supabase } from '../../services/supabase';
import { Post } from '../../types';
import PostItem from '../../components/feed/PostItem';

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*, user:profiles(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.log(error);
    } else {
      setPosts(data as Post[]);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <FlashList
        data={posts}
        renderItem={({ item }) => <PostItem post={item} />}
        // @ts-ignore
        estimatedItemSize={200}
        onRefresh={fetchPosts}
        refreshing={loading}
      />
    </View>
  );
}
