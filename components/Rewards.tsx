import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Habit, UserBadge, UserCoins, UserReward } from '../types';
import {
  getUserBadges,
  getUserCoins,
  getUserRewards,
} from '../services/rewardsService';
import { Award, Coins, Gift, Trophy } from 'lucide-react-native';

interface RewardsProps {
  habit?: Habit;
}

export default function Rewards({ habit }: RewardsProps) {
  const theme = useTheme();
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [coins, setCoins] = useState<UserCoins | null>(null);
  const [rewards, setRewards] = useState<UserReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'badges' | 'coins' | 'history'>('badges');

  useEffect(() => {
    loadRewards();
  }, [habit?.id]);

  async function loadRewards() {
    setLoading(true);
    try {
      const [badgesData, coinsData, rewardsData] = await Promise.all([
        getUserBadges(habit?.user_id || '', habit?.id),
        habit?.user_id ? getUserCoins(habit.user_id) : Promise.resolve(null),
        habit?.user_id ? getUserRewards(habit.user_id) : Promise.resolve([]),
      ]);

      setBadges(badgesData);
      setCoins(coinsData);
      setRewards(rewardsData);
    } catch (error) {
      console.error('Error loading rewards:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View
        style={{ backgroundColor: theme.base.card, borderColor: theme.base.border }}
        className="p-4 rounded-xl border"
      >
        <ActivityIndicator size="small" color={theme.primary} />
      </View>
    );
  }

  const TabButton = ({ tab, label, icon: Icon }: { tab: string; label: string; icon: any }) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tab as any)}
      style={{
        backgroundColor: activeTab === tab ? theme.primary : theme.base.surface,
        borderColor: activeTab === tab ? theme.primary : theme.base.border,
        borderWidth: 2,
      }}
      className="flex-1 p-3 rounded-xl mx-1 items-center"
    >
      <Icon
        size={18}
        color={activeTab === tab ? theme.text.inverse : theme.text.secondary}
      />
      <Text
        style={{
          color: activeTab === tab ? theme.text.inverse : theme.text.secondary,
        }}
        className="text-xs mt-1 font-medium"
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View
      style={{ backgroundColor: theme.base.card, borderColor: theme.base.border }}
      className="p-4 rounded-xl border"
    >
      <View className="flex-row items-center mb-4">
        <Award size={20} color={theme.primary} />
        <Text style={{ color: theme.text.primary }} className="text-lg font-bold ml-2">
          Rewards
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row mb-4">
        <TabButton tab="badges" label="Badges" icon={Trophy} />
        <TabButton tab="coins" label="Coins" icon={Coins} />
        <TabButton tab="history" label="History" icon={Gift} />
      </View>

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <ScrollView showsVerticalScrollIndicator={false}>
          {badges.length === 0 ? (
            <View className="py-8 items-center">
              <Trophy size={48} color={theme.text.tertiary} />
              <Text style={{ color: theme.text.secondary }} className="text-sm mt-2 text-center">
                No badges earned yet. Keep checking in to earn badges!
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap">
              {badges.map((userBadge) => {
                const badge = userBadge.badge as any;
                return (
                  <View
                    key={userBadge.id}
                    style={{
                      backgroundColor: theme.base.surface,
                      borderColor: theme.base.border,
                    }}
                    className="w-[48%] p-3 rounded-xl border mb-2 mr-2 items-center"
                  >
                    <View
                      style={{ backgroundColor: theme.primary + '20' }}
                      className="w-16 h-16 rounded-full items-center justify-center mb-2"
                    >
                      <Trophy size={32} color={theme.primary} />
                    </View>
                    <Text
                      style={{ color: theme.text.primary }}
                      className="text-sm font-bold text-center"
                      numberOfLines={2}
                    >
                      {badge?.name || 'Badge'}
                    </Text>
                    {badge?.description && (
                      <Text
                        style={{ color: theme.text.secondary }}
                        className="text-xs mt-1 text-center"
                        numberOfLines={2}
                      >
                        {badge.description}
                      </Text>
                    )}
                    <Text
                      style={{ color: theme.text.tertiary }}
                      className="text-xs mt-1"
                    >
                      {new Date(userBadge.unlocked_at).toLocaleDateString()}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {/* Coins Tab */}
      {activeTab === 'coins' && (
        <View>
          {coins ? (
            <View>
              <View
                style={{ backgroundColor: theme.status.warning + '20' }}
                className="p-6 rounded-xl items-center mb-4"
              >
                <Coins size={48} color={theme.status.warning} />
                <Text style={{ color: theme.text.primary }} className="text-4xl font-bold mt-2">
                  {coins.total_coins}
                </Text>
                <Text style={{ color: theme.text.secondary }} className="text-sm mt-1">
                  Total Coins
                </Text>
              </View>

              <View className="flex-row justify-between mb-4">
                <View
                  style={{ backgroundColor: theme.base.surface }}
                  className="flex-1 p-3 rounded-xl mr-2 items-center"
                >
                  <Text style={{ color: theme.text.secondary }} className="text-xs mb-1">
                    Earned
                  </Text>
                  <Text style={{ color: theme.status.success }} className="text-xl font-bold">
                    +{coins.earned_coins}
                  </Text>
                </View>
                <View
                  style={{ backgroundColor: theme.base.surface }}
                  className="flex-1 p-3 rounded-xl ml-2 items-center"
                >
                  <Text style={{ color: theme.text.secondary }} className="text-xs mb-1">
                    Spent
                  </Text>
                  <Text style={{ color: theme.status.error }} className="text-xl font-bold">
                    -{coins.spent_coins}
                  </Text>
                </View>
              </View>

              <View
                style={{ backgroundColor: theme.base.surface }}
                className="p-3 rounded-xl"
              >
                <Text style={{ color: theme.text.secondary }} className="text-xs mb-2">
                  Ways to earn coins:
                </Text>
                <View className="flex-row items-center mb-1">
                  <Text style={{ color: theme.text.primary }} className="text-sm">
                    • Daily check-in: 10 coins
                  </Text>
                </View>
                <View className="flex-row items-center mb-1">
                  <Text style={{ color: theme.text.primary }} className="text-sm">
                    • Milestone achievement: 50-500 coins
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text style={{ color: theme.text.primary }} className="text-sm">
                    • Badge unlock: 25-100 coins
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View className="py-8 items-center">
              <Coins size={48} color={theme.text.tertiary} />
              <Text style={{ color: theme.text.secondary }} className="text-sm mt-2 text-center">
                Start earning coins by checking in daily!
              </Text>
            </View>
          )}
        </View>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <ScrollView showsVerticalScrollIndicator={false}>
          {rewards.length === 0 ? (
            <View className="py-8 items-center">
              <Gift size={48} color={theme.text.tertiary} />
              <Text style={{ color: theme.text.secondary }} className="text-sm mt-2 text-center">
                No rewards history yet.
              </Text>
            </View>
          ) : (
            <View>
              {rewards.map((reward) => (
                <View
                  key={reward.id}
                  style={{
                    backgroundColor: theme.base.surface,
                    borderColor: theme.base.border,
                  }}
                  className="p-3 rounded-xl border mb-2 flex-row items-center"
                >
                  <View
                    style={{
                      backgroundColor:
                        reward.reward_type === 'badge'
                          ? theme.primary + '20'
                          : reward.reward_type === 'coin'
                          ? theme.status.warning + '20'
                          : theme.base.surface,
                    }}
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  >
                    {reward.reward_type === 'badge' ? (
                      <Trophy size={20} color={theme.primary} />
                    ) : reward.reward_type === 'coin' ? (
                      <Coins size={20} color={theme.status.warning} />
                    ) : (
                      <Gift size={20} color={theme.text.secondary} />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: theme.text.primary }} className="font-medium">
                      {reward.title}
                    </Text>
                    {reward.description && (
                      <Text style={{ color: theme.text.secondary }} className="text-xs mt-1">
                        {reward.description}
                      </Text>
                    )}
                    <Text style={{ color: theme.text.tertiary }} className="text-xs mt-1">
                      {new Date(reward.unlocked_at).toLocaleDateString()}
                    </Text>
                  </View>
                  {reward.points > 0 && (
                    <View className="items-end">
                      <Text style={{ color: theme.status.warning }} className="font-bold">
                        +{reward.points}
                      </Text>
                      <Text style={{ color: theme.text.tertiary }} className="text-xs">
                        coins
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

