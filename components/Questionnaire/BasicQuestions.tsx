import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Question } from '../../data/questionTemplates';

interface BasicQuestionsProps {
  questions: Question[];
  responses: Record<string, any>;
  onResponse: (key: string, value: any) => void;
}

export default function BasicQuestions({ questions, responses, onResponse }: BasicQuestionsProps) {
  const theme = useTheme();

  const renderQuestion = (question: Question) => {
    const value = responses[question.key];

    switch (question.type) {
      case 'select':
        return (
          <View key={question.key} className="mb-6">
            <Text style={{ color: theme.text.primary }} className="text-base font-medium mb-3">
              {question.question}
              {question.required && <Text style={{ color: theme.status.error }}> *</Text>}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row">
                {question.options?.map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => onResponse(question.key, option)}
                    style={{
                      backgroundColor: value === option ? theme.primary : theme.base.card,
                      borderColor: value === option ? theme.primary : theme.base.border,
                      borderWidth: 2,
                    }}
                    className="px-4 py-3 rounded-xl mr-2"
                  >
                    <Text
                      style={{
                        color: value === option ? theme.text.inverse : theme.text.primary,
                      }}
                      className="font-medium"
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        );

      case 'multiselect':
        const selectedValues = value || [];
        return (
          <View key={question.key} className="mb-6">
            <Text style={{ color: theme.text.primary }} className="text-base font-medium mb-3">
              {question.question}
              {question.required && <Text style={{ color: theme.status.error }}> *</Text>}
            </Text>
            <View className="flex-row flex-wrap">
              {question.options?.map((option) => {
                const isSelected = selectedValues.includes(option);
                return (
                  <TouchableOpacity
                    key={option}
                    onPress={() => {
                      const newValues = isSelected
                        ? selectedValues.filter((v: string) => v !== option)
                        : [...selectedValues, option];
                      onResponse(question.key, newValues);
                    }}
                    style={{
                      backgroundColor: isSelected ? theme.primary : theme.base.card,
                      borderColor: isSelected ? theme.primary : theme.base.border,
                      borderWidth: 2,
                    }}
                    className="px-4 py-2 rounded-xl mr-2 mb-2"
                  >
                    <Text
                      style={{
                        color: isSelected ? theme.text.inverse : theme.text.primary,
                      }}
                      className="font-medium text-sm"
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 'textarea':
        return (
          <View key={question.key} className="mb-6">
            <Text style={{ color: theme.text.primary }} className="text-base font-medium mb-3">
              {question.question}
              {question.required && <Text style={{ color: theme.status.error }}> *</Text>}
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.base.card,
                borderColor: theme.base.border,
                color: theme.text.primary,
              }}
              className="p-3 rounded-xl border-2 min-h-[100px]"
              placeholder={question.placeholder}
              placeholderTextColor={theme.text.tertiary}
              value={value || ''}
              onChangeText={(text) => onResponse(question.key, text)}
              multiline
              numberOfLines={4}
            />
          </View>
        );

      default:
        return null;
    }
  };

  return <View>{questions.map((q) => renderQuestion(q))}</View>;
}

