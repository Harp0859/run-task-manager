import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import './StreakCounter.css';

interface StreakCounterProps {
  count: number;
}

const StreakCounter: React.FC<StreakCounterProps> = ({ count }) => {
  const getStreakColor = (count: number) => {
    if (count >= 50) return '#fbbf24'; // Gold
    if (count >= 30) return '#f97316'; // Orange
    if (count >= 20) return '#ef4444'; // Red
    if (count >= 10) return '#22c55e'; // Green
    return '#3b82f6'; // Blue
  };

  const getStreakMessage = (count: number) => {
    if (count >= 50) return '🔥 Legendary';
    if (count >= 30) return '🔥 On Fire';
    if (count >= 20) return '🔥 Hot Streak';
    if (count >= 10) return '🔥 Getting There';
    return '🔥 Getting Started';
  };

  return (
    <motion.div
      className="streak-counter"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="streak-content"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <div className="streak-icon">
          <Flame size={20} color={getStreakColor(count)} />
        </div>
        <div className="streak-info">
          <div className="streak-count">{count}</div>
          <div className="streak-label">Tasks This Month</div>
          <div className="streak-message">{getStreakMessage(count)}</div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StreakCounter; 