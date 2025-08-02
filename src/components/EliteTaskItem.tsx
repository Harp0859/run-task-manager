import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Zap, Star } from 'lucide-react';
import { Task } from '../types';
import './EliteTaskItem.css';

interface EliteTaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  index: number;
}

const EliteTaskItem: React.FC<EliteTaskItemProps> = ({ 
  task, 
  onToggleComplete, 
  onDelete, 
  index 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleComplete = () => {
    if (!task.completed) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([50, 25, 50]);
      }
    }
    onToggleComplete(task.id);
  };

  const handleDelete = () => {
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    onDelete(task.id);
  };

  return (
    <motion.div
      className="elite-task-item"
      initial={{ opacity: 0, x: -50, rotateY: -15 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      exit={{ opacity: 0, x: 50, rotateY: 15 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ 
        scale: 1.02,
        rotateY: 2,
        z: 20
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        className={`elite-task-content ${task.completed ? 'completed' : ''}`}
        animate={{
          boxShadow: isHovered 
            ? "0 8px 32px rgba(34, 197, 94, 0.2)" 
            : "0 4px 16px rgba(0, 0, 0, 0.1)"
        }}
        transition={{ duration: 0.2 }}
      >
        <motion.button
          className="elite-complete-button"
          onClick={handleComplete}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            background: task.completed 
              ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" 
              : "transparent"
          }}
        >
          <AnimatePresence mode="wait">
            {task.completed ? (
              <motion.div
                key="check"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
                className="check-icon"
              >
                <Check size={16} />
              </motion.div>
            ) : (
              <motion.div
                key="circle"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
                className="circle-icon"
              />
            )}
          </AnimatePresence>
        </motion.button>
        
        <motion.span 
          className="elite-task-text"
          animate={{
            textDecoration: task.completed ? "line-through" : "none",
            color: task.completed ? "rgba(255, 255, 255, 0.6)" : "#ffffff"
          }}
          transition={{ duration: 0.3 }}
        >
          {task.text}
        </motion.span>
        
        <motion.button
          className="elite-delete-button"
          onClick={handleDelete}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          <X size={16} />
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showConfetti && (
          <motion.div
            className="confetti-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="confetti-piece"
                initial={{ 
                  x: 0, 
                  y: 0, 
                  rotate: 0,
                  opacity: 1 
                }}
                animate={{ 
                  x: (Math.random() - 0.5) * 200,
                  y: -100 - Math.random() * 100,
                  rotate: Math.random() * 360,
                  opacity: 0
                }}
                transition={{ 
                  duration: 1.5,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
                style={{
                  background: ['#22c55e', '#3b82f6', '#fbbf24', '#ef4444'][i % 4]
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EliteTaskItem; 