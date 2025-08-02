import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { TaskHistory } from '../types';
import './EliteStreakCounter.css';

interface HistoryMenuProps {
  history: TaskHistory[];
  onClose: () => void;
}

const HistoryMenu: React.FC<HistoryMenuProps> = ({ history, onClose }) => {
  return (
    <motion.div
      className="history-menu-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      <motion.div
        className="history-menu-container"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="history-menu-header">
          <h2 className="history-menu-title">Recently Completed</h2>
          <button className="history-menu-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        
        <div className="history-list">
          {history.length === 0 ? (
            <div className="history-empty">
              <div className="history-empty-icon">📝</div>
              <p>No completed tasks yet</p>
              <p style={{ fontSize: '12px', opacity: 0.6, marginTop: '8px' }}>
                Complete some tasks to see them here
              </p>
            </div>
          ) : (
            history.map((item, index) => (
              <motion.div
                key={`${item.id}-${item.completedAt}`}
                className="history-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="history-item-text">{item.text}</div>
                <div className="history-item-time">
                  {format(new Date(item.completedAt), 'MMM d, yyyy • h:mm a')}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HistoryMenu; 