export interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
  instructions: string[];
  benefits: string[];
}

export const HABIT_EXERCISES: Record<string, Exercise[]> = {
  pornography: [
    {
      id: 'cold_shower',
      title: 'Cold Shower Challenge',
      description: 'Take a 5-minute cold shower to reset your brain chemistry',
      duration: '5 mins',
      difficulty: 'hard',
      icon: '🚿',
      instructions: [
        'Start with warm water for 1 minute',
        'Gradually decrease temperature',
        'Endure cold water for 3 minutes',
        'Focus on deep breathing',
        'End with 30 seconds of warm water',
      ],
      benefits: [
        'Releases dopamine naturally',
        'Builds mental toughness',
        'Reduces sexual urges immediately',
        'Improves mood and energy',
      ],
    },
    {
      id: 'push_ups',
      title: 'Emergency Push-Ups',
      description: 'Do push-ups until failure to redirect your energy',
      duration: '3-5 mins',
      difficulty: 'medium',
      icon: '💪',
      instructions: [
        'Drop and do push-ups immediately',
        'Go until you can\'t do anymore',
        'Rest 30 seconds',
        'Do another set',
        'Repeat 3 times total',
      ],
      benefits: [
        'Redirects sexual energy',
        'Releases tension',
        'Builds physical strength',
        'Creates new neural pathways',
      ],
    },
    {
      id: 'meditation',
      title: 'Urge Surfing Meditation',
      description: 'Observe your urges without acting on them',
      duration: '10 mins',
      difficulty: 'easy',
      icon: '🧘',
      instructions: [
        'Sit comfortably and close your eyes',
        'Notice the urge without judging it',
        'Imagine the urge as a wave',
        'Watch it rise and fall',
        'Breathe deeply throughout',
      ],
      benefits: [
        'Increases self-control',
        'Reduces urge intensity',
        'Builds mindfulness',
        'Long-term resilience',
      ],
    },
    {
      id: 'walk',
      title: 'Quick Walk Outside',
      description: 'Go for a brisk 15-minute walk in fresh air',
      duration: '15 mins',
      difficulty: 'easy',
      icon: '🚶',
      instructions: [
        'Put on shoes immediately',
        'Leave your phone behind',
        'Walk briskly for 15 minutes',
        'Notice your surroundings',
        'Take deep breaths',
      ],
      benefits: [
        'Breaks the cycle',
        'Fresh air clears mind',
        'Produces endorphins',
        'Changes environment',
      ],
    },
  ],
  smoking: [
    {
      id: 'breathing_exercise',
      title: 'Deep Breathing Exercise',
      description: 'Replace smoking with deep breathing',
      duration: '5 mins',
      difficulty: 'easy',
      icon: '💨',
      instructions: [
        'Inhale deeply for 4 seconds',
        'Hold for 4 seconds',
        'Exhale slowly for 6 seconds',
        'Repeat 10 times',
        'Focus on the sensation',
      ],
      benefits: [
        'Satisfies oral fixation',
        'Reduces anxiety',
        'Improves lung function',
        'Calms nervous system',
      ],
    },
    {
      id: 'water',
      title: 'Drink Cold Water',
      description: 'Drink a full glass of cold water slowly',
      duration: '2 mins',
      difficulty: 'easy',
      icon: '💧',
      instructions: [
        'Fill a large glass with cold water',
        'Sip slowly',
        'Hold each sip in your mouth',
        'Focus on the sensation',
        'Finish the entire glass',
      ],
      benefits: [
        'Occupies your hands and mouth',
        'Hydrates your body',
        'Breaks the routine',
        'Zero calories',
      ],
    },
    {
      id: 'chewing_gum',
      title: 'Chew Sugar-Free Gum',
      description: 'Keep your mouth busy with gum',
      duration: '10 mins',
      difficulty: 'easy',
      icon: '🍬',
      instructions: [
        'Chew sugar-free gum',
        'Focus on the flavor',
        'Breathe deeply while chewing',
        'Keep gum with you always',
        'Replace smoking breaks with gum',
      ],
      benefits: [
        'Oral satisfaction',
        'Reduces cravings',
        'Freshens breath',
        'Affordable alternative',
      ],
    },
  ],
  alcohol: [
    {
      id: 'mocktail',
      title: 'Make a Fancy Mocktail',
      description: 'Create a delicious non-alcoholic drink',
      duration: '10 mins',
      difficulty: 'easy',
      icon: '🍹',
      instructions: [
        'Use sparkling water as base',
        'Add fresh fruit (lemon, lime, berries)',
        'Add mint or herbs',
        'Serve in a nice glass with ice',
        'Take your time enjoying it',
      ],
      benefits: [
        'Satisfies ritual',
        'Hydrating',
        'Healthy alternative',
        'Social acceptance',
      ],
    },
    {
      id: 'call_friend',
      title: 'Call a Sober Friend',
      description: 'Talk to someone who supports your sobriety',
      duration: '15 mins',
      difficulty: 'easy',
      icon: '📞',
      instructions: [
        'Call your accountability partner',
        'Be honest about how you feel',
        'Ask for support',
        'Make plans to meet up',
        'Thank them for listening',
      ],
      benefits: [
        'Social support',
        'Breaks isolation',
        'Accountability',
        'Emotional release',
      ],
    },
  ],
  gaming: [
    {
      id: 'outdoor_activity',
      title: 'Go Outside for 20 Minutes',
      description: 'Replace screen time with real world activity',
      duration: '20 mins',
      difficulty: 'easy',
      icon: '🌳',
      instructions: [
        'Turn off all screens',
        'Go outside immediately',
        'Walk, run, or just sit',
        'Notice nature around you',
        'Stay outside full 20 minutes',
      ],
      benefits: [
        'Breaks gaming cycle',
        'Vitamin D from sunlight',
        'Physical activity',
        'Mental refresh',
      ],
    },
    {
      id: 'productive_task',
      title: 'Complete One Productive Task',
      description: 'Do something that moves your life forward',
      duration: '30 mins',
      difficulty: 'medium',
      icon: '✅',
      instructions: [
        'Choose one task you\'ve been avoiding',
        'Set a 30-minute timer',
        'Focus only on that task',
        'Complete it or make progress',
        'Reward yourself after',
      ],
      benefits: [
        'Sense of accomplishment',
        'Builds productivity',
        'Breaks gaming patterns',
        'Long-term fulfillment',
      ],
    },
  ],
  social_media: [
    {
      id: 'phone_away',
      title: 'Phone in Another Room',
      description: 'Physical distance from your device',
      duration: '1 hour',
      difficulty: 'medium',
      icon: '📵',
      instructions: [
        'Put phone in another room',
        'Set a 1-hour timer',
        'Do an offline activity',
        'Notice how you feel',
        'Gradually increase duration',
      ],
      benefits: [
        'Breaks compulsion',
        'Reduces anxiety',
        'Improves focus',
        'Healthier habits',
      ],
    },
    {
      id: 'read_book',
      title: 'Read Physical Book',
      description: 'Replace scrolling with reading',
      duration: '30 mins',
      difficulty: 'easy',
      icon: '📚',
      instructions: [
        'Pick up a physical book',
        'Read for 30 minutes',
        'No phone nearby',
        'Focus on the story',
        'Track pages read',
      ],
      benefits: [
        'Deeper focus',
        'Knowledge gain',
        'Reduced anxiety',
        'Better sleep',
      ],
    },
  ],
};

// Get exercises for a specific habit
export const getExercisesForHabit = (habitType: string): Exercise[] => {
  return HABIT_EXERCISES[habitType] || [];
};

// Get a random exercise
export const getRandomExercise = (habitType: string): Exercise | null => {
  const exercises = getExercisesForHabit(habitType);
  if (exercises.length === 0) return null;
  return exercises[Math.floor(Math.random() * exercises.length)];
};