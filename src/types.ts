export interface Task {
  id: string;
  text: string;
  completed: boolean;
  is_cleared: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface TaskHistory {
  id: string;
  text: string;
  completedAt: Date;
  createdAt: Date;
}

export interface Settings {
  streakDuration: 'daily' | 'weekly' | 'monthly';
  showHistory: boolean;
  maxHistoryItems: number;
  timezone: string;
  theme?: 'dark' | 'light';
}

export interface AppState {
  tasks: Task[];
  taskHistory: TaskHistory[];
  monthlyStreak: number;
  dailyStreak: number;
  weeklyStreak: number;
  lastResetDate: string;
  settings: Settings;
}

export interface Theme {
  isDark: boolean;
} 