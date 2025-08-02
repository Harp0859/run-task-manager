import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Settings as SettingsType } from '../types';
import './Settings.css';

interface SettingsProps {
  settings: SettingsType;
  onSaveSettings: (settings: SettingsType) => void;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSaveSettings, onClose }) => {
  const [localSettings, setLocalSettings] = useState<SettingsType>(settings);

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  const toggleSetting = (key: keyof SettingsType) => {
    if (key === 'showHistory') {
      setLocalSettings(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    }
  };

  const updateStreakDuration = (duration: 'daily' | 'weekly' | 'monthly') => {
    setLocalSettings(prev => ({
      ...prev,
      streakDuration: duration
    }));
  };

  const updateMaxHistoryItems = (value: number) => {
    setLocalSettings(prev => ({
      ...prev,
      maxHistoryItems: Math.max(1, Math.min(20, value))
    }));
  };

  const updateTimezone = (timezone: string) => {
    setLocalSettings(prev => ({
      ...prev,
      timezone
    }));
  };

  return (
    <motion.div
      className="settings-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="settings-container"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="settings-header">
          <h2 className="settings-title">Settings</h2>
          <button className="settings-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">Streak Configuration</h3>
          <div>
            <div
              className={`streak-option ${localSettings.streakDuration === 'daily' ? 'selected' : ''}`}
              onClick={() => updateStreakDuration('daily')}
            >
              <div className="streak-option-radio"></div>
              <div className="streak-option-content">
                <div className="streak-option-title">Daily Streak</div>
                <div className="streak-option-description">Track tasks completed each day</div>
              </div>
            </div>
            
            <div
              className={`streak-option ${localSettings.streakDuration === 'weekly' ? 'selected' : ''}`}
              onClick={() => updateStreakDuration('weekly')}
            >
              <div className="streak-option-radio"></div>
              <div className="streak-option-content">
                <div className="streak-option-title">Weekly Streak</div>
                <div className="streak-option-description">Track tasks completed each week</div>
              </div>
            </div>
            
            <div
              className={`streak-option ${localSettings.streakDuration === 'monthly' ? 'selected' : ''}`}
              onClick={() => updateStreakDuration('monthly')}
            >
              <div className="streak-option-radio"></div>
              <div className="streak-option-content">
                <div className="streak-option-title">Monthly Streak</div>
                <div className="streak-option-description">Track tasks completed each month</div>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">Time & Display</h3>
          
          <div className="settings-option">
            <div>
              <div className="settings-option-label">Timezone</div>
              <div className="settings-option-description">Select your preferred timezone</div>
            </div>
            <select
              className="settings-select"
              value={localSettings.timezone}
              onChange={(e) => updateTimezone(e.target.value)}
            >
              <option value="IST">IST (Indian Standard Time)</option>
              <option value="PST">PST (Pacific Standard Time)</option>
              <option value="EST">EST (Eastern Standard Time)</option>
              <option value="GMT">GMT (Greenwich Mean Time)</option>
              <option value="JST">JST (Japan Standard Time)</option>
            </select>
          </div>

          <div className="settings-option">
            <div>
              <div className="settings-option-label">Show Task History</div>
              <div className="settings-option-description">Display recently completed tasks</div>
            </div>
            <div
              className={`settings-toggle ${localSettings.showHistory ? 'active' : ''}`}
              onClick={() => toggleSetting('showHistory')}
            >
              <div className="settings-toggle-thumb"></div>
            </div>
          </div>

          <div className="settings-option">
            <div>
              <div className="settings-option-label">Max History Items</div>
              <div className="settings-option-description">Number of completed tasks to show</div>
            </div>
            <input
              type="number"
              className="settings-number-input"
              value={localSettings.maxHistoryItems}
              onChange={(e) => updateMaxHistoryItems(parseInt(e.target.value) || 5)}
              min="1"
              max="20"
            />
          </div>
        </div>

        <button className="settings-save-btn" onClick={handleSave}>
          Save Settings
        </button>
      </motion.div>
    </motion.div>
  );
};

export default Settings; 