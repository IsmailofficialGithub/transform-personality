export interface Question {
  key: string;
  question: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'multiselect' | 'scale';
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

export interface QuestionSet {
  category: string;
  questions: Question[];
}

export const BASIC_QUESTIONS: Question[] = [
  {
    key: 'habit_duration',
    question: 'How long have you had this habit?',
    type: 'select',
    options: ['Less than 1 month', '1-3 months', '3-6 months', '6-12 months', '1-2 years', '2-5 years', 'More than 5 years'],
    required: true,
  },
  {
    key: 'frequency',
    question: 'How often do you engage in this habit?',
    type: 'select',
    options: ['Multiple times per day', 'Once per day', 'Few times per week', 'Once per week', 'Few times per month', 'Occasionally'],
    required: true,
  },
  {
    key: 'struggle_time',
    question: 'What time of day do you struggle the most?',
    type: 'multiselect',
    options: ['Morning (5am-12pm)', 'Afternoon (12pm-5pm)', 'Evening (5pm-9pm)', 'Night (9pm-5am)'],
    required: true,
  },
  {
    key: 'trigger_situations',
    question: 'What situations typically trigger this habit?',
    type: 'textarea',
    placeholder: 'Describe common trigger situations...',
    required: true,
  },
];

export const IMPACT_QUESTIONS: Question[] = [
  {
    key: 'health_impact',
    question: 'How is this habit affecting your health?',
    type: 'scale',
    placeholder: 'Rate 1-10 where 1 is no impact and 10 is severe impact',
    required: true,
  },
  {
    key: 'relationship_impact',
    question: 'How is this habit affecting your relationships?',
    type: 'scale',
    placeholder: 'Rate 1-10',
    required: true,
  },
  {
    key: 'work_impact',
    question: 'How is this habit affecting your work or school?',
    type: 'scale',
    placeholder: 'Rate 1-10',
    required: true,
  },
];

export const MOTIVATION_QUESTIONS: Question[] = [
  {
    key: 'why_quit',
    question: 'Why do you want to quit?',
    type: 'textarea',
    placeholder: 'List your main reasons...',
    required: true,
  },
  {
    key: 'biggest_challenge',
    question: 'What is the biggest challenge for you?',
    type: 'textarea',
    placeholder: 'Describe your main challenge...',
    required: true,
  },
  {
    key: 'success_looks_like',
    question: 'What would success look like for you?',
    type: 'textarea',
    placeholder: 'Describe your vision of success...',
    required: true,
  },
];

export const SEVERITY_QUESTIONS: Question[] = [
  {
    key: 'tried_quitting',
    question: 'Have you tried quitting before?',
    type: 'select',
    options: ['No, this is my first attempt', 'Yes, once', 'Yes, 2-3 times', 'Yes, many times'],
    required: true,
  },
  {
    key: 'relapse_reason',
    question: 'What made you relapse previously? (if applicable)',
    type: 'textarea',
    placeholder: 'If you tried before, what led to relapse?',
    required: false,
  },
  {
    key: 'craving_strength',
    question: 'How strong are your cravings on a scale of 1-10?',
    type: 'number',
    placeholder: 'Enter a number between 1-10',
    required: true,
  },
];

export const HABIT_SPECIFIC_QUESTIONS: Record<string, Question[]> = {
  smoking: [
    {
      key: 'morning_urge',
      question: 'Do you experience strong morning urges?',
      type: 'select',
      options: ['Always', 'Often', 'Sometimes', 'Rarely', 'Never'],
    },
    {
      key: 'stress_smoking',
      question: 'Do you smoke more when stressed?',
      type: 'select',
      options: ['Yes, significantly more', 'Yes, somewhat more', 'No difference', 'Not applicable'],
    },
    {
      key: 'social_smoking',
      question: 'Do you smoke in social situations?',
      type: 'select',
      options: ['Always', 'Often', 'Sometimes', 'Rarely', 'Never'],
    },
  ],
  gambling: [
    {
      key: 'gambling_type',
      question: 'Where do you primarily gamble?',
      type: 'multiselect',
      options: ['Online', 'Casino', 'Sports betting', 'Lottery/Scratch cards', 'Poker games', 'Other'],
    },
    {
      key: 'financial_triggers',
      question: 'What financial situations trigger gambling?',
      type: 'textarea',
      placeholder: 'Describe financial triggers...',
    },
  ],
  pornography_addiction: [
    {
      key: 'boredom_trigger',
      question: 'Do you engage when feeling bored?',
      type: 'select',
      options: ['Always', 'Often', 'Sometimes', 'Rarely', 'Never'],
    },
    {
      key: 'loneliness_trigger',
      question: 'Do you engage when feeling lonely?',
      type: 'select',
      options: ['Always', 'Often', 'Sometimes', 'Rarely', 'Never'],
    },
    {
      key: 'digital_patterns',
      question: 'What devices or platforms do you use?',
      type: 'multiselect',
      options: ['Phone', 'Computer', 'Tablet', 'Other'],
    },
  ],
  substance_abuse: [
    {
      key: 'weekend_pattern',
      question: 'Do you use more on weekends?',
      type: 'select',
      options: ['Yes, significantly more', 'Yes, somewhat more', 'No difference', 'Not applicable'],
    },
    {
      key: 'peer_influence',
      question: 'Are you influenced by peers or social situations?',
      type: 'select',
      options: ['Very much', 'Somewhat', 'Not really', 'Not at all'],
    },
  ],
  gaming_addiction: [
    {
      key: 'late_night_sessions',
      question: 'Do you play late into the night?',
      type: 'select',
      options: ['Every night', 'Most nights', 'Sometimes', 'Rarely', 'Never'],
    },
    {
      key: 'competitive_triggers',
      question: 'Are you triggered by competitive aspects?',
      type: 'select',
      options: ['Very much', 'Somewhat', 'Not really', 'Not at all'],
    },
  ],
  junk_food: [
    {
      key: 'emotional_eating',
      question: 'Do you eat when stressed or emotional?',
      type: 'select',
      options: ['Always', 'Often', 'Sometimes', 'Rarely', 'Never'],
    },
    {
      key: 'meal_skipping',
      question: 'Do you skip meals and then overeat?',
      type: 'select',
      options: ['Yes, frequently', 'Yes, sometimes', 'Rarely', 'Never'],
    },
  ],
  overspending: [
    {
      key: 'impulse_buying',
      question: 'How often do you make impulse purchases?',
      type: 'select',
      options: ['Daily', 'Several times per week', 'Weekly', 'Monthly', 'Rarely'],
    },
    {
      key: 'emotional_spending',
      question: 'Do you shop when feeling emotional?',
      type: 'select',
      options: ['Always', 'Often', 'Sometimes', 'Rarely', 'Never'],
    },
  ],
};

export function getQuestionsForHabit(habitType: string): QuestionSet[] {
  return [
    { category: 'basic', questions: BASIC_QUESTIONS },
    { category: 'impact', questions: IMPACT_QUESTIONS },
    { category: 'motivation', questions: MOTIVATION_QUESTIONS },
    { category: 'severity', questions: SEVERITY_QUESTIONS },
    {
      category: 'behavior_specific',
      questions: HABIT_SPECIFIC_QUESTIONS[habitType] || [],
    },
  ];
}

