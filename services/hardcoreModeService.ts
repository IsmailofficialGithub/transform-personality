import { supabase } from './supabase';
import { HardcoreModeSettings } from '../types';

export async function getHardcoreModeSettings(
  habitId: string
): Promise<HardcoreModeSettings | null> {
  try {
    const { data, error } = await supabase
      .from('hardcore_mode_settings')
      .select('*')
      .eq('habit_id', habitId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching hardcore mode settings:', error);
      return null;
    }

    return data as HardcoreModeSettings | null;
  } catch (error) {
    console.error('Error in getHardcoreModeSettings:', error);
    return null;
  }
}

export async function enableHardcoreMode(
  userId: string,
  habitId: string,
  settings: Partial<HardcoreModeSettings>
): Promise<boolean> {
  try {
    const { error } = await supabase.from('hardcore_mode_settings').upsert({
      habit_id: habitId,
      user_id: userId,
      zero_tolerance_enabled: settings.zero_tolerance_enabled ?? true,
      mandatory_checkin_enabled: settings.mandatory_checkin_enabled ?? true,
      checkin_deadline: settings.checkin_deadline || '23:59:59',
      feature_lock_enabled: settings.feature_lock_enabled ?? true,
      locked_features: settings.locked_features || [],
      random_tasks_enabled: settings.random_tasks_enabled ?? false,
      accountability_partner_enabled: settings.accountability_partner_enabled ?? false,
      accountability_partner_id: settings.accountability_partner_id || null,
    });

    if (error) {
      console.error('Error enabling hardcore mode:', error);
      return false;
    }

    // Update habit to mark hardcore mode enabled
    await supabase
      .from('habits')
      .update({ hardcore_mode: true })
      .eq('id', habitId);

    return true;
  } catch (error) {
    console.error('Error in enableHardcoreMode:', error);
    return false;
  }
}

export async function disableHardcoreMode(habitId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('hardcore_mode_settings')
      .delete()
      .eq('habit_id', habitId);

    if (error) {
      console.error('Error disabling hardcore mode:', error);
      return false;
    }

    await supabase.from('habits').update({ hardcore_mode: false }).eq('id', habitId);

    return true;
  } catch (error) {
    console.error('Error in disableHardcoreMode:', error);
    return false;
  }
}

export async function checkMandatoryCheckIn(habitId: string, userId: string): Promise<boolean> {
  try {
    const settings = await getHardcoreModeSettings(habitId);
    if (!settings?.mandatory_checkin_enabled) return true;

    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('habit_checkins')
      .select('id')
      .eq('habit_id', habitId)
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    return !!data;
  } catch (error) {
    console.error('Error checking mandatory check-in:', error);
    return false;
  }
}

export function isFeatureLocked(settings: HardcoreModeSettings | null, feature: string): boolean {
  if (!settings?.feature_lock_enabled) return false;
  return settings.locked_features?.includes(feature) ?? false;
}

export async function checkZeroTolerance(habitId: string, userId: string): Promise<boolean> {
  try {
    const settings = await getHardcoreModeSettings(habitId);
    if (!settings?.zero_tolerance_enabled) return true;

    // Check if there was a relapse today
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('habit_checkins')
      .select('status')
      .eq('habit_id', habitId)
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    if (data?.status === 'relapse') {
      return false; // Zero tolerance violated
    }

    return true;
  } catch (error) {
    console.error('Error checking zero tolerance:', error);
    return true;
  }
}

