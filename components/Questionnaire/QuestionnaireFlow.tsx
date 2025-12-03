import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useRouter } from 'expo-router';
import BasicQuestions from './BasicQuestions';
import ImpactQuestions from './ImpactQuestions';
import MotivationQuestions from './MotivationQuestions';
import SeverityQuestions from './SeverityQuestions';
import BehaviorSpecificQuestions from './BehaviorSpecificQuestions';
import { getQuestionsForHabit } from '../../data/questionTemplates';
import { Habit } from '../../types';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';

interface QuestionnaireFlowProps {
  habit: Habit;
  onComplete: (responses: Record<string, any>) => void;
  onSkip?: () => void;
}

export default function QuestionnaireFlow({ habit, onComplete, onSkip }: QuestionnaireFlowProps) {
  const theme = useTheme();
  const router = useRouter();
  const [currentCategory, setCurrentCategory] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});

  const questionSets = getQuestionsForHabit(habit.type);
  const categories = ['Basic', 'Impact', 'Motivation', 'Severity', 'Behavior Specific'];
  const currentSet = questionSets[currentCategory];

  const handleResponse = (questionKey: string, value: any) => {
    setResponses({
      ...responses,
      [questionKey]: value,
    });
  };

  const handleNext = () => {
    if (currentCategory < questionSets.length - 1) {
      setCurrentCategory(currentCategory + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentCategory > 0) {
      setCurrentCategory(currentCategory - 1);
    }
  };

  const handleComplete = () => {
    onComplete(responses);
  };

  const renderCategory = () => {
    const category = currentSet.category;
    const commonProps = {
      questions: currentSet.questions,
      responses: responses,
      onResponse: handleResponse,
    };

    switch (category) {
      case 'basic':
        return <BasicQuestions {...commonProps} />;
      case 'impact':
        return <ImpactQuestions {...commonProps} />;
      case 'motivation':
        return <MotivationQuestions {...commonProps} />;
      case 'severity':
        return <SeverityQuestions {...commonProps} />;
      case 'behavior_specific':
        return <BehaviorSpecificQuestions {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.base.background }} edges={['top']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <View className="mb-6">
          <Text style={{ color: theme.text.primary }} className="text-2xl font-bold mb-2">
            Tell us about your habit
          </Text>
          <Text style={{ color: theme.text.secondary }} className="text-sm">
            {categories[currentCategory]} ({currentCategory + 1} of {categories.length})
          </Text>
        </View>

        {/* Progress Indicator */}
        <View className="mb-6">
          <View className="flex-row">
            {categories.map((_, index) => (
              <View
                key={index}
                style={{
                  flex: 1,
                  height: 4,
                  backgroundColor: index <= currentCategory ? theme.primary : theme.base.border,
                  marginRight: index < categories.length - 1 ? 4 : 0,
                }}
              />
            ))}
          </View>
        </View>

        {renderCategory()}

        <View className="flex-row justify-between mt-6">
          <TouchableOpacity
            onPress={handleBack}
            disabled={currentCategory === 0}
            style={{
              backgroundColor: currentCategory === 0 ? theme.base.surface : theme.base.card,
              borderColor: theme.base.border,
              borderWidth: 2,
            }}
            className="px-6 py-3 rounded-xl flex-row items-center"
          >
            <ArrowLeft
              size={20}
              color={currentCategory === 0 ? theme.text.tertiary : theme.text.primary}
            />
            <Text
              style={{
                color: currentCategory === 0 ? theme.text.tertiary : theme.text.primary,
              }}
              className="ml-2 font-medium"
            >
              Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            style={{ backgroundColor: theme.primary }}
            className="px-6 py-3 rounded-xl flex-row items-center"
          >
            <Text style={{ color: theme.text.inverse }} className="mr-2 font-medium">
              {currentCategory === questionSets.length - 1 ? 'Complete' : 'Next'}
            </Text>
            <ArrowRight size={20} color={theme.text.inverse} />
          </TouchableOpacity>
        </View>

        {onSkip && (
          <TouchableOpacity onPress={onSkip} className="mt-4 items-center">
            <Text style={{ color: theme.text.tertiary }} className="text-sm">
              Skip for now
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

