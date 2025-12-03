import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Question } from '../../data/questionTemplates';

interface ImpactQuestionsProps {
  questions: Question[];
  responses: Record<string, any>;
  onResponse: (key: string, value: any) => void;
}

export default function ImpactQuestions({ questions, responses, onResponse }: ImpactQuestionsProps) {
  const theme = useTheme();

  return (
    <View>
      {questions.map((question) => {
        const value = responses[question.key] || 0;
        return (
          <View key={question.key} className="mb-6">
            <Text style={{ color: theme.text.primary }} className="text-base font-medium mb-3">
              {question.question}
              {question.required && <Text style={{ color: theme.status.error }}> *</Text>}
            </Text>
            <Text style={{ color: theme.text.secondary }} className="text-xs mb-3">
              {question.placeholder}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <TouchableOpacity
                    key={num}
                    onPress={() => onResponse(question.key, num)}
                    style={{
                      backgroundColor: value === num ? theme.primary : theme.base.card,
                      borderColor: value === num ? theme.primary : theme.base.border,
                      borderWidth: 2,
                    }}
                    className="w-12 h-12 rounded-full items-center justify-center mr-2"
                  >
                    <Text
                      style={{
                        color: value === num ? theme.text.inverse : theme.text.primary,
                      }}
                      className="font-bold"
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        );
      })}
    </View>
  );
}

