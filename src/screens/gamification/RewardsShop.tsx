import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../store/themeStore';
import { SIZES } from '../../utils/theme';
import { Moon, Waves, Swords, Trophy, Gamepad2 } from 'lucide-react-native';

const IconMap: Record<string, any> = {
  Moon,
  Waves,
  Swords,
  Trophy,
  Gamepad2,
};

interface Reward {
  id: string;
  name: string;
  description: string;
  xpCost: number;
  icon: string;
  category: 'theme' | 'avatar' | 'badge' | 'feature';
  unlocked: boolean;
  color: string[];
}

const REWARDS: Reward[] = [
  {
    id: '1',
    name: 'Dark Theme',
    description: 'Unlock the dark theme',
    xpCost: 100,
    icon: 'Moon',
    category: 'theme',
    unlocked: false,
    color: ['#1A1A1A', '#2D2D2D'],
  },
  {
    id: '2',
    name: 'Ocean Theme',
    description: 'Beautiful blue ocean theme',
    xpCost: 200,
    icon: 'Waves',
    category: 'theme',
    unlocked: false,
    color: ['#00BCD4', '#0097A7'],
  },
  {
    id: '3',
    name: 'Warrior Avatar',
    description: 'Exclusive warrior avatar',
    xpCost: 150,
    icon: 'Swords',
    category: 'avatar',
    unlocked: false,
    color: ['#FF6B6B', '#FF8E53'],
  },
  {
    id: '4',
    name: 'Champion Badge',
    description: 'Show off your achievement',
    xpCost: 300,
    icon: 'Trophy',
    category: 'badge',
    unlocked: false,
    color: ['#FFD700', '#FFA500'],
  },
  {
    id: '5',
    name: 'Premium Games Access',
    description: 'Unlock all premium games for 7 days',
    xpCost: 500,
    icon: 'Gamepad2',
    category: 'feature',
    unlocked: false,
    color: ['#667EEA', '#764BA2'],
  },
];

export const RewardsShop = () => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);
  const [rewards, setRewards] = useState(REWARDS);
  const [currentXP] = useState(450); // This would come from store

  const textColor = isDark ? '#FFF' : '#000';
  const subText = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? 'rgba(25,25,25,0.9)' : 'rgba(255,255,255,0.95)';

  const handlePurchase = (reward: Reward) => {
    if (currentXP >= reward.xpCost && !reward.unlocked) {
      setRewards(rewards.map(r =>
        r.id === reward.id ? { ...r, unlocked: true } : r
      ));
      // TODO: Deduct XP from store
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'theme': return 'Theme';
      case 'avatar': return 'Avatar';
      case 'badge': return 'Badge';
      case 'feature': return 'Feature';
      default: return '';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F9F9F9' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>Rewards Shop</Text>
          <Text style={[styles.subtitle, { color: subText }]}>
            Spend your XP to unlock rewards
          </Text>
        </View>

        {/* XP Balance */}
        <View style={[styles.xpCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.xpLabel, { color: subText }]}>Your XP Balance</Text>
          <Text style={[styles.xpValue, { color: colors.primary }]}>
            {currentXP.toLocaleString()} XP
          </Text>
        </View>

        {/* Rewards Grid */}
        <View style={styles.rewardsGrid}>
          {rewards.map((reward) => {
            const canAfford = currentXP >= reward.xpCost;
            const isUnlocked = reward.unlocked;
            const Icon = IconMap[reward.icon] || Moon;

            return (
              <TouchableOpacity
                key={reward.id}
                style={[
                  styles.rewardCard,
                  { backgroundColor: cardBg },
                  isUnlocked && styles.unlockedCard,
                ]}
                onPress={() => handlePurchase(reward)}
                activeOpacity={0.7}
                disabled={isUnlocked || !canAfford}
              >
                <LinearGradient
                  colors={reward.color}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.rewardIconContainer}
                >
                  <Icon size={40} color="#FFF" />
                </LinearGradient>

                <View style={styles.rewardInfo}>
                  <View style={styles.categoryBadge}>
                    <Text style={[styles.categoryText, { color: reward.color[0] }]}>
                      {getCategoryLabel(reward.category)}
                    </Text>
                  </View>
                  <Text style={[styles.rewardName, { color: textColor }]}>
                    {reward.name}
                  </Text>
                  <Text style={[styles.rewardDesc, { color: subText }]} numberOfLines={2}>
                    {reward.description}
                  </Text>
                </View>

                {isUnlocked ? (
                  <View style={styles.unlockedBadge}>
                    <Text style={styles.unlockedText}>✓ Unlocked</Text>
                  </View>
                ) : (
                  <View style={[
                    styles.priceContainer,
                    !canAfford && styles.priceContainerDisabled
                  ]}>
                    <Text style={[
                      styles.priceText,
                      { color: canAfford ? colors.primary : subText }
                    ]}>
                      {reward.xpCost} XP
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
  },
  xpCard: {
    marginHorizontal: SIZES.padding,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  xpLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  xpValue: {
    fontSize: 36,
    fontWeight: '700',
  },
  rewardsGrid: {
    paddingHorizontal: SIZES.padding,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  rewardCard: {
    width: (SIZES.width - SIZES.padding * 3) / 2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  unlockedCard: {
    opacity: 0.7,
  },
  rewardIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardInfo: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
  },
  rewardName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  rewardDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  unlockedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#00E67620',
  },
  unlockedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00E676',
  },
  priceContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
  },
  priceContainerDisabled: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
