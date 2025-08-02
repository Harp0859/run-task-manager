import { AppState, Task, TaskHistory } from '../types';

const STORAGE_KEY = 'run-task-manager-data';

// Storage Management
export const saveToStorage = (data: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const loadFromStorage = (): AppState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      
      // Convert date strings back to Date objects
      if (data.tasks) {
        data.tasks = data.tasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        }));
      }
      
      if (data.taskHistory) {
        data.taskHistory = data.taskHistory.map((item: any) => ({
          ...item,
          completedAt: new Date(item.completedAt),
        }));
      } else {
        data.taskHistory = [];
      }
      
      if (!data.settings) {
        data.settings = {
          streakDuration: 'monthly',
          showHistory: true,
          maxHistoryItems: 5,
          timezone: 'IST', // Default timezone
        };
      }
      
      if (!data.dailyStreak) data.dailyStreak = 0;
      if (!data.weeklyStreak) data.weeklyStreak = 0;
      if (!data.monthlyStreak) data.monthlyStreak = 0;
      
      return data;
    }
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
  }
  
  // Return default state if no stored data or error
  return {
    tasks: [],
    taskHistory: [],
    monthlyStreak: 0,
    dailyStreak: 0,
    weeklyStreak: 0,
    lastResetDate: new Date().toDateString(),
    settings: {
      streakDuration: 'monthly',
      showHistory: true,
      maxHistoryItems: 5,
      timezone: 'IST',
    },
  };
};

// Task Management Functions
export const clearCompletedTasks = (tasks: Task[]): Task[] => {
  return tasks.filter(task => !task.completed);
};

export const resetDailyTasks = (tasks: Task[]): Task[] => {
  return tasks.map(task => ({
    ...task,
    completed: false,
    completedAt: undefined,
  }));
};

export const addToHistory = (task: Task, history: TaskHistory[]): TaskHistory[] => {
  const newHistoryItem: TaskHistory = {
    id: task.id,
    text: task.text,
    createdAt: task.createdAt,
    completedAt: task.completedAt!,
  };
  
  const updatedHistory = [newHistoryItem, ...history];
  
  // Keep only the last 10 items
  return updatedHistory.slice(0, 10);
};

// Streak Management
export const getCurrentStreak = (appState: AppState): number => {
  switch (appState.settings.streakDuration) {
    case 'daily':
      return appState.dailyStreak;
    case 'weekly':
      return appState.weeklyStreak;
    case 'monthly':
      return appState.monthlyStreak;
    default:
      return appState.monthlyStreak;
  }
};

// Timezone Utilities
export const getTimeInTimezone = (timezone: string): Date => {
  const now = new Date();
  switch (timezone) {
    case 'IST':
      return new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    case 'PST':
      return new Date(now.getTime() - (8 * 60 * 60 * 1000));
    case 'EST':
      return new Date(now.getTime() - (5 * 60 * 60 * 1000));
    case 'GMT':
      return new Date(now.getTime());
    case 'JST':
      return new Date(now.getTime() + (9 * 60 * 60 * 1000));
    default:
      return new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // Default to IST
  }
}; 