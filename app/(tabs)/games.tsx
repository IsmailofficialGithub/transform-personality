import { View, Text } from 'react-native';
import MemoryMatch from '../../components/games/MemoryMatch';

export default function Games() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <MemoryMatch />
    </View>
  );
}
