import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Menu, X, History, Settings as SettingsIcon, User, LogOut } from 'lucide-react';

// Components
import EliteTaskInput from './components/EliteTaskInput';
import TaskList from './components/TaskList';
import EliteStreakCounter from './components/EliteStreakCounter';
import EliteBackground from './components/EliteBackground';
import Settings from './components/Settings';
import HistoryMenu from './components/HistoryMenu';
import Clock from './components/Clock';
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import UserProfile from './components/UserProfile';

// Context and Utils
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Task, AppState, Settings as SettingsType } from './types';
import { 
  loadFromStorage, 
  addToHistory, 
  getCurrentStreak 
} from './utils/storage';
import { 
  saveTask, 
  updateTask, 
  deleteTask as deleteTaskFromDB, 
  loadTasks, 
  loadUserSettings, 
  initializeUserData,
  saveUserStreaks,
  loadTaskHistory,
  clearCompletedTasks,
} from './services/supabaseService';

// Styles
import './App.css';

const AppContent: React.FC = () => {
  // Auth State
  const { user, loading, signOut } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // App State Management
  const [appState, setAppState] = useState<AppState>(() => loadFromStorage());
  const [isInitialized, setIsInitialized] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Calculate streaks from completed tasks AND history (lifetime achievements)
  const calculateStreaks = useCallback((tasks: Task[], taskHistory: any[] = []) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of current week (Sunday)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let dailyStreak = 0;
    let weeklyStreak = 0;
    let monthlyStreak = 0;

    // Count BOTH current completed tasks AND task history for lifetime streaks
    const currentCompletedTasks = tasks.filter(task => task.completed && task.completedAt);
    const allCompletedTasks = [...currentCompletedTasks, ...taskHistory];

    allCompletedTasks.forEach(task => {
      if (!task.completedAt) return; // Skip if no completion date
      
      const completedDate = new Date(task.completedAt);
      const completedDay = new Date(completedDate.getFullYear(), completedDate.getMonth(), completedDate.getDate());
      
      // Daily streak: tasks completed today
      if (completedDay.getTime() === today.getTime()) {
        dailyStreak++;
      }
      
      // Weekly streak: tasks completed this week
      if (completedDate >= startOfWeek && completedDate <= now) {
        weeklyStreak++;
      }
      
      // Monthly streak: tasks completed this month
      if (completedDate >= startOfMonth && completedDate <= now) {
        monthlyStreak++;
      }
    });

    console.log('📊 Lifetime streak calculation:', {
      currentCompletedTasks: currentCompletedTasks.length,
      taskHistoryLength: taskHistory.length,
      totalCompletedTasks: allCompletedTasks.length,
      dailyStreak,
      weeklyStreak,
      monthlyStreak
    });

    return { dailyStreak, weeklyStreak, monthlyStreak };
  }, []);

  // Initialize app and handle daily resets
  useEffect(() => {
    const today = new Date().toDateString();
    const lastReset = appState.lastResetDate;
    
    if (today !== lastReset) {
      // Reset completed tasks for new day
      const updatedTasks = appState.tasks.map(task => ({
        ...task,
        completed: false,
        completedAt: undefined,
      }));
      
      const newState = {
        ...appState,
        tasks: updatedTasks,
        lastResetDate: today,
      };
      setAppState(newState);
    }
    
    setIsInitialized(true);
    
    const welcomeTimer = setTimeout(() => setShowWelcome(false), 3000);
    return () => clearTimeout(welcomeTimer);
  }, [appState.lastResetDate, appState.tasks, appState]);

  // Load user data from Supabase when user logs in
  useEffect(() => {
    if (user && isInitialized) {
      const loadUserData = async () => {
        try {
          // Clear any existing local storage data to ensure fresh start
          localStorage.removeItem('run-task-manager-data');
          
          // Initialize user data if first time
          await initializeUserData(user.id);
          
          // Load tasks from Supabase
          const { data: tasks, error: tasksError } = await loadTasks(user.id);
          if (tasksError) {
            console.error('Failed to load tasks:', tasksError);
          }
          
          // Load user settings from Supabase
          const { data: settings, error: settingsError } = await loadUserSettings(user.id);
          if (settingsError) {
            console.error('Failed to load settings:', settingsError);
          }
          
          // Load task history from Supabase
          const { data: taskHistory, error: historyError } = await loadTaskHistory(user.id);
          if (historyError) {
            console.error('Failed to load task history:', historyError);
          }

          // Calculate streaks from loaded tasks only (no task history table exists)
          const calculatedStreaks = calculateStreaks(tasks || [], taskHistory || []);
          
          // Reset app state with user-specific data
          setAppState({
            tasks: tasks || [],
            taskHistory: taskHistory || [],
            monthlyStreak: calculatedStreaks.monthlyStreak,
            dailyStreak: calculatedStreaks.dailyStreak,
            weeklyStreak: calculatedStreaks.weeklyStreak,
            lastResetDate: new Date().toDateString(),
            settings: settings ? {
              streakDuration: settings.streakDuration,
              timezone: settings.timezone,
              theme: settings.theme,
              showHistory: true,
              maxHistoryItems: 5,
            } : {
              streakDuration: 'monthly',
              timezone: 'IST',
              theme: 'dark',
              showHistory: true,
              maxHistoryItems: 5,
            },
          });
        } catch (error) {
          console.error('Failed to load user data:', error);
        }
      };
      
      loadUserData();
    }
  }, [user, isInitialized, calculateStreaks]);

  // Removed local storage saving since we're using Supabase

  // Task Management Functions
  const addTask = useCallback(async (text: string) => {
    if (!user) return;
    
    // Generate a proper UUID for the task ID
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : ((r & 0x3) | 0x8);
        return v.toString(16);
      });
    };
    
    const newTask: Task = {
      id: generateUUID(),
      text,
      completed: false,
      is_cleared: false,
      createdAt: new Date(),
    };
    
    console.log('🆕 Creating new task with UUID:', newTask.id);
    
    // Save to database first
    const { error } = await saveTask(newTask, user.id);
    if (error) {
      console.error('❌ Failed to save task to database:', error);
      return; // Don't update local state if database save failed
    }
    
    console.log('✅ Task saved to database successfully');
    
    // Update local state only after successful database save
    setAppState(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));
  }, [user]);

  const toggleTaskComplete = useCallback(async (id: string) => {
    if (!user) return;
    
    // Find the current task
    const currentTask = appState.tasks.find(task => task.id === id);
    if (!currentTask) return;
    
    // Calculate the new state
    const completed = !currentTask.completed;
    const updatedTask = {
      ...currentTask,
      completed,
      completedAt: completed ? new Date() : undefined,
    };
    
    console.log('🔄 Toggling task:', currentTask.text, 'to completed:', completed);
    console.log('📊 Current streaks before toggle:', {
      daily: appState.dailyStreak,
      weekly: appState.weeklyStreak,
      monthly: appState.monthlyStreak
    });
    
    // Update in database first
    try {
      const { error } = await updateTask(updatedTask, user.id);
      if (error) {
        console.error('❌ Failed to update task in database:', error);
        return; // Don't update local state if database update failed
      }
      
      console.log('✅ Task updated in database successfully');
      
      // Now update local state after successful database update
      setAppState(prev => {
        const updatedTasks = prev.tasks.map(task => 
          task.id === id ? updatedTask : task
        );

        const toggledTask = updatedTask;
        let newHistory = [...prev.taskHistory];
        
        if (toggledTask && toggledTask.completed && toggledTask.completedAt) {
          console.log('✅ Task completed:', toggledTask.text);
          newHistory = addToHistory(toggledTask, prev.taskHistory);
          console.log('📚 History updated locally:', newHistory.length, 'items');
        }

        // Calculate streaks based on completed tasks and current date
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Start of current week (Sunday)
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Count BOTH current completed tasks AND task history for lifetime streaks
        const currentCompletedTasks = updatedTasks.filter(task => task.completed && task.completedAt);
        const allCompletedTasks = [...currentCompletedTasks, ...prev.taskHistory];

        let dailyStreak = 0;
        let weeklyStreak = 0;
        let monthlyStreak = 0;

        allCompletedTasks.forEach(task => {
          if (!task.completedAt) return; // Skip if no completion date
          
          const completedDate = new Date(task.completedAt);
          const completedDay = new Date(completedDate.getFullYear(), completedDate.getMonth(), completedDate.getDate());
          
          // Daily streak: tasks completed today
          if (completedDay.getTime() === today.getTime()) {
            dailyStreak++;
          }
          
          // Weekly streak: tasks completed this week
          if (completedDate >= startOfWeek && completedDate <= now) {
            weeklyStreak++;
          }
          
          // Monthly streak: tasks completed this month
          if (completedDate >= startOfMonth && completedDate <= now) {
            monthlyStreak++;
          }
        });

        console.log('📊 Lifetime streak calculation:', {
          currentCompletedTasks: currentCompletedTasks.length,
          taskHistoryLength: prev.taskHistory.length,
          totalCompletedTasks: allCompletedTasks.length,
          dailyStreak,
          weeklyStreak,
          monthlyStreak,
          toggledTask: toggledTask?.text,
          action: toggledTask?.completed ? 'COMPLETED' : 'UNCOMPLETED',
          previousStreaks: {
            daily: prev.dailyStreak,
            weekly: prev.weeklyStreak,
            monthly: prev.monthlyStreak
          }
        });

        const updatedState = {
          ...prev,
          tasks: updatedTasks,
          taskHistory: newHistory,
          dailyStreak,
          weeklyStreak,
          monthlyStreak,
        };

        // Save updated streaks to Supabase
        if (toggledTask && toggledTask.completed && toggledTask.completedAt) {
          // Save streaks to Supabase
          saveUserStreaks(user.id, {
            dailyStreak,
            weeklyStreak,
            monthlyStreak,
          });
          
          console.log('💾 Streaks saved to database:', {
            daily: dailyStreak,
            weekly: weeklyStreak,
            monthly: monthlyStreak,
            user: user.id
          });
        }

        return updatedState;
      });
      
    } catch (error) {
      console.error('❌ Error updating task:', error);
    }
  }, [user, appState.tasks, appState.dailyStreak, appState.weeklyStreak, appState.monthlyStreak]);

  const deleteTask = useCallback(async (id: string) => {
    if (!user) return;
    
    console.log('🗑️ Deleting task:', id);
    
    // Delete from database first
    const { error } = await deleteTaskFromDB(id, user.id);
    if (error) {
      console.error('❌ Failed to delete task from database:', error);
      return; // Don't update local state if database delete failed
    }
    
    console.log('✅ Task deleted from database successfully');
    
    // Update local state only after successful database delete
    setAppState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== id),
    }));
  }, [user]);

  const clearCompleted = useCallback(async () => {
    if (!user) return;
    
    // Get completed task IDs
    const completedTaskIds = appState.tasks
      .filter(task => task.completed)
      .map(task => task.id);
    
    console.log('🧹 Clearing completed tasks:', completedTaskIds.length, 'tasks');
    console.log('📊 Current streaks before clear:', {
      daily: appState.dailyStreak,
      weekly: appState.weeklyStreak,
      monthly: appState.monthlyStreak
    });
    console.log('📚 Task history before clear:', appState.taskHistory.length, 'items');
    
    // Clear completed tasks in the database (this will move them to task_history and delete from tasks)
    const { error } = await clearCompletedTasks(user.id);
    if (error) {
      console.error('❌ Failed to clear completed tasks from database:', error);
      return;
    }
    
    console.log('✅ Database clear operation completed successfully');
    
    // Reload tasks from database to ensure local state matches database
    const { data: updatedTasks, error: loadError } = await loadTasks(user.id);
    if (loadError) {
      console.error('❌ Failed to reload tasks after clear:', loadError);
      return;
    }
    
    console.log('📋 Reloaded tasks from database:', updatedTasks?.length || 0);
    
    // Reload task history from database
    const { data: updatedHistory, error: historyError } = await loadTaskHistory(user.id);
    if (historyError) {
      console.error('❌ Failed to reload task history after clear:', historyError);
      return;
    }
    
    console.log('📚 Reloaded task history from database:', updatedHistory?.length || 0);
    
    // Update local state with fresh data from database
    setAppState(prev => {
      // Keep existing streaks - don't reset them when clearing tasks
      const newState = {
        ...prev,
        tasks: updatedTasks || [],
        taskHistory: updatedHistory || prev.taskHistory,
        // Keep existing streaks - they are lifetime
        dailyStreak: prev.dailyStreak,
        weeklyStreak: prev.weeklyStreak,
        monthlyStreak: prev.monthlyStreak,
      };
      
      console.log('✅ Clear completed - Database updated and local state refreshed');
      console.log('📚 Task history from database:', newState.taskHistory.length, 'items');
      console.log('📊 Streaks preserved (lifetime):', {
        daily: prev.dailyStreak,
        weekly: prev.weeklyStreak,
        monthly: prev.monthlyStreak,
        remainingCompletedTasks: (updatedTasks || []).filter(task => task.completed && task.completedAt).length
      });
      
      return newState;
    });
  }, [user, appState.tasks, appState.dailyStreak, appState.weeklyStreak, appState.monthlyStreak, appState.taskHistory.length]);

  // Settings and History Handlers
  const handleSaveSettings = useCallback((newSettings: SettingsType) => {
    setAppState(prev => ({
      ...prev,
      settings: newSettings,
    }));
  }, []);

  const handleCloseHistory = useCallback(() => {
    setShowHistory(false);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setShowSettings(false);
  }, []);

  const handleCloseProfile = useCallback(() => {
    setShowProfile(false);
  }, []);

  // Auth Handlers
  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  // Memoized Calculations
  const currentStreak = useMemo(() => {
    const streak = getCurrentStreak(appState);
    console.log('🎯 Current streak calculated:', {
      streak,
      streakDuration: appState.settings.streakDuration,
      dailyStreak: appState.dailyStreak,
      weeklyStreak: appState.weeklyStreak,
      monthlyStreak: appState.monthlyStreak
    });
    return streak;
  }, [appState]);
  const hasCompletedTasks = useMemo(() => 
    appState.tasks.some(task => task.completed), 
    [appState.tasks]
  );

  // Loading State
  if (loading || !isInitialized) {
    return (
      <div className="elite-loading-container">
        <motion.div
          className="elite-loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="elite-loading-text"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Loading Elite Experience...
        </motion.div>
      </div>
    );
  }

  // Show auth if not logged in
  if (!user) {
    return (
      <div className="elite-app">
        <EliteBackground />
        {authMode === 'login' ? (
          <Login onSwitchToSignUp={() => setAuthMode('signup')} />
        ) : (
          <SignUp onSwitchToLogin={() => setAuthMode('login')} />
        )}
      </div>
    );
  }

  return (
    <div className="elite-app">
      {/* Background and Header Elements */}
      <EliteBackground />
      
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="mobile-header-content">
          <div className="mobile-header-left">
            <motion.button
              className="hamburger-menu-btn"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu size={24} />
            </motion.button>
          </div>
          <div className="mobile-header-right">
            <div className="mobile-streak-counter">
              <EliteStreakCounter
                streakCount={currentStreak}
                streakDuration={appState.settings.streakDuration}
                onShowHistory={() => setShowHistory(true)}
                onShowSettings={() => setShowSettings(true)}
                onShowProfile={() => setShowProfile(true)}
                onSignOut={handleSignOut}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Header */}
      <div className="elite-app-header">
        <div className="elite-header-content">
          <h1 className="elite-app-title">Run</h1>
          <p className="elite-app-subtitle">Master Your Day</p>
          <div className="elite-date-display">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </div>
        </div>
      </div>

      {/* Desktop Clock and Streak Counter */}
      <div className="desktop-header-elements">
        <Clock timezone={appState.settings.timezone} />
        <EliteStreakCounter
          streakCount={currentStreak}
          streakDuration={appState.settings.streakDuration}
          onShowHistory={() => setShowHistory(true)}
          onShowSettings={() => setShowSettings(true)}
          onShowProfile={() => setShowProfile(true)}
          onSignOut={handleSignOut}
        />
      </div>

      {/* Welcome Overlay */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            className="elite-welcome-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="elite-welcome-content"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: -50 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <motion.div
                className="elite-welcome-icon"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✨
              </motion.div>
              <h1 className="elite-welcome-title">Welcome to Run</h1>
              <p className="elite-welcome-subtitle">Your Elite Task Manager</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="elite-app-content">
        <EliteTaskInput onAddTask={addTask} />
        <TaskList
          tasks={appState.tasks}
          onToggleComplete={toggleTaskComplete}
          onDelete={deleteTask}
        />
      </div>

      {/* Action Buttons */}
      <AnimatePresence>
        {hasCompletedTasks && (
          <motion.button
            className="elite-clear-completed-btn"
            onClick={clearCompleted}
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.8 }}
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 8px 25px rgba(255, 255, 255, 0.1)"
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            <X size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showSettings && (
          <Settings
            settings={appState.settings}
            onSaveSettings={handleSaveSettings}
            onClose={handleCloseSettings}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHistory && (
          <HistoryMenu
            history={appState.taskHistory}
            onClose={handleCloseHistory}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProfile && (
          <UserProfile
            user={user}
            onClose={handleCloseProfile}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            className="menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMobileMenu(false)}
          >
            <motion.div
              className="menu-container"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: -50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="menu-header">
                <h3 className="menu-title">Menu</h3>
                <button className="menu-close-btn" onClick={() => setShowMobileMenu(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="menu-items">
                <button 
                  className="menu-item"
                  onClick={() => {
                    setShowMobileMenu(false);
                    setShowHistory(true);
                  }}
                >
                  <History size={18} />
                  <span>Task History</span>
                </button>

                <button 
                  className="menu-item"
                  onClick={() => {
                    setShowMobileMenu(false);
                    setShowSettings(true);
                  }}
                >
                  <SettingsIcon size={18} />
                  <span>Settings</span>
                </button>

                <button 
                  className="menu-item"
                  onClick={() => {
                    setShowMobileMenu(false);
                    setShowProfile(true);
                  }}
                >
                  <User size={18} />
                  <span>Account</span>
                </button>

                <div className="menu-divider"></div>

                <button 
                  className="menu-item menu-item-danger"
                  onClick={() => {
                    setShowMobileMenu(false);
                    handleSignOut();
                  }}
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App; 