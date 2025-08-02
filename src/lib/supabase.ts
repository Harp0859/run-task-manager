import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Debug environment variables
console.log('Environment Variables Debug:');
console.log('REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
console.log('supabaseUrl:', supabaseUrl);
console.log('supabaseAnonKey length:', supabaseAnonKey.length);

// Validate environment variables
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Only create client if we have valid credentials
let supabase: any = null;

if (supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl)) {
  console.log('Creating real Supabase client');
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase credentials not configured. Please add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to your .env.local file');
  console.log('URL valid:', isValidUrl(supabaseUrl));
  console.log('URL present:', !!supabaseUrl);
  console.log('Key present:', !!supabaseAnonKey);
  
  // Create a mock client for development
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
      signUp: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
      signOut: () => Promise.resolve(),
      resetPasswordForEmail: () => Promise.resolve({ error: { message: 'Supabase not configured' } })
    }
  };
}

export { supabase };

// Database table types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          text: string;
          completed: boolean;
          is_cleared: boolean;
          created_at: string;
          completed_at?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          text: string;
          completed?: boolean;
          is_cleared?: boolean;
          created_at?: string;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          text?: string;
          completed?: boolean;
          is_cleared?: boolean;
          created_at?: string;
          completed_at?: string;
        };
      };
      user_settings: {
        Row: {
          user_id: string;
          streak_duration: 'daily' | 'weekly' | 'monthly';
          timezone: string;
          theme: 'dark' | 'light';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          streak_duration?: 'daily' | 'weekly' | 'monthly';
          timezone?: string;
          theme?: 'dark' | 'light';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          streak_duration?: 'daily' | 'weekly' | 'monthly';
          timezone?: string;
          theme?: 'dark' | 'light';
          created_at?: string;
          updated_at?: string;
        };
      };
      task_history: {
        Row: {
          id: string;
          user_id: string;
          task_id: string;
          text: string;
          created_at: string;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id: string;
          text: string;
          created_at?: string;
          completed_at: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          task_id?: string;
          text?: string;
          created_at?: string;
          completed_at?: string;
        };
      };
    };
  };
} 