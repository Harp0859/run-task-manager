import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Menu, X, History, Settings, User, LogOut } from 'lucide-react';
import './EliteStreakCounter.css';

interface EliteStreakCounterProps {
  streakCount: number;
  streakDuration: 'daily' | 'weekly' | 'monthly';
  onShowHistory: () => void;
  onShowSettings: () => void;
  onShowProfile: () => void;
  onSignOut: () => void;
}

const EliteStreakCounter: React.FC<EliteStreakCounterProps> = ({
  streakCount,
  streakDuration,
  onShowHistory,
  onShowSettings,
  onShowProfile,
  onSignOut,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getStreakText = () => {
    switch (streakDuration) {
      case 'daily':
        return 'Daily Tasks';
      case 'weekly':
        return 'Weekly Tasks';
      case 'monthly':
        return 'Monthly Tasks';
      default:
        return 'Monthly Tasks';
    }
  };

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  const handleMenuAction = (action: () => void) => {
    setShowMenu(false);
    action();
  };

  return (
    <>
      {/* Streak Counter */}
      <motion.div
        className="elite-streak-counter"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
      >
        <Flame className="streak-icon" size={18} />
        <div className="streak-content">
          <div className="streak-count">{streakCount}</div>
          <div className="streak-text">{getStreakText()}</div>
        </div>
      </motion.div>

      {/* Hamburger Menu Button */}
      <motion.button
        className="hamburger-menu-btn"
        onClick={handleMenuToggle}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Menu size={20} />
      </motion.button>

      {/* Menu Overlay */}
      {showMenu && (
        <motion.div
          className="menu-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowMenu(false)}
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
              <button className="menu-close-btn" onClick={() => setShowMenu(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="menu-items">
              <button 
                className="menu-item"
                onClick={() => handleMenuAction(onShowHistory)}
              >
                <History size={18} />
                <span>Task History</span>
              </button>

              <button 
                className="menu-item"
                onClick={() => handleMenuAction(onShowSettings)}
              >
                <Settings size={18} />
                <span>Settings</span>
              </button>

              <button 
                className="menu-item"
                onClick={() => handleMenuAction(onShowProfile)}
              >
                <User size={18} />
                <span>Account</span>
              </button>

              <div className="menu-divider"></div>

              <button 
                className="menu-item menu-item-danger"
                onClick={() => handleMenuAction(onSignOut)}
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default EliteStreakCounter; 