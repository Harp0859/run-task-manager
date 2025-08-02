import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, User, Mail, Phone, UserCircle, Save } from 'lucide-react';
import { saveUserProfile, loadUserProfile } from '../services/supabaseService';
import './UserProfile.css';

interface UserProfileProps {
  user: {
    email?: string;
    id: string;
  };
  onClose: () => void;
}

interface UserData {
  name: string;
  email: string;
  phone: string;
  bio: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onClose }) => {
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: user.email || '',
    phone: '',
    bio: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      const { data, error } = await loadUserProfile(user.id);
      if (!error && data) {
        setUserData({
          name: data.name || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          bio: data.bio || '',
        });
      }
    };
    loadProfile();
  }, [user.id, user.email]);

  const handleSave = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const { error } = await saveUserProfile(user.id, userData);
      if (error) {
        setMessage('Error saving profile: ' + error.message);
      } else {
        setMessage('Profile saved successfully!');
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      setMessage('Error saving profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="user-profile-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="user-profile-container"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: -50 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="user-profile-header">
          <h2 className="user-profile-title">Profile Settings</h2>
          <button className="user-profile-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="user-profile-content">
          <div className="user-profile-avatar">
            <UserCircle size={64} />
          </div>

          <div className="user-profile-form">
            <div className="form-group">
              <label>
                <User size={16} />
                Full Name
              </label>
              <input
                type="text"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label>
                <Mail size={16} />
                Email
              </label>
              <input
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label>
                <Phone size={16} />
                Phone Number
              </label>
              <input
                type="tel"
                value={userData.phone}
                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={userData.bio}
                onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>
          </div>

          <div className="user-profile-actions">
            {message && (
              <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}
            <button className="save-btn" onClick={handleSave} disabled={isLoading}>
              <Save size={16} />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserProfile; 