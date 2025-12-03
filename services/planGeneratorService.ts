import { supabase } from './supabase';
import { QuitPlan, DailyRoutine, Challenge, PersonalizedTask, QuestionnaireResponse } from '../types';

interface QuestionnaireAnswers {
  [key: string]: any;
}

export async function generateQuitPlan(
  userId: string,
  habitId: string,
  habitType: string,
  answers: QuestionnaireAnswers
): Promise<QuitPlan | null> {
  try {
    // Analyze questionnaire responses
    const highRiskTimes = extractHighRiskTimes(answers);
    const highRiskPlaces = extractHighRiskPlaces(answers);
    const severity = answers.craving_strength || 5;

    // Create quit plan
    const { data: plan, error } = await supabase
      .from('quit_plans')
      .insert({
        user_id: userId,
        habit_id: habitId,
        plan_name: `Personalized Plan for ${habitType}`,
        plan_description: generatePlanDescription(answers, habitType),
        high_risk_times: highRiskTimes,
        high_risk_places: highRiskPlaces,
        is_active: true,
      })
      .select()
      .single();

    if (error || !plan) {
      console.error('Error creating quit plan:', error);
      return null;
    }

    // Generate daily routines
    await generateDailyRoutines(plan.id, answers, habitType);

    // Generate challenges
    await generateChallenges(plan.id, habitType, severity, answers);

    // Generate personalized tasks
    await generatePersonalizedTasks(plan.id, answers, habitType);

    return plan as QuitPlan;
  } catch (error) {
    console.error('Error generating quit plan:', error);
    return null;
  }
}

function extractHighRiskTimes(answers: QuestionnaireAnswers): string[] {
  return answers.struggle_time || [];
}

function extractHighRiskPlaces(answers: QuestionnaireAnswers): string[] {
  const triggerText = answers.trigger_situations?.toLowerCase() || '';
  const places: string[] = [];
  
  if (triggerText.includes('home')) places.push('Home');
  if (triggerText.includes('work') || triggerText.includes('office')) places.push('Work');
  if (triggerText.includes('car') || triggerText.includes('vehicle')) places.push('Car');
  if (triggerText.includes('social') || triggerText.includes('party')) places.push('Social Events');
  
  return places.length > 0 ? places : ['Various'];
}

function generatePlanDescription(answers: QuestionnaireAnswers, habitType: string): string {
  const whyQuit = answers.why_quit || 'To improve their life';
  const challenge = answers.biggest_challenge || 'overcoming cravings';
  
  return `This personalized plan focuses on ${challenge}. Your main motivation: ${whyQuit.substring(0, 100)}...`;
}

async function generateDailyRoutines(planId: string, answers: QuestionnaireAnswers, habitType: string) {
  const routines: Partial<DailyRoutine>[] = [
    {
      plan_id: planId,
      routine_type: 'morning',
      task_title: 'Morning Reflection',
      task_description: 'Take 5 minutes to reflect on your goals and set intentions for the day',
      task_type: 'reflection',
      scheduled_time: '08:00:00',
      order_index: 1,
      is_active: true,
    },
    {
      plan_id: planId,
      routine_type: 'midday',
      task_title: 'Mid-day Check-in',
      task_description: 'Check in with yourself about cravings and triggers',
      task_type: 'check_in',
      scheduled_time: '14:00:00',
      order_index: 1,
      is_active: true,
    },
    {
      plan_id: planId,
      routine_type: 'evening',
      task_title: 'Evening Summary',
      task_description: 'Review your day and celebrate successes',
      task_type: 'reflection',
      scheduled_time: '20:00:00',
      order_index: 1,
      is_active: true,
    },
  ];

  await supabase.from('daily_routines').insert(routines);
}

