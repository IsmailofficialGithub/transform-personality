import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Habit } from '../types';
import { AlertCircle, Clock, Heart, Brain, Target } from 'lucide-react-native';

interface UrgeBlockerProps {
  habit: Habit;
  visible: boolean;
  onClose: () => void;
}

export default function UrgeBlocker({ habit, visible, onClose }: UrgeBlockerProps) {
  const theme = useTheme();
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const tools = [
    {
      id: 'timer',
      title: 'Urge Timer',
      icon: Clock,
      description: 'Wait it out - urges typically pass in 5-15 minutes',
      content: 'Set a timer for 15 minutes. The urge will pass.',
    },
    {
      id: 'breathing',
      title: 'Breathing Exercise',
      icon: Heart,
      description: '4-7-8 breathing technique',
      content: 'Inhale for 4 seconds, hold for 7, exhale for 8. Repeat 4 times.',
    },
    {
      id: 'grounding',
      title: '5-4-3-2-1 Grounding',
      icon: Brain,
      description: 'Ground yourself in the present moment',
      content: 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.',
    },
    {
      id: 'motivation',
      title: 'Your Why',
      icon: Target,
      description: 'Remember your reasons for quitting',
      content: 'Why did you want to quit? What would success look like?',
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ backgroundColor: 'rgba(0,0,0,0.7)' }} className="flex-1 justify-center items-center p-4">
        <View
          style={{ backgroundColor: theme.base.background }}
          className="rounded-3xl w-full max-w-md"
        >
          <View className="p-6">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <AlertCircle size={24} color={theme.status.error} />
                <Text style={{ color: theme.text.primary }} className="text-xl font-bold ml-2">
                  Urge Blocker
                </Text>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Text style={{ color: theme.text.secondary }} className="text-lg font-bold">
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={{ color: theme.text.secondary }} className="text-sm mb-4">
              Choose an emergency tool to help you through this moment
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} className="max-h-96">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <TouchableOpacity
                    key={tool.id}
                    onPress={() => setSelectedTool(selectedTool === tool.id ? null : tool.id)}
                    style={{
                      backgroundColor: selectedTool === tool.id ? theme.primary + '20' : theme.base.card,
                      borderColor: selectedTool === tool.id ? theme.primary : theme.base.border,
                      borderWidth: 2,
                    }}
                    className="p-4 rounded-xl mb-3"
                  >
                    <View className="flex-row items-center mb-2">
                      <Icon size={20} color={theme.primary} />
                      <Text style={{ color: theme.text.primary }} className="font-bold ml-2">
                        {tool.title}
                      </Text>
                    </View>
                    <Text style={{ color: theme.text.secondary }} className="text-xs mb-2">
                      {tool.description}
                    </Text>
                    {selectedTool === tool.id && (
                      <View
                        style={{ backgroundColor: theme.base.surface }}
                        className="p-3 rounded-lg mt-2"
                      >
                        <Text style={{ color: theme.text.primary }} className="text-sm">
                          {tool.content}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              onPress={onClose}
              style={{ backgroundColor: theme.status.success }}
              className="p-4 rounded-xl items-center mt-4"
            >
              <Text style={{ color: theme.text.inverse }} className="font-bold">
                I've Got This
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

