import { View, Text, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../stores/useAuthStore';
import CheckIn from '../../components/CheckIn';

export default function Dashboard() {
  const { signOut, user } = useAuthStore();

  return (
    <View className="flex-1 justify-center items-center bg-white p-4">
      <Text className="text-2xl font-bold mb-4">Dashboard</Text>
      <Text className="mb-4">Welcome, {user?.email}</Text>
      
      <CheckIn />

      <TouchableOpacity
        className="bg-red-500 p-3 rounded-lg mt-4"
        onPress={() => signOut()}
      >
        <Text className="text-white font-bold">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}