async function generateChallenges(
  planId: string,
  habitType: string,
  severity: number,
  answers: QuestionnaireAnswers
) {
  const challenges: Partial<Challenge>[] = [];

  // 7-day detox challenge
  challenges.push({
    plan_id: planId,
    challenge_name: '7-Day Detox',
    challenge_description: 'Complete your first week without engaging in the habit',
    challenge_type: 'detox',
    duration_days: 7,
    is_completed: false,
    progress_percentage: 0,
  });

  // Trigger resistance challenge
  if (answers.trigger_situations) {
    challenges.push({
      plan_id: planId,
      challenge_name: 'Trigger Resistance Challenge',
      challenge_description: 'Successfully resist triggers for 14 days',
      challenge_type: 'trigger_resistance',
      duration_days: 14,
      is_completed: false,
      progress_percentage: 0,
    });
  }

  // Device limit challenge for digital habits
  if (['gaming_addiction', 'pornography_addiction', 'social_media_overuse'].includes(habitType)) {
    challenges.push({
      plan_id: planId,
      challenge_name: 'No Device After 10 PM',
      challenge_description: 'Avoid using devices after 10 PM for 30 days',
      challenge_type: 'device_limit',
      duration_days: 30,
      is_completed: false,
      progress_percentage: 0,
    });
  }

  // Money saving challenge
  if (['gambling', 'smoking', 'overspending'].includes(habitType)) {
    challenges.push({
      plan_id: planId,
      challenge_name: 'Money Saving Challenge',
      challenge_description: 'Track and save money that would have been spent',
      challenge_type: 'money_saving',
      duration_days: 30,
      is_completed: false,
      progress_percentage: 0,
    });
  }

  if (challenges.length > 0) {
    await supabase.from('challenges').insert(challenges);
  }
}

async function generatePersonalizedTasks(
  planId: string,
  answers: QuestionnaireAnswers,
  habitType: string
) {
  const tasks: Partial<PersonalizedTask>[] = [];

  // Replacement activities based on triggers
  if (answers.boredom_trigger) {
    tasks.push({
      plan_id: planId,
      task_title: 'Boredom Buster List',
      task_description: 'Create and use a list of engaging activities for when boredom strikes',
      task_category: 'replacement_activity',
      estimated_minutes: 5,
      order_index: 1,
    });
  }

  // Breathing exercises
  tasks.push({
    plan_id: planId,
    task_title: '5-Minute Breathing Exercise',
    task_description: 'Practice deep breathing when cravings hit',
    task_category: 'breathing',
    estimated_minutes: 5,
    order_index: 2,
  });

  // Journaling prompts
  if (answers.why_quit) {
    tasks.push({
      plan_id: planId,
      task_title: 'Motivation Journal',
      task_description: `Write about: ${answers.why_quit.substring(0, 50)}...`,
      task_category: 'journaling',
      estimated_minutes: 10,
      order_index: 3,
    });
  }

  // Stress relief
  if (answers.stress_smoking || answers.emotional_eating || answers.emotional_spending) {
    tasks.push({
      plan_id: planId,
      task_title: 'Stress Relief Technique',
      task_description: 'Practice stress management when feeling overwhelmed',
      task_category: 'stress_relief',
      estimated_minutes: 15,
      order_index: 4,
    });
  }

  if (tasks.length > 0) {
    await supabase.from('personalized_tasks').insert(tasks);
  }
}

export async function saveQuestionnaireResponses(
  userId: string,
  habitId: string,
  responses: QuestionnaireAnswers
): Promise<boolean> {
  try {
    const questionSets = [
      { category: 'basic', questions: ['habit_duration', 'frequency', 'struggle_time', 'trigger_situations'] },
      { category: 'impact', questions: ['health_impact', 'relationship_impact', 'work_impact'] },
      { category: 'motivation', questions: ['why_quit', 'biggest_challenge', 'success_looks_like'] },
      { category: 'severity', questions: ['tried_quitting', 'relapse_reason', 'craving_strength'] },
    ];

    const recordsToInsert: any[] = [];

    for (const set of questionSets) {
      for (const questionKey of set.questions) {
        const value = responses[questionKey];
        if (value !== undefined && value !== null && value !== '') {
          recordsToInsert.push({
            user_id: userId,
            habit_id: habitId,
            question_category: set.category,
            question_key: questionKey,
            question_text: questionKey.replace(/_/g, ' '),
            response_text: typeof value === 'string' ? value : null,
            response_number: typeof value === 'number' ? value : null,
            response_array: Array.isArray(value) ? value : null,
          });
        }
      }
    }

    if (recordsToInsert.length > 0) {
      const { error } = await supabase.from('questionnaire_responses').upsert(recordsToInsert, {
        onConflict: 'habit_id,question_category,question_key',
      });

      if (error) {
        console.error('Error saving questionnaire responses:', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in saveQuestionnaireResponses:', error);
    return false;
  }
}

