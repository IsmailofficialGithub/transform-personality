import { supabase } from './supabase';
import { UserReward, Badge, UserBadge, UserCoins, Milestone } from '../types';

/**
 * Award coins to user
 */
export async function awardCoins(
  userId: string,
  amount: number,
  reason: string
): Promise<boolean> {
  try {
    // Get or create user coins record
    const { data: existing } = await supabase
      .from('user_coins')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('user_coins')
        .update({
          total_coins: existing.total_coins + amount,
          earned_coins: existing.earned_coins + amount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) {
        console.error('Error updating coins:', error);
        return false;
      }
    } else {
      const { error } = await supabase.from('user_coins').insert({
        user_id: userId,
        total_coins: amount,
        earned_coins: amount,
        spent_coins: 0,
      });

      if (error) {
        console.error('Error creating coins:', error);
        return false;
      }
    }

    // Create reward record
    await supabase.from('user_rewards').insert({
      user_id: userId,
      reward_type: 'coin',
      title: `Earned ${amount} coins`,
      description: reason,
      points: amount,
    });

    return true;
  } catch (error) {
    console.error('Error awarding coins:', error);
    return false;
  }
}

/**
 * Get user's coin balance
 */
export async function getUserCoins(userId: string): Promise<UserCoins | null> {
  try {
    const { data, error } = await supabase
      .from('user_coins')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching coins:', error);
      return null;
    }

    return data as UserCoins | null;
  } catch (error) {
    console.error('Error getting user coins:', error);
    return null;
  }
}

/**
 * Award badge to user
 */
export async function awardBadge(
  userId: string,
  badgeId: string,
  habitId?: string
): Promise<boolean> {
  try {
    // Check if badge already exists
    const { data: existing } = await supabase
      .from('user_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_id', badgeId)
      .eq('habit_id', habitId || null)
      .maybeSingle();

    if (existing) {
      return false; // Badge already awarded
    }

    // Get badge info
    const { data: badge } = await supabase
      .from('badges')
      .select('*')
      .eq('id', badgeId)
      .single();

    if (!badge) {
      return false;
    }

    // Award badge
    const { error: badgeError } = await supabase.from('user_badges').insert({
      user_id: userId,
      badge_id: badgeId,
      habit_id: habitId || null,
    });

    if (badgeError) {
      console.error('Error awarding badge:', badgeError);
      return false;
    }

    // Award coins if badge has reward
    if (badge.coins_reward > 0) {
      await awardCoins(userId, badge.coins_reward, `Badge: ${badge.name}`);
    }

    // Create reward record
    await supabase.from('user_rewards').insert({
      user_id: userId,
      reward_type: 'badge',
      title: badge.name,
      description: badge.description || '',
      icon_url: badge.icon_url || '',
      points: badge.coins_reward,
    });

    return true;
  } catch (error) {
    console.error('Error awarding badge:', error);
    return false;
  }
}

/**
 * Check and award badges based on milestones
 */
export async function checkMilestoneBadges(
  userId: string,
  habitId: string,
  milestone: Milestone
): Promise<UserBadge[]> {
  const awardedBadges: UserBadge[] = [];

  // Map milestone types to badge keys and coin rewards
  const milestoneRewards: Record<Milestone['milestone_type'], { badgeKey: string; coins: number }> = {
    '1_day': { badgeKey: 'first_day', coins: 50 },
    '3_days': { badgeKey: 'three_days', coins: 75 },
    '1_week': { badgeKey: 'one_week', coins: 100 },
    '2_weeks': { badgeKey: 'two_weeks', coins: 150 },
    '1_month': { badgeKey: 'one_month', coins: 250 },
    '3_months': { badgeKey: 'three_months', coins: 350 },
    '6_months': { badgeKey: 'six_months', coins: 450 },
    '1_year': { badgeKey: 'one_year', coins: 500 },
  };

  const reward = milestoneRewards[milestone.milestone_type];

  if (reward) {
    // Award coins for milestone
    await awardCoins(userId, reward.coins, `Milestone: ${milestone.milestone_type.replace('_', ' ')}`);

    // Find badge by key
    const { data: badge } = await supabase
      .from('badges')
      .select('*')
      .eq('badge_key', reward.badgeKey)
      .maybeSingle();

    if (badge) {
      const awarded = await awardBadge(userId, badge.id, habitId);
      if (awarded) {
        const { data: userBadge } = await supabase
          .from('user_badges')
          .select('*, badge:badges(*)')
          .eq('user_id', userId)
          .eq('badge_id', badge.id)
          .eq('habit_id', habitId)
          .single();

        if (userBadge) {
          awardedBadges.push(userBadge as UserBadge);
        }
      }
    }
  }

  return awardedBadges;
}

/**
 * Get user's badges
 */
export async function getUserBadges(
  userId: string,
  habitId?: string
): Promise<UserBadge[]> {
  try {
    let query = supabase
      .from('user_badges')
      .select('*, badge:badges(*)')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (habitId) {
      query = query.eq('habit_id', habitId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching badges:', error);
      return [];
    }

    return (data as UserBadge[]) || [];
  } catch (error) {
    console.error('Error getting user badges:', error);
    return [];
  }
}

/**
 * Get user's rewards history
 */
export async function getUserRewards(userId: string): Promise<UserReward[]> {
  try {
    const { data, error } = await supabase
      .from('user_rewards')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching rewards:', error);
      return [];
    }

    return (data as UserReward[]) || [];
  } catch (error) {
    console.error('Error getting user rewards:', error);
    return [];
  }
}

/**
 * Unlock content for user
 */
export async function unlockContent(
  userId: string,
  contentType: 'theme' | 'game' | 'feature' | 'badge',
  contentKey: string
): Promise<boolean> {
  try {
    // Check if already unlocked
    const { data: existing } = await supabase
      .from('unlocked_content')
      .select('id')
      .eq('user_id', userId)
      .eq('content_type', contentType)
      .eq('content_key', contentKey)
      .maybeSingle();

    if (existing) {
      return false; // Already unlocked
    }

    const { error } = await supabase.from('unlocked_content').insert({
      user_id: userId,
      content_type: contentType,
      content_key: contentKey,
    });

    if (error) {
      console.error('Error unlocking content:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error unlocking content:', error);
    return false;
  }
}

/**
 * Get unlocked content for user
 */
export async function getUnlockedContent(userId: string) {
  try {
    const { data, error } = await supabase
      .from('unlocked_content')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) {
      console.error('Error fetching unlocked content:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting unlocked content:', error);
    return [];
  }
}

