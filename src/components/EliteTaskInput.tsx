import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles } from 'lucide-react';
import './EliteTaskInput.css';

interface EliteTaskInputProps {
  onAddTask: (text: string) => void;
}

const EliteTaskInput: React.FC<EliteTaskInputProps> = ({ onAddTask }) => {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      // Haptic feedback simulation
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      onAddTask(text.trim());
      setText('');
      setShowSparkles(true);
      
      setTimeout(() => setShowSparkles(false), 1000);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && document.activeElement === inputRef.current) {
        if (navigator.vibrate) {
          navigator.vibrate(30);
        }
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    return () => document.removeEventListener('keypress', handleKeyPress);
  }, []);

  return (
    <motion.div
      className="elite-task-input-container"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <form onSubmit={handleSubmit} className="elite-task-input-form">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="What's your next task?"
          className="elite-task-input-field"
          disabled={false}
        />
        
        <AnimatePresence>
          {text.trim() && (
            <motion.button
              type="submit"
              className="elite-task-input-btn"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 6px 20px rgba(34, 197, 94, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Plus size={18} />
            </motion.button>
          )}
        </AnimatePresence>
      </form>

      <AnimatePresence>
        {showSparkles && (
          <motion.div
            className="sparkles-container"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles size={24} className="sparkles-icon" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EliteTaskInput; 