import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Habit } from '../types';
import { calculateDaysClean } from '../services/streakService';
import { DollarSign } from 'lucide-react-native';

interface FinancialTrackerProps {
  habit: Habit;
}

const COST_PER_UNIT: Record<string, number> = {
  smoking: 10, // per pack
  gambling: 50, // average per session
  alcohol: 20, // average per day
  overspending: 30, // average daily overspending
};

export default function FinancialTracker({ habit }: FinancialTrackerProps) {
  const theme = useTheme();
  const [moneySaved, setMoneySaved] = useState(0);

  useEffect(() => {
    calculateSavings();
  }, [habit]);

  function calculateSavings() {
    const daysClean = calculateDaysClean(habit.quit_date);
    const dailyCost = COST_PER_UNIT[habit.type] || 0;
    
    if (dailyCost > 0) {
      const saved = daysClean * dailyCost;
      setMoneySaved(saved);
    }
  }

  if (!COST_PER_UNIT[habit.type] || moneySaved === 0) {
    return null;
  }

  return (
    <View
      style={{ backgroundColor: theme.base.card, borderColor: theme.base.border }}
      className="p-4 rounded-xl border mb-3"
    >
      <View className="flex-row items-center mb-2">
        <DollarSign size={20} color={theme.status.success} />
        <Text style={{ color: theme.text.primary }} className="text-lg font-bold ml-2">
          Money Saved
        </Text>
      </View>
      <Text style={{ color: theme.status.success }} className="text-3xl font-bold">
        ${moneySaved.toLocaleString()}
      </Text>
      <Text style={{ color: theme.text.secondary }} className="text-sm mt-1">
        Since you quit {habit.name}
      </Text>
    </View>
  );
}

