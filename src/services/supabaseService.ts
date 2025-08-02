import { supabase } from '../lib/supabase';
import { Task, Settings as SettingsType, TaskHistory } from '../types';

// Task Operations
export const saveTask = async (task: Task, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        text: task.text,
        completed: task.completed,
        is_cleared: task.is_cleared || false,
        created_at: task.createdAt.toISOString(),
        completed_at: task.completedAt?.toISOString(),
      });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error saving task:', error);
    return { data: null, error };
  }
};

export const updateTask = async (task: Task, userId: string) => {
  try {
    console.log('🔄 Updating task in database:', {
      id: task.id,
      text: task.text,
      completed: task.completed,
      is_cleared: task.is_cleared,
      completedAt: task.completedAt?.toISOString(),
      userId: userId
    });

    const { data, error } = await supabase
      .from('tasks')
      .update({
        text: task.text,
        completed: task.completed,
        is_cleared: task.is_cleared,
        completed_at: task.completedAt?.toISOString(),
      })
      .eq('id', task.id)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error updating task in database:', error);
      throw error;
    }

    console.log('✅ Task updated successfully in database:', {
      id: task.id,
      completed: task.completed,
      is_cleared: task.is_cleared,
      data: data
    });

    return { data, error: null };
  } catch (error) {
    console.error('❌ Error updating task:', error);
    return { data: null, error };
  }
};

export const deleteTask = async (taskId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting task:', error);
    return { error };
  }
};

export const clearCompletedTasks = async (userId: string) => {
  try {
    console.log('🔄 Starting clearCompletedTasks for user:', userId);
    
    // Get all completed tasks that are not yet cleared
    const { data: completedTasks, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true)
      .eq('is_cleared', false);

    if (fetchError) {
      console.error('❌ Error fetching completed tasks:', fetchError);
      throw fetchError;
    }

    console.log('📋 Found completed tasks to clear:', completedTasks?.length || 0);

    if (completedTasks && completedTasks.length > 0) {
      // Move completed tasks to task_history
      const historyData = completedTasks.map((task: any) => ({
        user_id: userId,
        task_id: task.id,
        text: task.text,
        created_at: task.created_at,
        completed_at: task.completed_at,
      }));

      console.log('📚 Moving to task_history:', historyData.length, 'tasks');

      // Insert into task_history
      const { error: historyError } = await supabase
        .from('task_history')
        .insert(historyData);

      if (historyError) {
        console.error('❌ Error moving to task_history:', historyError);
        throw historyError;
      }

      console.log('✅ Successfully moved to task_history');

      // Mark tasks as cleared instead of deleting them
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ is_cleared: true })
        .eq('user_id', userId)
        .eq('completed', true)
        .eq('is_cleared', false);

      if (updateError) {
        console.error('❌ Error marking tasks as cleared:', updateError);
        throw updateError;
      }

      console.log('✅ Successfully marked tasks as cleared');
    } else {
      console.log('ℹ️ No completed tasks found to clear');
    }

    return { error: null };
  } catch (error) {
    console.error('❌ Error in clearCompletedTasks:', error);
    return { error };
  }
};

export const loadTasks = async (userId: string) => {
  try {
    // First, try to load all tasks without the is_cleared filter
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading tasks:', error);
      return { data: [], error };
    }

    // Convert database format to app format
    const tasks: Task[] = data?.map((dbTask: any) => ({
      id: dbTask.id,
      text: dbTask.text,
      completed: dbTask.completed,
      is_cleared: dbTask.is_cleared || false, // Default to false if column doesn't exist
      createdAt: new Date(dbTask.created_at),
      completedAt: dbTask.completed_at ? new Date(dbTask.completed_at) : undefined,
    })) || [];

    // Filter out cleared tasks if the column exists
    const activeTasks = tasks.filter(task => !task.is_cleared);

    console.log('📋 Loaded tasks from database:', {
      totalTasks: tasks.length,
      activeTasks: activeTasks.length,
      hasIsClearedColumn: tasks.some(task => 'is_cleared' in task)
    });

    return { data: activeTasks, error: null };
  } catch (error) {
    console.error('Error loading tasks:', error);
    return { data: [], error };
  }
};

// User Settings Operations
export const saveUserSettings = async (settings: SettingsType, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        streak_duration: settings.streakDuration,
        timezone: settings.timezone,
        theme: settings.theme || 'dark',
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error saving user settings:', error);
    return { data: null, error };
  }
};

