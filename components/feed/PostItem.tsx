import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Post } from '../../types';
import { Heart, MessageCircle } from 'lucide-react-native';

interface PostItemProps {
  post: Post;
}

export default function PostItem({ post }: PostItemProps) {
  return (
    <View className="bg-white p-4 mb-2">
      <View className="flex-row items-center mb-2">
        <View className="w-10 h-10 bg-gray-200 rounded-full mr-3" />
        <Text className="font-bold">{post.user?.username || 'User'}</Text>
      </View>
      <Text className="mb-2">{post.content}</Text>
      {post.image_url && (
        <Image
          source={{ uri: post.image_url }}
          className="w-full h-64 rounded-lg mb-2"
          resizeMode="cover"
        />
      )}
      <View className="flex-row mt-2">
        <TouchableOpacity className="flex-row items-center mr-4">
          <Heart size={20} color="gray" />
          <Text className="ml-1 text-gray-500">{post.likes_count}</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center">
          <MessageCircle size={20} color="gray" />
          <Text className="ml-1 text-gray-500">{post.comments_count}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
