import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SIZES } from '../../utils/theme';

export const StyleConsultantScreen = () => {
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');

  const styleAdvice = {
    confidence: [
      "Posture is key! Stand tall with shoulders back.",
      "Eye contact shows confidence and respect.",
      "A genuine smile is your best accessory.",
    ],
    grooming: [
      "Keep facial hair neat and well-maintained.",
      "Clean, short nails make a strong impression.",
      "Fresh haircut every 3-4 weeks keeps you sharp.",
    ],
    wardrobe: [
      "Fit is more important than brand - well-fitted clothes look expensive.",
      "Build a capsule wardrobe: 2-3 quality jeans, 5 solid shirts, 1blazer.",
      // FILE 10 CONTINUED: src/screens/premium/StyleConsultantScreen.tsx

      "Build a capsule wardrobe: 2-3 quality jeans, 5 solid t-shirts, 2 blazers.",
      "Invest in good shoes - they make or break an outfit.",
      "Dark colors are slimming and versatile.",
    ],
    occasions: {
      casual: "Well-fitted jeans + plain tee + clean sneakers = effortless style",
      business: "Tailored suit + crisp shirt + polished shoes = professional",
      date: "Smart casual + cologne + confidence = attractive",
    },
  };

  const getAIAdvice = async () => {
    if (!userInput.trim()) {
      Alert.alert('Please enter a question', 'Ask me about style, grooming, or confidence!');
      return;
    }

    setLoading(true);
    
    // Simulate AI response (would be OpenAI API in production)
    setTimeout(() => {
      const input = userInput.toLowerCase();
      let advice = '';

      if (input.includes('confident') || input.includes('confidence')) {
        advice = "🎯 Confidence Tips:\n\n" + 
          styleAdvice.confidence.map((tip, i) => `${i + 1}. ${tip}`).join('\n\n') +
          "\n\nRemember: True confidence comes from within. Your transformation journey is already proof of your strength!";
      } else if (input.includes('groom') || input.includes('hair') || input.includes('beard')) {
        advice = "✂️ Grooming Essentials:\n\n" +
          styleAdvice.grooming.map((tip, i) => `${i + 1}. ${tip}`).join('\n\n') +
          "\n\nGrooming shows self-respect. It's not vanity, it's self-care!";
      } else if (input.includes('clothes') || input.includes('outfit') || input.includes('wear')) {
        advice = "👔 Wardrobe Wisdom:\n\n" +
          styleAdvice.wardrobe.map((tip, i) => `${i + 1}. ${tip}`).join('\n\n') +
          "\n\nYou don't need a huge wardrobe. Quality over quantity always wins!";
      } else if (input.includes('date') || input.includes('interview') || input.includes('event')) {
        advice = "🎩 Occasion-Based Styling:\n\n" +
          Object.entries(styleAdvice.occasions)
            .map(([occasion, tip]) => `${occasion.toUpperCase()}: ${tip}`)
            .join('\n\n') +
          "\n\nDress for the occasion, but stay authentic to yourself!";
      } else {
        advice = "💼 General Style Advice:\n\n" +
          "1. Fit is EVERYTHING - even cheap clothes look good if they fit well\n\n" +
          "2. Build your style gradually - start with basics\n\n" +
          "3. Confidence is your best accessory\n\n" +
          "4. Stay clean and well-groomed\n\n" +
          "5. Dress for yourself, not for validation\n\n" +
          "Your transformation isn't just internal - let it show externally too! 🚀";
      }

      setResponse(advice);
      setLoading(false);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>👔 Style Consultant</Text>
        <Text style={styles.headerSubtitle}>AI-powered fashion & confidence advice</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Quick Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Quick Style Tips</Text>
          <View style={styles.tipRow}>
            <TouchableOpacity 
              style={styles.tipChip}
              onPress={() => {
                setUserInput('How can I look more confident?');
                getAIAdvice();
              }}
            >
              <Text style={styles.tipChipText}>Confidence</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.tipChip}
              onPress={() => {
                setUserInput('Grooming tips for men');
                getAIAdvice();
              }}
            >
              <Text style={styles.tipChipText}>Grooming</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.tipChip}
              onPress={() => {
                setUserInput('What should I wear?');
                getAIAdvice();
              }}
            >
              <Text style={styles.tipChipText}>Wardrobe</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Input */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Ask Your Style Question:</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., How can I dress better for work?"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={userInput}
            onChangeText={setUserInput}
            multiline
          />
          <TouchableOpacity 
            style={styles.askButton}
            onPress={getAIAdvice}
            disabled={loading}
          >
            <LinearGradient
              colors={['#6C5CE7', '#8E44AD']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.askGradient}
            >
              <Text style={styles.askText}>
                {loading ? '🤔 Thinking...' : '✨ Get AI Advice'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Response */}
        {response && (
          <View style={styles.responseCard}>
            <Text style={styles.responseTitle}>💬 AI Style Consultant Says:</Text>
            <Text style={styles.responseText}>{response}</Text>
          </View>
        )}

        {/* Example Questions */}
        {!response && (
          <View style={styles.examplesCard}>
            <Text style={styles.examplesTitle}>💭 Example Questions:</Text>
            {[
              'How can I look more confident?',
              'What should I wear on a date?',
              'Best grooming routine for men?',
              'How to build a basic wardrobe?',
              'Tips for job interviews?',
            ].map((question, index) => (
              <TouchableOpacity
                key={index}
                style={styles.exampleItem}
                onPress={() => setUserInput(question)}
              >
                <Text style={styles.exampleText}>• {question}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  scrollContent: {
    padding: 20,
  },
  tipsCard: {
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.3)',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  tipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tipChip: {
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tipChipText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  inputCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    padding: 12,
    color: '#FFF',
    fontSize: 14,
    minHeight: 80,
    marginBottom: 16,
  },
  askButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  askGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  askText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  responseCard: {
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.3)',
  },
  responseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  responseText: {
    fontSize: 14,
    color: '#FFF',
    lineHeight: 22,
  },
  examplesCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 12,
    padding: 20,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  exampleItem: {
    paddingVertical: 8,
  },
  exampleText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
});