export const loadUserSettings = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

    if (data) {
      return {
        data: {
          streakDuration: data.streak_duration,
          timezone: data.timezone,
          theme: data.theme,
        },
        error: null,
      };
    } else {
      // Return default settings if no settings found
      return {
        data: {
          streakDuration: 'monthly',
          timezone: 'IST',
          theme: 'dark',
        },
        error: null,
      };
    }
  } catch (error) {
    console.error('Error loading user settings:', error);
    return {
      data: {
        streakDuration: 'monthly',
        timezone: 'IST',
        theme: 'dark',
      },
      error,
    };
  }
};

// Initialize user data in Supabase
export const initializeUserData = async (userId: string) => {
  try {
    // Create default user settings
    await saveUserSettings({
      streakDuration: 'monthly',
      timezone: 'IST',
      theme: 'dark',
      showHistory: true,
      maxHistoryItems: 5,
    }, userId);

    return { error: null };
  } catch (error) {
    console.error('Error initializing user data:', error);
    return { error };
  }
};

// Streak Management
export const saveUserStreaks = async (userId: string, streaks: {
  dailyStreak: number;
  weeklyStreak: number;
  monthlyStreak: number;
}) => {
  try {
    const { data, error } = await supabase
      .from('user_streaks')
      .upsert({
        user_id: userId,
        daily_streak: streaks.dailyStreak,
        weekly_streak: streaks.weeklyStreak,
        monthly_streak: streaks.monthlyStreak,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error saving user streaks:', error);
    return { data: null, error };
  }
};

// User Profile Management
export const saveUserProfile = async (userId: string, profile: {
  name: string;
  email: string;
  phone: string;
  bio: string;
}) => {
  try {
    // First, update the user's email in authentication if it changed
    const { data: currentUser } = await supabase.auth.getUser();
    if (currentUser.user && currentUser.user.email !== profile.email) {
      const { error: authError } = await supabase.auth.updateUser({
        email: profile.email
      });
      if (authError) {
        console.error('Error updating auth email:', authError);
        return { data: null, error: authError };
      }
    }

    // Then save to user_profiles table
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        bio: profile.bio,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error saving user profile:', error);
    return { data: null, error };
  }
};

export const loadUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

    if (data) {
      return {
        data: {
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          bio: data.bio || '',
        },
        error: null,
      };
    } else {
      // Return default profile if no profile found
      return {
        data: {
          name: '',
          email: '',
          phone: '',
          bio: '',
        },
        error: null,
      };
    }
  } catch (error) {
    console.error('Error loading user profile:', error);
    return {
      data: {
        name: '',
        email: '',
        phone: '',
        bio: '',
      },
      error,
    };
  }
};

export const loadUserStreaks = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

    if (data) {
      return {
        data: {
          dailyStreak: data.daily_streak || 0,
          weeklyStreak: data.weekly_streak || 0,
          monthlyStreak: data.monthly_streak || 0,
        },
        error: null,
      };
    } else {
      // Return default streaks if no streaks found
      return {
        data: {
          dailyStreak: 0,
          weeklyStreak: 0,
          monthlyStreak: 0,
        },
        error: null,
      };
    }
  } catch (error) {
    console.error('Error loading user streaks:', error);
    return {
      data: {
        dailyStreak: 0,
        weeklyStreak: 0,
        monthlyStreak: 0,
      },
      error,
    };
  }
};

// Task History Operations
export const saveTaskHistory = async (taskHistory: TaskHistory[], userId: string) => {
  try {
    // First, clear existing history for this user
    const { error: deleteError } = await supabase
      .from('task_history')
      .delete()
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    // Then insert new history items
    if (taskHistory.length > 0) {
      const historyData = taskHistory.map(item => ({
        user_id: userId,
        task_id: item.id,
        text: item.text,
        created_at: item.createdAt.toISOString(),
        completed_at: item.completedAt.toISOString(),
      }));

      const { error: insertError } = await supabase
        .from('task_history')
        .insert(historyData);

      if (insertError) throw insertError;
    }

    return { error: null };
  } catch (error) {
    console.error('Error saving task history:', error);
    return { error };
  }
};

export const loadTaskHistory = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('task_history')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    // Convert database format to app format
    const taskHistory: TaskHistory[] = data?.map((dbItem: any) => ({
      id: dbItem.task_id,
      text: dbItem.text,
      createdAt: new Date(dbItem.created_at),
      completedAt: new Date(dbItem.completed_at),
    })) || [];

    return { data: taskHistory, error: null };
  } catch (error) {
    console.error('Error loading task history:', error);
    return { data: [], error };
  }
}; 