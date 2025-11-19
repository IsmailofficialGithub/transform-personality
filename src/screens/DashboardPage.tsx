import React from 'react';
import { View, Text, Button, ScrollView } from 'react-native';
import { useGamification } from '../context/GamificationContext';
import { ProgressRing } from '../components/gamification/ProgressRing';
import { AchievementBadge } from '../components/gamification/AchievementBadge';
import { ConfettiCelebration } from '../components/gamification/ConfettiCelebration';

export default function DashboardPage() {
  const { streak, achievements, logRelapse } = useGamification();
  const [showConfetti, setShowConfetti] = React.useState(false);

  React.useEffect(() => {
    if (streak === 3 || streak === 7) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [streak]);

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        padding: 20,
      }}
    >
      <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
        Current Streak: {streak} days
      </Text>

      <ProgressRing progress={(streak / 7) * 100} />

      <View style={{ marginTop: 20 }}>
        <Button title="I Relapsed 😔" color="#ef4444" onPress={logRelapse} />
      </View>

      <Text style={{ color: 'white', fontWeight: '600', marginTop: 20 }}>Achievements</Text>

      {achievements.map(a => (
        <AchievementBadge key={a.id} title={a.title} description={a.description} />
      ))}

      <ConfettiCelebration active={showConfetti} />
    </ScrollView>
  );
}
